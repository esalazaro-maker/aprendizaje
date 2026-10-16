// src/app/api/profesor/reportes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 Control de acceso: Verificar que el usuario esté autenticado y sea TEACHER
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Acceso denegado. Se requieren permisos de profesor." },
        { status: 403 }
      );
    }

    // Obtener la lista de estudiantes con su avance acumulado por tema
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