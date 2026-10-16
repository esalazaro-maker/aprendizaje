// src/app/juegos/juego4/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Preguntas en Quechua letrado sobre la familia (Ayllunchik)
const PREGUNTAS_JUEGO_4 = [
  {
    id: 1,
    pregunta: "Uyariy hinaspa qaway dibujota. Piñataq kay ayllupi mama kaq?",
    imagen: "/tarjetas/mama.jpg",
    audio: "/audio/mama.mp3",
    opciones: [
      { texto: "Mama (Madre)", esCorrecta: true },
      { texto: "Tayta (Padre)", esCorrecta: false },
      { texto: "Pana (Hermana del varón)", esCorrecta: false },
      { texto: "Wawqi (Hermano del varón)", esCorrecta: false },
    ],
  },
  {
    id: 2,
    pregunta: "Mayqintaq taytanchikpa sutin Quechua simipi?",
    imagen: "/tarjetas/tayta.jpg",
    audio: "/audio/tayta.mp3",
    opciones: [
      { texto: "Tayta (Padre / Señor)", esCorrecta: true },
      { texto: "Mama (Madre)", esCorrecta: false },
      { texto: "Tura (Hermano de la mujer)", esCorrecta: false },
      { texto: "Ñaña (Hermana de la mujer)", esCorrecta: false },
    ],
  },
  {
    id: 3,
    pregunta: "Sichus warmi iñiyta munan pananta icha ñañanta, ima rimaytaq allin ñañankunapaq?",
    imagen: "/tarjetas/nana.jpg",
    audio: "/audio/nana.mp3",
    opciones: [
      { texto: "Ñaña (Hermana de la mujer)", esCorrecta: true },
      { texto: "Wawqi (Hermano del varón)", esCorrecta: false },
      { texto: "Tayta (Padre)", esCorrecta: false },
      { texto: "Mama (Madre)", esCorrecta: false },
    ],
  },
  {
    id: 4,
    pregunta: "Qhari wawqintin rimanakuspa, ima sutitataq churanku wawqinkunapaq?",
    imagen: "/tarjetas/wawqi.jpg",
    audio: "/audio/wawqi.mp3",
    opciones: [
      { texto: "Wawqi (Hermano del varón)", esCorrecta: true },
      { texto: "Ñaña (Hermana de la mujer)", esCorrecta: false },
      { texto: "Pana (Hermana del varón)", esCorrecta: false },
      { texto: "Tura (Hermano de la mujer)", esCorrecta: false },
    ],
  },
];

