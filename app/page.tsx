"use client";

import { useState } from "react";
import PdfReader from "./components/PdfReader";
import MeetingAssistant from "./components/MeetingAssistant";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "reader" | "meeting" | "quiz"
  >("reader");

  const [quizData, setQuizData] = useState<any[]>([]);

  return (
    <main className="min-h-screen relative overflow-hidden text-white">

      {/* Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600 blur-[200px] opacity-20 rounded-full" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-500 blur-[200px] opacity-20 rounded-full" />

      <div className="relative z-10">

        {/* NAVBAR */}
        <nav className="glass flex justify-between items-center px-10 py-6 shadow-xl">

          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            noChaos
          </h1>

          <div className="flex gap-4">
            <NavButton
              label="AI Reader"
              active={activeTab === "reader"}
              onClick={() => setActiveTab("reader")}
            />
            <NavButton
              label="Quiz"
              active={activeTab === "quiz"}
              onClick={() => setActiveTab("quiz")}
            />
            <NavButton
              label="Meeting Assistant"
              active={activeTab === "meeting"}
              onClick={() => setActiveTab("meeting")}
            />
          </div>
        </nav>

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto p-10 fade-up">

          {activeTab === "reader" && (
            <div className="glass p-10 rounded-3xl shadow-2xl">
              <PdfReader setQuizData={setQuizData} />
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="glass p-10 rounded-3xl shadow-2xl">
              <QuizPage quiz={quizData} />
            </div>
          )}

          {activeTab === "meeting" && (
            <div className="glass p-10 rounded-3xl shadow-2xl">
              <MeetingAssistant />
            </div>
          )}

        </div>

      </div>
    </main>
  );
}

function NavButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
        active
          ? "bg-blue-600 shadow-lg shadow-blue-500/40 scale-105"
          : "bg-white/5 hover:bg-blue-700 hover:scale-105"
      }`}
    >
      {label}
    </button>
  );
}

/* ================= QUIZ PAGE ================= */

function QuizPage({ quiz }: { quiz: any[] }) {
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);

  const calculateScore = () => {
    let correct = 0;
    quiz.forEach((q, index) => {
      if (userAnswers[index] === q.answer) correct++;
    });
    setScore(correct);
  };

  if (!quiz || quiz.length === 0) {
    return (
      <div className="text-center text-gray-400">
        Generate a quiz from AI Reader first.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <h2 className="text-3xl font-bold text-blue-400">
        Assessment Mode
      </h2>

      {quiz.map((q, qIndex) => (
        <div
          key={qIndex}
          className="glass p-8 rounded-2xl"
        >
          <p className="font-semibold mb-6 text-lg">
            {qIndex + 1}. {q.question}
          </p>

          {q.options.map((option: string, optIndex: number) => (
            <label
              key={optIndex}
              className="block mb-3 p-3 rounded-xl bg-white/5 hover:bg-blue-600/20 transition-all cursor-pointer"
            >
              <input
                type="radio"
                name={`question-${qIndex}`}
                className="mr-3"
                onChange={() => {
                  const updated = [...userAnswers];
                  updated[qIndex] = optIndex;
                  setUserAnswers(updated);
                }}
              />
              {option}
            </label>
          ))}
        </div>
      ))}

      <button
        onClick={calculateScore}
        className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30"
      >
        Submit Assessment
      </button>

      {score !== null && (
        <div className="text-xl font-bold text-green-400">
          Score: {score} / {quiz.length}
        </div>
      )}
    </div>
  );
}