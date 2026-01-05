import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    const { id: propriedadeId, rebanhoId } = await params;

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

    // Verificar se o rebanho existe e pertence à propriedade do usuário
    const rebanho = await prisma.rebanho.findFirst({
      where: {
        id: rebanhoId,
        propriedadeId,
        propriedade: {
          proprietarioId: userId,
        },
      },
    });

    if (!rebanho) {
      return NextResponse.json(
        { error: "Rebanho não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    // Buscar animais do rebanho
    const animais = await prisma.animal.findMany({
      where: { rebanhoId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(animais);
  } catch (error) {
    console.error("Erro ao buscar animais:", error);
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

    const { id: propriedadeId, rebanhoId } = await params;

    // Ler o body
    const body = await request.json();
    const {
      numeroIdentificacao,
      nome,
      raca,
      dataNascimento,
      sexo,
      pesoAoNascer,
      pesoAtual,
    } = body;

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

    // Verificar se o rebanho existe e pertence à propriedade do usuário
    const rebanho = await prisma.rebanho.findFirst({
      where: {
        id: rebanhoId,
        propriedadeId,
        propriedade: {
          proprietarioId: userId,
        },
      },
    });

    if (!rebanho) {
      return NextResponse.json(
        { error: "Rebanho não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    if (!numeroIdentificacao) {
      return NextResponse.json(
        { error: "Número de identificação é obrigatório" },
        { status: 400 }
      );
    }

    // Criar o animal
    const animal = await prisma.animal.create({
      data: {
        numeroIdentificacao,
        nome: nome || null,
        raca: raca || null,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        sexo: sexo || null,
        pesoAoNascer: pesoAoNascer ? parseFloat(pesoAoNascer) : null,
        pesoAtual: pesoAtual ? parseFloat(pesoAtual) : null,
        rebanhoId,
      },
    });

    return NextResponse.json(animal, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar animal:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
