import { NextRequest, NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { getVectorStore } from "@/lib/qdrant";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Initialize Vector Store and Model (Groq Llama 3.1)
    const vectorStore = await getVectorStore();
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      temperature: 0,
    });

    // 2. Retrieve top-K chunks
    const retriever = vectorStore.asRetriever(4);
    const contextDocs = await retriever.invoke(message);
    const context = contextDocs.map(doc => doc.pageContent).join("\n\n");

    // 3. Grounded Generation Prompt (STRICT)
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions strictly based on the provided document context.

Rules:
1. Use ONLY the provided context to answer.
2. If the answer is not in the document, reply: "I cannot answer this based on the provided document."
3. Do not use outside knowledge.
4. Keep the answer concise and professional.

Context:
{context}

Question:
{question}

Answer:
`);

    // 4. Create Chain
    const chain = RunnableSequence.from([
      {
        context: () => context,
        question: (input: any) => input.question,
      },
      promptTemplate,
      model,
      new StringOutputParser(),
    ]);

    // 5. Run Chain
    const response = await chain.invoke({ question: message });

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate response" }, { status: 500 });
  }
}
