import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API Key is missing. Please add it to your .env.local file." }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Convert Blob to File object which OpenAI SDK expects
    const audioFile = new File([file], "audio.webm", { type: file.type });

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Transcription Error:", error);
    return NextResponse.json({ error: error.message || "Failed to transcribe audio" }, { status: 500 });
  }
}
