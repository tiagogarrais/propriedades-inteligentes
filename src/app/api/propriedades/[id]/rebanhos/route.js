import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    const { id: propriedadeId } = await params;

    // Se não conseguiu userId via session.user.id, tentar buscar pelo email
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se a propriedade existe e pertence ao usuário
    const propriedade = await prisma.propriedade.findFirst({
      where: {
        id: propriedadeId,
        proprietarioId: userId,
      },
    });

    if (!propriedade) {
      return NextResponse.json(
        { error: "Propriedade não encontrada ou não autorizada" },
        { status: 404 }
      );
    }

    // Buscar rebanhos da propriedade
    const rebanhos = await prisma.rebanho.findMany({
      where: { propriedadeId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rebanhos);
  } catch (error) {
    console.error("Erro ao buscar rebanhos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    const { id: propriedadeId } = await params;

    // Ler o body
    const body = await request.json();
    const { nomeRebanho, tipo, quantidade } = body;

    // Se não conseguiu userId via session.user.id, tentar buscar pelo email
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se a propriedade existe e pertence ao usuário
    const propriedade = await prisma.propriedade.findFirst({
      where: {
        id: propriedadeId,
        proprietarioId: userId,
      },
    });

    if (!propriedade) {
      return NextResponse.json(
        { error: "Propriedade não encontrada ou não autorizada" },
        { status: 404 }
      );
    }

    if (!nomeRebanho || !tipo || !quantidade) {
      return NextResponse.json(
        { error: "Nome do rebanho, tipo e quantidade são obrigatórios" },
        { status: 400 }
      );
    }

    // Criar o rebanho
    const rebanho = await prisma.rebanho.create({
      data: {
        nomeRebanho,
        tipo,
        quantidade: parseInt(quantidade),
        propriedadeId,
      },
    });

    return NextResponse.json(rebanho, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar rebanho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
