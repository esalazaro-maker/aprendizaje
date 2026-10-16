// src/app/api/profesor/reportes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";

export async function GET() {
  await connection(); // Indicar a Next.js que la ruta requiere datos dinámicos en vivo

  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren permisos de profesor." },
        { status: 403 }
      );
    }

    const estudiantes = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        topicProgresses: {
          select: {
            topic: true,
            accumulatedScore: true,
            completedGames: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(estudiantes);
  } catch (error) {
    console.error("Error al obtener reportes del profesor:", error);
    return NextResponse.json(
      { error: "Error interno al cargar los datos." },
      { status: 500 }
    );
  }
}