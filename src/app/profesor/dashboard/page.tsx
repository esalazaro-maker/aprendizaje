// src/app/profesor/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProgresoTema {
  topic: string;
  accumulatedScore: number;
  completedGames: number;
  updatedAt: string;
}

interface Estudiante {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  topicProgresses: ProgresoTema[];
}

export default function ProfesorDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estado para los switches de habilitación de los 4 juegos
  const [estadosJuegos, setEstadosJuegos] = useState<Record<string, boolean>>({
    juego1: true,
    juego2: true,
    juego3: true,
    juego4: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (session?.user?.role && session.user.role !== "TEACHER") {
      router.push("/");
      return;
    }

    if (session?.user?.role === "TEACHER") {
      // 1. Cargar reportes de los estudiantes
      fetch("/api/profesor/reportes")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setEstudiantes(data);
          setCargando(false);
        })
        .catch((err) => {
          console.error(err);
          setCargando(false);
        });

      // 2. Cargar estado de habilitación de los juegos
      fetch("/api/juegos/estados")
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === "object") {
            setEstadosJuegos((prev) => ({ ...prev, ...data }));
          }
        })
        .catch((err) => console.error("Error cargando estados:", err));
    }
  }, [session, status, router]);

  // Función para encender/apagar el juego para los alumnos
  const toggleJuego = async (gameSlug: string, estadoActual: boolean) => {
    const nuevoEstado = !estadoActual;

    // Actualización local rápida
    setEstadosJuegos((prev) => ({ ...prev, [gameSlug]: nuevoEstado }));

    try {
      await fetch("/api/profesor/juegos/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug, isEnabled: nuevoEstado }),
      });
    } catch (err) {
      console.error("Error al guardar estado:", err);
    }
  };

  if (status === "loading" || cargando) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold">
        Verificando credenciales de Profesor...
      </div>
    );
  }

  if (session?.user?.role !== "TEACHER") {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-400 mb-2">🚫 Acceso Restringido</h1>
        <p className="text-slate-300 mb-6">Esta vista es exclusiva para el rol de Profesor (Yachachiq).</p>
        <button
          onClick={() => router.push("/")}
          className="bg-yellow-400 text-indigo-950 font-bold px-6 py-3 rounded-xl"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const listaJuegos = [
    { id: "juego1", nombre: "Juego 1: Rimaykuna", tema: "Saludos y Expresiones" },
    { id: "juego2", nombre: "Juego 2: Yupaykuna", tema: "Los Números" },
    { id: "juego3", nombre: "Juego 3: Ayllunchik", tema: "La Familia" },
    { id: "juego4", nombre: "Juego 4: Llimp'ikuna", tema: "Los Colores" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Panel del Yachachiq (Profesor)
            </span>
            <h1 className="text-3xl font-black">Control de Clase y Seguimiento</h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            ← Volver al Menú
          </button>
        </div>

        {/* Panel de Control para Habilitar / Deshabilitar Juegos */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 shadow-2xl mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-yellow-400 flex items-center gap-2">
              🎛️ Control de Habilitación de Juegos en Vivo
            </h2>
            <span className="text-xs text-slate-300 bg-indigo-900/80 px-3 py-1 rounded-full border border-indigo-700">
              Usa estos botones para permitir o bloquear el acceso durante la clase
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listaJuegos.map((juego) => {
              const estaActivo = estadosJuegos[juego.id] ?? true;

              return (
                <div
                  key={juego.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    estaActivo
                      ? "bg-indigo-900/60 border-indigo-500/50 shadow-indigo-900/30 shadow-lg"
                      : "bg-slate-900/80 border-slate-700/50 opacity-75"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-sm">{juego.nombre}</h3>
                    <p className="text-xs text-slate-300">{juego.tema}</p>
                  </div>

                  <button
                    onClick={() => toggleJuego(juego.id, estaActivo)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                      estaActivo
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                        : "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                    }`}
                  >
                    {estaActivo ? "🔓 HABILITADO (Jugando)" : "🔒 BLOQUEADO (Oculto)"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabla de Avance de Estudiantes */}
        <h2 className="text-xl font-extrabold text-white mb-4">📊 Reporte de Puntos de Estudiantes</h2>
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-900/60 border-b border-white/10 text-yellow-400 text-sm uppercase tracking-wider">
                <th className="p-4">Estudiante</th>
                <th className="p-4">Correo</th>
                <th className="p-4 text-center">Juegos Completados</th>
                <th className="p-4">Puntaje Total Acumulado</th>
                <th className="p-4">Detalle por Tema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-sm">
              {estudiantes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    Aún no hay estudiantes registrados en el sistema.
                  </td>
                </tr>
              ) : (
                estudiantes.map((estudiante) => {
                  const totalPuntos = estudiante.topicProgresses.reduce(
                    (acc, tp) => acc + tp.accumulatedScore,
                    0
                  );
                  const totalJuegos = estudiante.topicProgresses.reduce(
                    (acc, tp) => acc + tp.completedGames,
                    0
                  );

                  return (
                    <tr key={estudiante.id} className="hover:bg-white/5 transition">
                      <td className="p-4 font-bold">{estudiante.name}</td>
                      <td className="p-4 text-slate-300">{estudiante.email}</td>
                      <td className="p-4 font-semibold text-center">{totalJuegos}</td>
                      <td className="p-4 font-black text-yellow-400">{totalPuntos} pts</td>
                      <td className="p-4">
                        {estudiante.topicProgresses.length === 0 ? (
                          <span className="text-xs text-slate-500 italic">Sin partidas aún</span>
                        ) : (
                          <div className="space-y-1">
                            {estudiante.topicProgresses.map((tp, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-indigo-950/60 p-1.5 rounded border border-indigo-800/40 flex justify-between gap-2"
                              >
                                <span className="font-semibold text-indigo-300">{tp.topic}:</span>
                                <div>
                                  <span className="text-yellow-300 font-bold">{tp.accumulatedScore} pts</span>{" "}
                                  <span className="text-slate-400">({tp.completedGames} jugados)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}