import { NextRequest, NextResponse } from "next/server";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { initVectorStore } from "@/lib/qdrant";
import { getDocumentProxy, extractText } from "unpdf";
import { Document } from "@langchain/core/documents";

/**
 * Serverless-optimized PDF Upload Route.
 * Processes files in-memory using unpdf (ESM-native, no workers).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 1. Convert File to Buffer/ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // 2. Parse PDF text in-memory using unpdf
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { text } = await extractText(pdf, { mergePages: true });
    
    // 3. Create a LangChain Document from the extracted text
    const fullDoc = new Document({
      pageContent: text,
      metadata: {
        title: file.name,
        totalPages: pdf.numPages,
      },
    });

    // 4. Explicit Chunking Strategy
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.splitDocuments([fullDoc]);

    // 5. Embed and store in Qdrant
    await initVectorStore(docs);

    return NextResponse.json({ 
      message: "File processed in-memory and stored successfully", 
      chunks: docs.length 
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to process file" }, { status: 500 });
  }
}
