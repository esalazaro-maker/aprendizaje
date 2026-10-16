// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Por favor, completa todos los campos requeridos." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verificar si el correo ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este correo electrónico ya está registrado." },
        { status: 400 }
      );
    }

    // Cifrado de la contraseña con bcrypt (cost factor = 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Asignación de rol
    const assignedRole = role === "TEACHER" ? "TEACHER" : "STUDENT";

    // Crear el usuario en Prisma
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: assignedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Usuario registrado con éxito", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en endpoint de registro:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al registrar el usuario." },
      { status: 500 }
    );
  }
}