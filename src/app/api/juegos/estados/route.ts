// src/app/api/juegos/estados/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

export async function GET() {
  await connection();

  try {
    const games = await prisma.game.findMany({
      select: {
        id: true,
        isPublic: true,
      },
    });

    const estados = games.reduce((acc, game) => {
      acc[game.id] = game.isPublic;
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json(estados);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar estados" }, { status: 500 });
  }
}