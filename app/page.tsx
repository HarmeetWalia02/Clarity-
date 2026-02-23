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
    <main className="min-h-screen bg-black text-white">

      {/* ================= NAVIGATION BAR ================= */}
      <nav className="flex justify-between items-center px-8 py-4 bg-gray-950 border-b border-gray-800 shadow-lg">
        <h1 className="text-2xl font-bold text-white">
          NoChaos
        </h1>

        <div className="flex gap-4">
          <NavButton
            label="📚 AI Reader"
            active={activeTab === "reader"}
            onClick={() => setActiveTab("reader")}
          />
          <NavButton
            label="🧠 Quiz"
            active={activeTab === "quiz"}
            onClick={() => setActiveTab("quiz")}
          />
          <NavButton
            label="🎤 Meeting Assistant"
            active={activeTab === "meeting"}
            onClick={() => setActiveTab("meeting")}
          />
        </div>
      </nav>

      {/* ================= PAGE CONTENT ================= */}
      <div className="max-w-6xl mx-auto p-8">

        {activeTab === "reader" && (
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
            <PdfReader setQuizData={setQuizData} />
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
            <QuizPage quiz={quizData} />
          </div>
        )}

        {activeTab === "meeting" && (
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
            <MeetingAssistant />
          </div>
        )}

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
      className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "bg-blue-800 text-white hover:bg-blue-600"
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
    <div className="space-y-6">

      <h2 className="text-3xl font-bold text-blue-500">
        🧠 Quiz Time
      </h2>

      {quiz.map((q, qIndex) => (
        <div
          key={qIndex}
          className="bg-white p-6 rounded-xl shadow text-black"
        >
          <p className="font-semibold mb-4">
            {qIndex + 1}. {q.question}
          </p>

          {q.options.map((option: string, optIndex: number) => (
            <div key={optIndex} className="mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  onChange={() => {
                    const updated = [...userAnswers];
                    updated[qIndex] = optIndex;
                    setUserAnswers(updated);
                  }}
                />
                {option}
              </label>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={calculateScore}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Submit Quiz
      </button>

      {score !== null && (
        <div className="text-xl font-bold text-green-400">
          Your Score: {score} / {quiz.length}
        </div>
      )}
    </div>
  );
}
