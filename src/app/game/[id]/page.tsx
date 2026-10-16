// src/app/game/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  prompt: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  timeLimitSec: number;
  points: number;
  options: Option[];
}

interface GameData {
  id: string;
  title: string;
  topic: string;
  questions: Question[];
}

export default function PlayGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [game, setGame] = useState<GameData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/games/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.questions) {
          setGame(data);
          setTimeLeft(data.questions[0]?.timeLimitSec || 15);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (isAnswered || isFinished || !game) return;

    if (timeLeft === 0) {
      setIsAnswered(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, isFinished, game]);

  const handleSelectOption = (option: Option) => {
    if (isAnswered) return;

    setSelectedOption(option.id);
    setIsAnswered(true);

    if (option.isCorrect) {
      const currentQuestion = game?.questions[currentIdx];
      const basePoints = currentQuestion?.points || 100;
      const bonus = timeLeft * 10;
      setScore((prev) => prev + basePoints + bonus);
    }
  };

  const handleNextQuestion = () => {
    if (!game) return;

    if (currentIdx + 1 < game.questions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(game.questions[nextIdx]?.timeLimitSec || 15);
    } else {
      setIsFinished(true);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
        Cargando lección interactiva...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Debes iniciar sesión para registrar tu avance</h2>
        <button
          onClick={() => router.push("/")}
          className="bg-yellow-400 text-indigo-950 font-bold px-6 py-3 rounded-xl"
        >
          Ir al Inicio
        </button>
      </div>
    );
  }

  if (!game || !game.questions.length) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">No se encontraron preguntas para este juego</h2>
        <button onClick={() => router.push("/")} className="bg-yellow-400 text-indigo-950 font-bold px-6 py-3 rounded-xl">
          Volver
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 max-w-md w-full">
          <span className="text-6xl mb-4 block">🏆</span>
          <h1 className="text-3xl font-extrabold text-yellow-400 mb-2">¡Allinmi! (¡Excelente!)</h1>
          <p className="text-slate-300 mb-6">Has completado el juego de tarjetas de Quechua.</p>

          <div className="bg-indigo-900/60 p-4 rounded-2xl mb-6 border border-indigo-500/30">
            <p className="text-sm text-slate-300 uppercase font-semibold">Puntaje Final</p>
            <p className="text-5xl font-black text-yellow-400 mt-1">{score} pts</p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-bold py-3 rounded-xl transition shadow-lg"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = game.questions[currentIdx];
  const optionColors = [
    "bg-red-600 hover:bg-red-500 border-red-400",
    "bg-blue-600 hover:bg-blue-500 border-blue-400",
    "bg-yellow-600 hover:bg-yellow-500 border-yellow-400",
    "bg-green-600 hover:bg-green-500 border-green-400",
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8">
      {/* Encabezado */}
      <header className="flex justify-between items-center max-w-5xl mx-auto w-full">
        <div>
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">{game.topic}</span>
          <h2 className="text-lg font-bold">{game.title}</h2>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl text-center">
          <span className="text-xs text-slate-400 block">Puntaje</span>
          <span className="font-extrabold text-yellow-400 text-lg">{score}</span>
        </div>
      </header>

      {/* Pregunta Principal con Tarjeta / Imagen / Audio */}
      <section className="max-w-4xl mx-auto w-full my-auto text-center py-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-slate-400 font-semibold">
            Tarjeta {currentIdx + 1} de {game.questions.length}
          </span>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 ${
              timeLeft <= 5 ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" : "bg-indigo-500/20 border-indigo-500 text-indigo-300"
            }`}
          >
            {timeLeft}
          </div>
        </div>

        {/* Card Multimedia Principal */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-3xl shadow-2xl mb-6 flex flex-col items-center">
          <h1 className="text-xl md:text-2xl font-bold mb-4">{currentQuestion.prompt}</h1>

          {/* Imagen de la tarjeta */}
          {currentQuestion.imageUrl && (
            <div className="relative w-full max-w-xs h-48 mb-4 rounded-2xl overflow-hidden border-2 border-yellow-400/50 shadow-md">
              <img
                src={currentQuestion.imageUrl}
                alt="Tarjeta de Quechua"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Botón de Reproducción de Audio */}
          {currentQuestion.audioUrl && (
            <button
              onClick={() => playAudio(currentQuestion.audioUrl!)}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-bold px-5 py-2.5 rounded-full shadow-lg transition transform hover:scale-105 my-2"
            >
              🔊 Escuchar Pronunciación en Quechua
            </button>
          )}
        </div>

        {/* Opciones de Respuestas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === option.id;
            let btnStyle = optionColors[idx % optionColors.length];

            if (isAnswered) {
              if (option.isCorrect) {
                btnStyle = "bg-green-600 border-green-300 ring-4 ring-green-400";
              } else if (isSelected && !option.isCorrect) {
                btnStyle = "bg-red-600 border-red-300 opacity-60";
              } else {
                btnStyle = "bg-gray-800 border-gray-700 opacity-40";
              }
            }

            return (
              <button
                key={option.id}
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`p-5 rounded-2xl border-2 text-left font-bold text-lg transition duration-200 shadow-lg flex justify-between items-center ${btnStyle}`}
              >
                <span>{option.text}</span>
                {isAnswered && option.isCorrect && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Navegación al siguiente desafío */}
      <footer className="max-w-4xl mx-auto w-full flex justify-end">
        {isAnswered && (
          <button
            onClick={handleNextQuestion}
            className="bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black px-8 py-4 rounded-2xl text-lg transition shadow-xl animate-bounce"
          >
            {currentIdx + 1 < game.questions.length ? "Siguiente Tarjeta ➔" : "Ver Puntaje Final 🏆"}
          </button>
        )}
      </footer>
    </main>
  );
}