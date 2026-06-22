import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, mkdir, readFile, rm } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const tempDir = join(process.cwd(), "temp-uploads", Date.now().toString());
    await mkdir(tempDir, { recursive: true });

    const inputPath = join(tempDir, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, buffer);

    const outDir = join(tempDir, "graphify-out");

    return new Promise<NextResponse>((resolve) => {
      const activate = `source ${join(process.cwd(), "venv", "bin", "activate")}`;
      const cmd = `${activate} && graphify extract ${inputPath} --backend ollama --out ${outDir}`;

      const proc = spawn("bash", ["-c", cmd], {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"]
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => { stdout += data.toString(); });
      proc.stderr.on("data", (data) => { stderr += data.toString(); });

      proc.on("close", async (code) => {
        try {
          if (code !== 0) {
            resolve(NextResponse.json({ error: "Graphify extraction failed", details: stderr }, { status: 500 }));
            return;
          }

          const graphPath = join(outDir, "graph.json");
          const graphData = JSON.parse(await readFile(graphPath, "utf-8"));

          await rm(tempDir, { recursive: true, force: true });

          resolve(NextResponse.json({
            success: true,
            nodes: graphData.nodes,
            edges: graphData.links,
            nodeCount: graphData.nodes.length,
            edgeCount: graphData.links.length,
            communities: [...new Set(graphData.nodes.map((n: any) => n.community))]
          }));
        } catch (e: any) {
          resolve(NextResponse.json({ error: "Failed to parse graph", details: e.message }, { status: 500 }));
        }
      });
    });

  } catch (error: any) {
    console.error("Graphify document error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}