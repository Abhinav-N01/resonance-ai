import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key is missing." }, { status: 500 });
    }

    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });

    return NextResponse.json({ embedding: response.embeddings[0].values });
  } catch (error: any) {
    console.error("Embedding Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate embedding" }, { status: 500 });
  }
}
