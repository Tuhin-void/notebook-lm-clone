"use client";

import { useState } from "react";
import { Upload, Send, FileText, Loader2, Bot, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function NotebookLMClone() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatus("Analyzing document...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Successfully processed ${data.chunks} chunks!`);
        setMessages([{ role: "bot", content: "Document loaded. How can I help you today?" }]);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus("Upload failed. Please check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatting) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsChatting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", content: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "Failed to get response." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Bot size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">NotebookLM</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Source Document
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-colors",
                file ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-slate-400"
              )}
            >
              {file ? (
                <FileText className="text-indigo-600" size={32} />
              ) : (
                <Upload className="text-slate-400" size={32} />
              )}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                id="pdf-upload"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="pdf-upload"
                className="text-sm font-medium text-slate-600 cursor-pointer hover:text-indigo-600"
              >
                {file ? file.name : "Click to upload PDF"}
              </label>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
          >
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {isUploading ? "Processing..." : "Process Document"}
          </button>

          {status && (
            <p className={cn("text-xs text-center font-medium", status.startsWith("Error") ? "text-red-500" : "text-indigo-600")}>
              {status}
            </p>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            Built with Next.js, LangChain, and Qdrant. Answers are strictly grounded in the uploaded document.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <Bot size={64} className="opacity-20" />
              <p className="text-lg font-medium">Upload a PDF to start chatting</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-indigo-600"
                  )}
                >
                  {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div
                  className={cn(
                    "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white border border-slate-200 rounded-tl-none text-slate-700"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isChatting && (
            <div className="flex gap-4 max-w-3xl mx-auto animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Bot size={20} className="text-indigo-400" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-none w-24 flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 pt-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
          <form
            onSubmit={handleChat}
            className="max-w-3xl mx-auto relative group"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your document..."
              disabled={messages.length === 0 || isChatting}
              className="w-full pl-6 pr-14 py-4 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isChatting || messages.length === 0}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
