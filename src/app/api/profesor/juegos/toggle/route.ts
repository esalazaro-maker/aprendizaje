// src/app/api/profesor/juegos/toggle/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Solo un usuario con rol TEACHER puede activar o desactivar juegos
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren permisos de profesor." },
        { status: 403 }
      );
    }

    const { gameSlug, isEnabled } = await req.json();

    // Guardar el estado en la base de datos usando la tabla TopicProgress / Game Setting
    // O actualizando un registro de control
    const config = await prisma.game.upsert({
      where: { id: gameSlug },
      update: { isPublic: isEnabled },
      create: {
        id: gameSlug,
        title: gameSlug,
        topic: "Modulo",
        creatorId: session.user.id,
        isPublic: isEnabled,
      },
    });

    return NextResponse.json({ ok: true, config });
  } catch (error) {
    console.error("Error al cambiar estado del juego:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}