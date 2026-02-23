export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const PDFParser = require("pdf2json");

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not set" },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfParser = new PDFParser();

    const text: string = await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData: any) =>
        reject(errData.parserError)
      );

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        let extractedText = "";

        pdfData.Pages.forEach((page: any) => {
          page.Texts.forEach((textItem: any) => {
            textItem.R.forEach((r: any) => {
              extractedText += decodeURIComponent(r.T) + " ";
            });
          });
        });

        resolve(extractedText);
      });

      pdfParser.parseBuffer(buffer);
    });

    const limitedText = text.slice(0, 8000);

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

${limitedText}

Format your response EXACTLY like this:

## CLEAN VERSION
<clear rewritten content>

## SUMMARY
- bullet point
- bullet point

## KEY CONCEPTS
- Concept: explanation
- Concept: explanation

## DEFINITIONS
- Term: definition
- Term: definition

## EXAM QUESTIONS
1. Question
2. Question
3. Question
4. Question
5. Question
          `,
        },
      ],
    });

    return NextResponse.json({
      result: completion.choices[0]?.message?.content,
    });

  } catch (error: any) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
