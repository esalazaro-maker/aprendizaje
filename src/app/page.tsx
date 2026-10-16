// src/app/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import AuthModal from "@/components/AuthModal";

interface Game {
  id: string;
  title: string;
  description: string;
  topic: string;
  _count: { questions: number };
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [pin, setPin] = useState("");
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    // Cargar catálogo de juegos dinámicos
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGames(data);
      })
      .catch((err) => console.error("Error cargando juegos:", err));
  }, []);

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleJoinByPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      handleOpenAuth("login");
      return;
    }
    if (pin.trim()) {
      window.location.href = `/game/join/${pin.trim()}`;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 text-white">
      {/* Barra de Navegación Superior */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-extrabold tracking-wider text-yellow-400">YACHAY</span>
          <span className="bg-yellow-400 text-indigo-950 text-xs font-bold px-2 py-0.5 rounded">QUECHUA</span>
        </div>

        <div>
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-sm">{session.user.name}</p>
                <span className="text-xs text-yellow-300 font-semibold uppercase">
                  {session.user.role === "TEACHER" ? "Profesor" : "Estudiante"}
                </span>
              </div>

              {/* Botón visible EXCLUSIVAMENTE para Profesores */}
              {session.user.role === "TEACHER" && (
                <button
                  onClick={() => (window.location.href = "/profesor/dashboard")}
                  className="bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-bold text-sm px-4 py-2 rounded-xl transition shadow-md"
                >
                  📊 Panel de Profesor
                </button>
              )}

              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleOpenAuth("login")}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition backdrop-blur-sm"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => handleOpenAuth("register")}
                className="bg-yellow-400 hover:bg-yellow-300 text-indigo-950 text-sm font-bold px-4 py-2 rounded-xl transition shadow-lg"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section: Ingreso por PIN */}
      <section className="max-w-4xl mx-auto text-center px-4 py-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
          Aprende Quechua <span className="text-yellow-400">Jugando en Vivo</span>
        </h1>
        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
          Compite con tus compañeros de clase, acumula puntos y guarda tu avance en cada lección.
        </p>

        {/* Formulario de ingreso rápido por PIN */}
        <form
          onSubmit={handleJoinByPin}
          className="max-w-md mx-auto bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl"
        >
          <label className="block text-sm font-bold text-slate-200 mb-2">
            ¿Tienes un PIN de juego de tu profesor?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="Ej: 849201"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-xl font-mono tracking-widest py-3 px-4 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 font-bold"
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black px-6 py-3 rounded-xl transition shadow-lg"
            >
              ¡Entrar!
            </button>
          </div>
          {!session && (
            <p className="text-xs text-yellow-300/80 mt-3">
              ⚠️ Se te pedirá iniciar sesión para registrar tu puntaje.
            </p>
          )}
        </form>
      </section>

      {/* Sección de los 4 Juegos Programados a Mano */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-yellow-400">
          🎮 Módulos Interactivos de Quechua
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta Juego 1 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex flex-col justify-between hover:bg-white/15 transition">
            <div>
              <span className="bg-yellow-400 text-indigo-950 text-xs font-black px-3 py-1 rounded-full uppercase">
                Juego 1
              </span>
              <h3 className="text-2xl font-bold mt-3 mb-2">Rimaykuna (Saludos y Expresiones)</h3>
              <p className="text-slate-300 text-sm">
                Aprende Rimaykullayki, Allillanchu, Allillanmi y Sulpay con tarjetas visuales.
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/juegos/juego1")}
              className="mt-6 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-extrabold py-3 px-6 rounded-xl text-center transition shadow-lg"
            >
              ¡Jugar Ahora! 🎮
            </button>
          </div>

          {/* Tarjeta Juego 2 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex flex-col justify-between hover:bg-white/15 transition">
            <div>
              <span className="bg-indigo-400 text-indigo-950 text-xs font-black px-3 py-1 rounded-full uppercase">
                Juego 2
              </span>
              <h3 className="text-2xl font-bold mt-3 mb-2">Yupaykuna (Los Números) y  llimpikuna (o llinph'ikuna) Colores</h3>
              <p className="text-slate-300 text-sm">
                Identifica y cuenta en Quechua (Juk, Tawa, Pichqa...). Colores (Puka, Ancas...)
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/juegos/juego2")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl text-center transition shadow-lg"
            >
              ¡Jugar Ahora! 🎮
            </button>
          </div>

          {/* Tarjeta Juego 3 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex flex-col justify-between hover:bg-white/15 transition">
            <div>
              <span className="bg-emerald-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase">
                Juego 3
              </span>
              <h3 className="text-2xl font-bold mt-3 mb-2">Uywakuna (Los animales)</h3>
              <p className="text-slate-300 text-sm">
                Aprende a nombrar algunos Animales.
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/juegos/juego3")}
              className="mt-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 px-6 rounded-xl text-center transition shadow-lg"
            >
              ¡Jugar Ahora! 🎮
            </button>
          </div>

         
        </div>
      </section>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </main>
  );
}