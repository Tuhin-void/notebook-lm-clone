# NotebookLM Clone - University Assignment

A production-ready RAG (Retrieval-Augmented Generation) application built with Next.js, LangChain, and Qdrant. This project is optimized for Vercel deployment and uses 100% free-tier APIs.

## 🚀 Features

- **Dynamic PDF Upload**: Process documents in-memory (serverless-friendly).
- **Advanced RAG Pipeline**: Uses `RecursiveCharacterTextSplitter` for semantic chunking.
- **Free Stack**:
  - **LLM**: Groq (Llama 3 8B) for lightning-fast, grounded responses.
  - **Embeddings**: Hugging Face (`all-MiniLM-L6-v2`) via Inference API.
  - **Vector Store**: Qdrant Cloud (Managed).
- **Grounded Intelligence**: Strict system prompts ensure the AI only answers based on the provided document.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router, TypeScript, Tailwind CSS)
- **Orchestration**: LangChain.js
- **UI Components**: Lucide React, Tailwind Merge

## 📋 Prerequisites

You will need the following API keys:
1. [Groq API Key](https://console.groq.com/) (Free)
2. [Hugging Face Token](https://huggingface.co/settings/tokens) (Free)
3. [Qdrant Cloud Cluster](https://cloud.qdrant.io/) (Free Tier)

## ⚙️ Setup

1. **Clone and Install**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root:
   ```env
   GROQ_API_KEY=your_key
   HUGGINGFACE_API_KEY=your_key
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_key
   QDRANT_COLLECTION_NAME=notebook_lm_clone
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🚢 Deployment

This project is optimized for **Vercel**:
1. Push to GitHub.
2. Import to Vercel.
3. Add the environment variables in the Vercel dashboard.
4. Deploy! No `fs` or local storage dependencies.

## 📝 Assignment Requirements Fulfilled

- [x] **Dynamic File Upload**: UI-based PDF processing.
- [x] **Explicit Chunking**: Documented strategy in `api/upload/route.ts`.
- [x] **Vector Database**: Qdrant Cloud integration.
- [x] **Grounded Generation**: Llama 3 via Groq with strict refusal logic.
- [x] **Deployability**: Fully compatible with Vercel Serverless Functions.
