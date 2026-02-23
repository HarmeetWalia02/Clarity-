export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not set" },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You simplify academic content for students with learning difficulties.",
        },
        {
          role: "user",
          content: `
Rewrite the following content in very simple language.
Use short sentences.
Use easy words.
Give small examples where helpful.
Keep headings (##) format.

${text}
          `,
        },
      ],
    });

    return NextResponse.json({
      result: completion.choices[0]?.message?.content,
    });

  } catch (error: any) {
    console.error("SIMPLIFY ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
