export const runtime = "nodejs";

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();

    const langMap: any = {
      Hindi: "hi",
      Spanish: "es",
      French: "fr",
      German: "de",
      Marathi: "mr",
    };

    const langCode = langMap[language] || "en";

    const googleTTSUrl =
      "https://translate.google.com/translate_tts?ie=UTF-8" +
      `&tl=${langCode}` +
      "&client=tw-ob" +
      "&q=" +
      encodeURIComponent(text.slice(0, 1500));

    const response = await fetch(googleTTSUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://translate.google.com/",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google TTS Error:", errorText);
      return new Response("TTS failed", { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });

  } catch (error) {
    console.error("TTS SERVER ERROR:", error);
    return new Response("TTS failed", { status: 500 });
  }
}
