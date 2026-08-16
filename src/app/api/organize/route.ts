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

    const prompt = `You are an ADHD assistant organizing a chaotic brain dump.
Read the following raw transcription and categorize the thoughts into three arrays:
1. "tasks": Actionable to-do items.
2. "events": Calendar events or things with dates/times.
3. "ideas": Random thoughts, musings, or notes worth keeping.

Return ONLY a JSON object with this exact structure:
{
  "tasks": ["Task 1", "Task 2"],
  "events": ["Event 1"],
  "ideas": ["Idea 1"]
}
Do NOT include markdown formatting like \`\`\`json.

Raw Brain Dump:
"${text}"
`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });
    } catch (e: any) {
      if (e.status === 503 || e.message?.includes("503")) {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
        });
      } else {
        throw e;
      }
    }

    const rawResult = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
    const organizedData = JSON.parse(rawResult || '{"tasks":[],"events":[],"ideas":[]}');

    // Generate embeddings for all items so they can be saved to the local vector DB
    const allItems = [
      ...(organizedData.tasks || []).map((t: string) => ({ text: t, category: 'tasks' })),
      ...(organizedData.events || []).map((t: string) => ({ text: t, category: 'events' })),
      ...(organizedData.ideas || []).map((t: string) => ({ text: t, category: 'ideas' }))
    ];

    const itemsWithEmbeddings = await Promise.all(allItems.map(async (item) => {
      const embRes = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: item.text,
      });
      return { ...item, embedding: embRes.embeddings?.[0]?.values || [] };
    }));

    return NextResponse.json({ organizedData, itemsWithEmbeddings });

  } catch (error: any) {
    console.error("Organize Error:", error);
    return NextResponse.json({ error: error.message || "Failed to organize thoughts" }, { status: 500 });
  }
}