export default function Juego4Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [indice, setIndice] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [respondido, setRespondido] = useState(false);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [finalizado, setFinalizado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);

  const [bloqueado, setBloqueado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    fetch("/api/juegos/estados")
      .then((res) => res.json())
      .then((data) => {
        if (data && data["juego4"] === false) {
          setBloqueado(true);
        }
        setVerificando(false);
      })
      .catch((err) => {
        console.error("Error al consultar estado:", err);
        setVerificando(false);
      });
  }, []);

  const reproducirAudio = (rutaAudio: string) => {
    try {
      setReproduciendo(true);
      const audio = new Audio(rutaAudio);
      audio.play();
      audio.onended = () => setReproduciendo(false);
    } catch (e) {
      console.error("Error reproduciendo audio:", e);
      setReproduciendo(false);
    }
  };

  if (status === "loading" || verificando) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold">
        Yachay pukllay cuskachkayku...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">Yaykunaykimi qillqayta waqaychanaykipaq</h2>
        <button onClick={() => router.push("/")} className="bg-yellow-400 text-indigo-950 font-bold px-6 py-3 rounded-xl">
          Qallariyman Kutiy
        </button>
      </div>
    );
  }

  if (bloqueado && session.user.role !== "TEACHER") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 max-w-md w-full shadow-2xl">
          <span className="text-6xl mb-4 block">🔒</span>
          <h1 className="text-2xl font-black text-yellow-400 mb-2">Yachachiq Pukllayta Wisk'an</h1>
          <p className="text-slate-300 mb-6 text-sm">
            Kunan p'unchawqa yachachiqniykim kay tawa kaq pukllayta wisk'arapun.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-bold py-3 rounded-xl transition shadow-lg"
          >
            Qallariyman Kutiy
          </button>
        </div>
      </div>
    );
  }

  const preguntaActual = PREGUNTAS_JUEGO_4[indice];

  const seleccionarRespuesta = (esCorrecta: boolean, idx: number) => {
    if (respondido) return;
    setOpcionSeleccionada(idx);
    setRespondido(true);

    if (esCorrecta) {
      setPuntaje((prev) => prev + 200);
    }
  };

  const siguientePregunta = async () => {
    if (indice + 1 < PREGUNTAS_JUEGO_4.length) {
      setIndice(indice + 1);
      setRespondido(false);
      setOpcionSeleccionada(null);
    } else {
      setGuardando(true);
      await fetch("/api/guardar-avance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: "Ayllunchik (La Familia)",
          puntos: puntaje,
        }),
      });
      setGuardando(false);
      setFinalizado(true);
    }
  };

  if (finalizado) {
    return (
      <div className="min-h-screen bg-indigo-950 text-white flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 text-center max-w-md w-full shadow-2xl">
          <span className="text-6xl mb-4 block">🏆</span>
          <h1 className="text-3xl font-black text-yellow-400 mb-2">¡Ancha Allinmi!</h1>
          <p className="text-slate-300 mb-6">Tukuykunki tawa kaq yachay pukllayta (Ayllunchik).</p>
          <div className="bg-indigo-900/80 p-4 rounded-2xl mb-6 border border-indigo-500/30">
            <span className="text-xs uppercase text-slate-300 font-bold">Lliwmanta Puntos T'inkisqa</span>
            <p className="text-5xl font-black text-yellow-400 mt-1">{puntaje} pts</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-extrabold py-3 rounded-xl transition shadow-lg"
          >
            Pukllaykunaman Kutiy
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col justify-between max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Tawa Pukllay • Quechua Yachay</span>
          <h1 className="text-xl font-bold">Ayllunchik (La Familia)</h1>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl text-right">
          <span className="text-xs text-slate-400 block">Puntos</span>
          <span className="text-xl font-black text-yellow-400">{puntaje}</span>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/15 p-6 rounded-3xl text-center mb-6 shadow-2xl">
        <span className="text-xs text-slate-400 font-semibold mb-2 block">
          Tapukuy {indice + 1} / {PREGUNTAS_JUEGO_4.length}
        </span>
        <h2 className="text-lg md:text-xl font-bold mb-4">{preguntaActual.pregunta}</h2>

        <div className="flex flex-col items-center gap-4 mb-2">
          <img
            src={preguntaActual.imagen}
            alt="Aylluchik Unanchana"
            className="h-48 md:h-56 object-contain rounded-2xl border-2 border-yellow-400/40 shadow-xl bg-white/5"
          />

          <button
            onClick={() => reproducirAudio(preguntaActual.audio)}
            className={`flex items-center gap-3 px-6 py-3 rounded-full font-black text-sm transition transform hover:scale-105 shadow-xl ${
              reproduciendo
                ? "bg-yellow-300 text-indigo-950 animate-pulse"
                : "bg-yellow-400 hover:bg-yellow-300 text-indigo-950"
            }`}
          >
            <span className="text-xl">🔊</span>
            <span>{reproduciendo ? "Uyarispa..." : "Uyariy Pronunciación (.mp3)"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {preguntaActual.opciones.map((opcion, idx) => {
          let color = "bg-indigo-900/60 hover:bg-indigo-800 border-indigo-700/50";

          if (respondido) {
            if (opcion.esCorrecta) {
              color = "bg-green-600 border-green-400";
            } else if (opcionSeleccionada === idx) {
              color = "bg-red-600 border-red-400";
            } else {
              color = "bg-gray-800/40 border-gray-700 opacity-30";
            }
          }

          return (
            <button
              key={idx}
              disabled={respondido}
              onClick={() => seleccionarRespuesta(opcion.esCorrecta, idx)}
              className={`p-5 rounded-2xl border-2 text-left font-bold text-lg transition shadow-md flex justify-between items-center ${color}`}
            >
              <span>{opcion.texto}</span>
              {respondido && opcion.esCorrecta && <span className="text-xl">✓</span>}
            </button>
          );
        })}
      </div>

      {respondido && (
        <div className="flex justify-end">
          <button
            onClick={siguientePregunta}
            disabled={guardando}
            className="bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black px-8 py-4 rounded-2xl text-lg transition shadow-xl animate-bounce"
          >
            {guardando
              ? "Waqaychachkan..."
              : indice + 1 < PREGUNTAS_JUEGO_4.length
              ? "Qatiq Tapukuy ➔"
              : "Tukuychay hinaspa Waqaychay 🏆"}
          </button>
        </div>
      )}
    </main>
  );
}