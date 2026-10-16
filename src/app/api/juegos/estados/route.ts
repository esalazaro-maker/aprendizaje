// src/app/api/juegos/estados/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      select: {
        id: true,
        isPublic: true,
      },
    });

    // Mapea los IDs (ej: "juego1", "juego2") con su estado booleano (true/false)
    const estados = games.reduce((acc, game) => {
      acc[game.id] = game.isPublic;
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json(estados);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar estados" }, { status: 500 });
  }
}