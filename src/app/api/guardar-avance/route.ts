// src/app/api/guardar-avance/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { tema, puntos } = await req.json();

    // Guardar o actualizar el progreso acumulado del tema en Quechua
    const progreso = await prisma.topicProgress.upsert({
      where: {
        userId_topic: {
          userId: session.user.id,
          topic: tema,
        },
      },
      update: {
        accumulatedScore: { increment: puntos },
        completedGames: { increment: 1 },
      },
      create: {
        userId: session.user.id,
        topic: tema,
        accumulatedScore: puntos,
        completedGames: 1,
      },
    });

    return NextResponse.json({ ok: true, progreso });
  } catch (error) {
    console.error("Error al guardar avance:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}