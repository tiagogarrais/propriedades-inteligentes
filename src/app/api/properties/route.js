import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const propriedades = await prisma.propriedade.findMany({
      where: { proprietarioId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(propriedades);
  } catch (error) {
    console.error("Erro ao buscar propriedades:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nome, tipo, localizacao, tamanho } = body;

    if (!nome || !tipo) {
      return NextResponse.json(
        { error: "Nome e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    const propriedade = await prisma.propriedade.create({
      data: {
        nome,
        tipo,
        localizacao,
        tamanho: tamanho ? parseFloat(tamanho) : null,
        proprietarioId: session.user.id,
      },
    });

    return NextResponse.json(propriedade, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar propriedade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
