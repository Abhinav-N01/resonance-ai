import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { goal, energy, isOverwhelmed, currentTasks } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key is missing. Please add it to your .env.local file." }, { status: 500 });
    }

    let prompt = "";

    if (isOverwhelmed) {
      prompt = `The user with ADHD is feeling overwhelmed by their current task list for the goal: "${goal}". 
Their energy level is ${energy}% (0=exhausted, 100=energized).
Their current tasks are: ${JSON.stringify(currentTasks)}.
Please provide a SINGLE, extremely tiny, ridiculously easy "micro-action" they can do right now to build momentum. It should be smaller than any of the current tasks.
Return ONLY a JSON array containing one object with a 'title' string property. Do not include markdown formatting like \`\`\`json.`;
    } else {
      prompt = `The user with ADHD wants to tackle the goal: "${goal}".
Their energy level is ${energy}% (0=exhausted, 100=energized).
Please break this goal down into 3-5 manageable, specific micro-steps. If energy is low, make the steps incredibly small and easy.
Return ONLY a JSON array of objects, where each object has a 'title' string property. Do not include markdown formatting like \`\`\`json.`;
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });
    } catch (e: any) {
      if (e.status === 503 || e.message?.includes("503")) {
        console.warn("High demand, falling back to gemini-3.5-flash");
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
        });
      } else {
        throw e;
      }
    }

    const text = response.text?.replace(/```json/g, "").replace(/```/g, "").trim();
    const tasks = JSON.parse(text || "[]");

    return NextResponse.json({ tasks });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate tasks" }, { status: 500 });
  }
}
