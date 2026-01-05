import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

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

    const propriedades = await prisma.propriedade.findMany({
      where: { proprietarioId: userId },
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
    // Obter sessão via cookies
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // Ler o body uma única vez
    const body = await request.json();
    const {
      nomePropriedade,
      tipo,
      localidade,
      tamanho,
      estado,
      cidade,
      sessionToken,
    } = body;

    // Se não conseguiu userId via session.user.id, tentar buscar pelo email
    if (!userId && session?.user?.email) {
      console.log("Buscando usuário por email:", session.user.email);
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
      console.log(
        "Falha na autenticação - sessão:",
        !!session,
        "email:",
        session?.user?.email,
        "userId via session:",
        session?.user?.id,
        "sessionToken:",
        !!sessionToken
      );
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!nomePropriedade) {
      return NextResponse.json(
        { error: "Nome da propriedade é obrigatório" },
        { status: 400 }
      );
    }

    const propriedade = await prisma.propriedade.create({
      data: {
        nomePropriedade,
        tipo: tipo || null,
        localidade: localidade || null,
        tamanho: tamanho ? parseFloat(tamanho) : null,
        estado: estado || null,
        cidade: cidade || null,
        proprietarioId: userId,
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
