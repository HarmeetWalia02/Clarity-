export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You generate multiple choice questions strictly in JSON format.",
        },
        {
          role: "user",
          content: `
Create 5 multiple choice questions from the following content.

Return ONLY valid JSON.
No markdown.
No explanation.
No backticks.

Format:

[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "answer": 0
  }
]

Content:
${text}
          `,
        },
      ],
    });

    let raw = completion.choices[0]?.message?.content || "[]";

    // 🔥 Remove markdown code blocks if present
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    // 🔥 Extract only the JSON array portion
    const firstBracket = raw.indexOf("[");
    const lastBracket = raw.lastIndexOf("]");

    if (firstBracket !== -1 && lastBracket !== -1) {
      raw = raw.substring(firstBracket, lastBracket + 1);
    }

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error("JSON PARSE ERROR:", raw);
      return NextResponse.json(
        { error: "Invalid quiz format returned by model" },
        { status: 500 }
      );
    }

    return NextResponse.json({ quiz: parsed });

  } catch (error: any) {
    console.error("QUIZ ERROR:", error);
    return NextResponse.json(
      { error: "Quiz generation failed" },
      { status: 500 }
    );
  }
}
