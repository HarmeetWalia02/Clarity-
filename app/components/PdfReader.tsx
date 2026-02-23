"use client";

import { useState } from "react";

type PdfReaderProps = {
  setQuizData: React.Dispatch<React.SetStateAction<any[]>>;
};

/* ================= STRUCTURED OUTPUT ================= */

function StructuredOutput({ text }: { text: string }) {
  if (!text) return null;

  if (!text.includes("## ")) {
    return (
      <div className="p-5 bg-white rounded-xl shadow-md border">
        <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
          {text}
        </div>
      </div>
    );
  }

  const sections = text.split("## ").filter(Boolean);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const lines = section.split("\n");
        const title = lines[0];
        const content = lines.slice(1).join("\n");

        return (
          <div key={index} className="p-5 bg-white rounded-xl shadow-md border">
            <h2 className="text-xl font-bold mb-3 text-blue-700">
              {title}
            </h2>
            <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= FOCUS VIEW ================= */

function FocusView({ text }: { text: string }) {
  const sentences = text.split(". ").filter(Boolean);
  const [index, setIndex] = useState(0);

  return (
    <div className="space-y-6">

      <div className="bg-black border border-gray-700 p-10 rounded-2xl text-2xl leading-relaxed">
        {sentences[index] || ""}
      </div>

      <div className="flex justify-between">
        <button
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
          className="bg-gray-700 px-6 py-2 rounded disabled:opacity-40"
        >
          ⬅ Previous
        </button>

        <button
          disabled={index >= sentences.length - 1}
          onClick={() => setIndex(index + 1)}
          className="bg-blue-600 px-6 py-2 rounded disabled:opacity-40"
        >
          Next ➡
        </button>
      </div>

      <div className="text-center text-gray-400">
        Sentence {index + 1} of {sentences.length}
      </div>

    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function PdfReader({ setQuizData }: PdfReaderProps) {
  const [result, setResult] = useState("");
  const [translated, setTranslated] = useState("");
  const [simplified, setSimplified] = useState("");
  const [focusMode, setFocusMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  const [language, setLanguage] = useState("Hindi");

  /* ================= FILE UPLOAD ================= */

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult("");
    setTranslated("");
    setSimplified("");
    setQuizData([]);
    setFocusMode(false);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setResult(data.result);
    } else {
      alert(data.error || "Analysis failed");
    }

    setLoading(false);
  };

  /* ================= TRANSLATE ================= */

  const handleTranslate = async () => {
    if (!result) return;

    setTranslating(true);
    setTranslated("");

    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: result,
        targetLanguage: language,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setTranslated(data.result);
    } else {
      alert(data.error || "Translation failed");
    }

    setTranslating(false);
  };

  /* ================= SIMPLIFY ================= */

  const handleSimplify = async () => {
    if (!result) return;

    setSimplifying(true);
    setSimplified("");

    const res = await fetch("/api/simplify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: result }),
    });

    const data = await res.json();

    if (res.ok) {
      setSimplified(data.result);
    } else {
      alert(data.error || "Simplify failed");
    }

    setSimplifying(false);
  };

  /* ================= SPEECH ================= */

  const handleSpeak = () => {
    const textToRead = translated || result;
    if (!textToRead) return;

    window.speechSynthesis.cancel();

    const languageMap: any = {
      Hindi: "hi-IN",
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Marathi: "mr-IN",
    };

    const selectedLang = languageMap[language] || "en-US";
    const voices = window.speechSynthesis.getVoices();

    const matchedVoice =
      voices.find(v => v.lang === selectedLang) ||
      voices.find(v => v.lang.startsWith(selectedLang.split("-")[0]));

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = selectedLang;
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.rate = 0.85;

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
  };

  /* ================= QUIZ ================= */

  const handleGenerateQuiz = async () => {
    if (!result) return;

    setQuizLoading(true);
    setQuizData([]);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: result }),
    });

    const data = await res.json();

    if (res.ok) {
      setQuizData(data.quiz);
      alert("Quiz generated! Open the Quiz tab.");
    } else {
      alert(data.error || "Quiz failed");
    }

    setQuizLoading(false);
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6 text-white">

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="block w-full text-sm"
      />

      {loading && (
        <p className="text-blue-400 font-medium">
          Analyzing document with AI...
        </p>
      )}

      {result && (
        <div className="space-y-4">

          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center">

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 px-3 py-2 rounded"
            >
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Marathi</option>
            </select>

            <button onClick={handleTranslate} className="bg-green-600 px-4 py-2 rounded">
              🌍 Translate
            </button>

            <button onClick={handleSimplify} className="bg-purple-600 px-4 py-2 rounded">
              🧒 Simplify
            </button>

            <button onClick={handleGenerateQuiz} className="bg-yellow-600 px-4 py-2 rounded">
              🧠 Generate Quiz
            </button>

            <button onClick={handleSpeak} className="bg-blue-600 px-4 py-2 rounded">
              🔊 Read
            </button>

            <button onClick={handleStop} className="bg-red-600 px-4 py-2 rounded">
              ⏹ Stop
            </button>

            <button
              onClick={() => setFocusMode(!focusMode)}
              className="bg-indigo-600 px-4 py-2 rounded"
            >
              {focusMode ? "Exit Focus Mode" : "🧠 Adaptive Focus Mode"}
            </button>

          </div>

          {translating && <p className="text-green-400">Translating...</p>}
          {simplifying && <p className="text-purple-400">Simplifying...</p>}
          {quizLoading && <p className="text-yellow-400">Generating quiz...</p>}

          {/* Main Output */}
          {focusMode ? (
            <FocusView text={translated || result} />
          ) : (
            <StructuredOutput text={translated || result} />
          )}

          {/* Simplified */}
          {simplified && !focusMode && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">
                🧒 Simplified Version
              </h2>
              <StructuredOutput text={simplified} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}