import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function isAdmin(email) {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];
  return adminEmails.includes(email);
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    const { id } = await params;

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

    // Verificar se o usuário é admin
    const userIsAdmin = session?.user?.email && isAdmin(session.user.email);

    // Buscar a propriedade
    const propriedade = await prisma.propriedade.findFirst({
      where: {
        id: id,
        ...(userIsAdmin ? {} : { proprietarioId: userId }), // Admin pode ver qualquer propriedade
      },
    });

    if (!propriedade) {
      return NextResponse.json(
        { error: "Propriedade não encontrada ou não autorizada" },
        { status: 404 }
      );
    }

    return NextResponse.json(propriedade);
  } catch (error) {
    console.error("Erro ao buscar propriedade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

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
      deletedAt,
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
        deletedAt: deletedAt || null,
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

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    const { id } = await params;

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
    const propriedadeExistente = await prisma.propriedade.findFirst({
      where: {
        id: id,
        proprietarioId: userId,
        deletedAt: null, // Só pode excluir propriedades ativas
      },
    });

    if (!propriedadeExistente) {
      return NextResponse.json(
        { error: "Propriedade não encontrada ou não autorizada" },
        { status: 404 }
      );
    }

    // Soft delete da propriedade
    const propriedadeExcluida = await prisma.propriedade.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Propriedade excluída com sucesso",
      propriedade: propriedadeExcluida,
    });
  } catch (error) {
    console.error("Erro ao excluir propriedade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
