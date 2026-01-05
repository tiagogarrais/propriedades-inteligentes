import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    const { id } = await params;

    // Ler o body
    const body = await request.json();
    const {
      nomePropriedade,
      tipo,
      localidade,
      tamanho,
      estado,
      cidade,
      latitude,
      longitude,
      sessionToken,
    } = body;

    // Se não conseguiu userId via session.user.id, tentar buscar pelo email
    if (!userId && session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      userId = user?.id;
    }

    // Se ainda não conseguiu via cookies, tentar via body
    if (!userId && sessionToken) {
      userId = sessionToken;
    }

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!nomePropriedade) {
      return NextResponse.json(
        { error: "Nome da propriedade é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a propriedade existe e pertence ao usuário
    const propriedadeExistente = await prisma.propriedade.findFirst({
      where: {
        id: id,
        proprietarioId: userId,
      },
    });

    if (!propriedadeExistente) {
      return NextResponse.json(
        { error: "Propriedade não encontrada ou não autorizada" },
        { status: 404 }
      );
    }

    // Atualizar a propriedade
    const propriedadeAtualizada = await prisma.propriedade.update({
      where: { id: id },
      data: {
        nomePropriedade,
        tipo: tipo || null,
        localidade: localidade || null,
        tamanho: tamanho ? parseFloat(tamanho) : null,
        estado: estado || null,
        cidade: cidade || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(propriedadeAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar propriedade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
