"use client";

import { useState, useEffect } from "react";

type PdfReaderProps = {
  setQuizData: React.Dispatch<React.SetStateAction<any[]>>;
};

/* ================= STRUCTURED OUTPUT ================= */

function StructuredOutput({ text }: { text: string }) {
  if (!text) return null;

  const sections = text.split("## ").filter(Boolean);

  return (
    <div className="space-y-8 fade-up">
      {sections.map((section, index) => {
        const lines = section.split("\n");
        const title = lines[0];
        const content = lines.slice(1).join("\n");

        return (
          <div
            key={index}
            className="glass p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-xl font-bold mb-4 text-blue-400">
              {title}
            </h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= ADAPTIVE FOCUS ================= */

function FocusView({ text }: { text: string }) {
  const sentences = text.split(". ").filter(Boolean);
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setIndex((prev) =>
        prev < sentences.length - 1 ? prev + 1 : prev
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [autoPlay, sentences.length]);

  return (
    <div className="space-y-8 fade-up">

      <div className="glass p-10 rounded-3xl text-2xl leading-relaxed">
        {sentences.map((sentence, i) => (
          <span
            key={i}
            className={
              i === index
                ? "bg-blue-600 px-3 py-1 rounded-lg"
                : "opacity-30"
            }
          >
            {sentence}.{" "}
          </span>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30"
        >
          {autoPlay ? "Pause Focus" : "Start Auto Focus"}
        </button>
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
  const [profile, setProfile] = useState("");

  const [language, setLanguage] = useState("Hindi");

  const [loading, setLoading] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

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
    if (res.ok) setResult(data.result);

    setLoading(false);
  };

  /* ================= TRANSLATE ================= */

  const handleTranslate = async () => {
    if (!result) return;

    setTranslating(true);

    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: result,
        targetLanguage: language,
      }),
    });

    const data = await res.json();
    if (res.ok) setTranslated(data.result);

    setTranslating(false);
  };

  /* ================= SIMPLIFY ================= */

  const handleSimplify = async () => {
    if (!result) return;

    setSimplifying(true);

    const res = await fetch("/api/simplify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: result }),
    });

    const data = await res.json();
    if (res.ok) setSimplified(data.result);

    setSimplifying(false);
  };

  /* ================= QUIZ ================= */

  const handleGenerateQuiz = async () => {
    if (!result) return;

    setQuizLoading(true);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: result }),
    });

    const data = await res.json();
    if (res.ok) {
      setQuizData(data.quiz);
      setFocusMode(false);
    }

    setQuizLoading(false);
  };

  /* ================= SPEECH ================= */

  const handleSpeak = () => {
    const textToRead = simplified || translated || result;
    if (!textToRead) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.85;

    window.speechSynthesis.speak(utterance);
  };

  /* ================= PROFILE ENGINE ================= */

  useEffect(() => {
    if (!profile || !result) return;

    if (profile === "Focus Mode") setFocusMode(true);
    if (profile === "Simplified Reading") handleSimplify();
    if (profile === "Audio Learning") handleSpeak();
    if (profile === "Multilingual Mode") {
      handleTranslate();
      setTimeout(() => handleSpeak(), 800);
    }
    if (profile === "Assessment Mode") {
      handleGenerateQuiz();
      setFocusMode(false);
    }

  }, [profile]);

  /* ================= UI ================= */

  return (
    <div className="space-y-12 text-white fade-up">

      {/* PROFILE SECTION */}
      <div className="glass p-10 rounded-3xl shadow-2xl">
        <h2 className="text-2xl font-semibold mb-8 text-blue-400">
          Adaptive Learning Engine
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            "Focus Mode",
            "Simplified Reading",
            "Audio Learning",
            "Multilingual Mode",
            "Assessment Mode",
          ].map((p) => (
            <button
              key={p}
              onClick={() => setProfile(p)}
              className={`p-6 rounded-2xl transition-all duration-300 text-left ${
                profile === p
                  ? "bg-blue-600/20 border border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]"
                  : "bg-white/5 border border-white/10 hover:bg-blue-600/10"
              }`}
            >
              <div className="font-semibold text-lg">{p}</div>
            </button>
          ))}
        </div>
      </div>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="w-full p-4 rounded-xl bg-black/40 border border-white/10"
      />

      {loading && <p className="text-blue-400 animate-pulse">Processing document...</p>}
      {simplifying && <p className="text-purple-400 animate-pulse">Simplifying...</p>}
      {translating && <p className="text-green-400 animate-pulse">Translating...</p>}
      {quizLoading && <p className="text-yellow-400 animate-pulse">Generating assessment...</p>}

      {result && (
        <>
          <div className="glass p-6 rounded-2xl flex flex-wrap gap-4">

            <button onClick={() => setFocusMode(!focusMode)} className="premium-btn">
              {focusMode ? "Exit Focus" : "Adaptive Focus"}
            </button>

            <button onClick={handleSimplify} className="premium-btn">
              Simplify
            </button>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black/60 border border-white/10 rounded-xl px-4 py-2"
            >
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Marathi</option>
            </select>

            <button onClick={handleTranslate} className="premium-btn">
              Translate
            </button>

            <button onClick={handleSpeak} className="premium-btn">
              Read
            </button>

            <button onClick={handleGenerateQuiz} className="premium-btn">
              Generate Quiz
            </button>

          </div>

          {focusMode ? (
            <FocusView text={simplified || translated || result} />
          ) : (
            <StructuredOutput text={simplified || translated || result} />
          )}
        </>
      )}
    </div>
  );
}