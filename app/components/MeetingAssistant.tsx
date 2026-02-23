"use client";

import { useState, useRef } from "react";

export default function MeetingAssistant() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ================= START LISTENING =================
  const startListening = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let fullText = "";

      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript + " ";
      }

      setTranscript(fullText);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  // ================= STOP =================
  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ================= EXPORT PDF =================
  const exportPDF = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "MeetingNotes.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="space-y-6">

      <h2 className="text-3xl font-bold text-blue-500">
        🎤 Live Meeting Assistant
      </h2>

      <div className="flex gap-4">
        <button
          onClick={startListening}
          className="bg-green-600 px-6 py-2 rounded"
        >
          ▶ Start Listening
        </button>

        <button
          onClick={stopListening}
          className="bg-red-600 px-6 py-2 rounded"
        >
          ⏹ Stop
        </button>

        <button
          onClick={exportPDF}
          className="bg-blue-600 px-6 py-2 rounded"
        >
          📄 Export Notes
        </button>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 min-height: 200px">
        <p className="text-gray-300 whitespace-pre-wrap">
          {transcript || "Live captions will appear here..."}
        </p>
      </div>

    </div>
  );
}
