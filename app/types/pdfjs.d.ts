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
            "You are an academic assistant that structures study material clearly.",
        },
        {
          role: "user",
          content: `
Below is academic content:

${text}

Please provide:
1. Clean readable version
2. Bullet summary
3. Key concepts
4. Important definitions
5. 5 exam questions.
          `,
        },
      ],
    });

    return NextResponse.json({
      result: completion.choices[0]?.message?.content,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
