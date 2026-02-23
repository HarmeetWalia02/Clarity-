export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not set" },
        { status: 500 }
      );
    }

    const { text, targetLanguage } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a professional translator. Maintain formatting exactly.",
        },
        {
          role: "user",
          content: `
Translate the following content into ${targetLanguage}.
Preserve headings (##), bullet points, and numbering exactly.

${text}
          `,
        },
      ],
    });

    return NextResponse.json({
      result: completion.choices[0]?.message?.content,
    });

  } catch (error: any) {
    console.error("TRANSLATE ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
