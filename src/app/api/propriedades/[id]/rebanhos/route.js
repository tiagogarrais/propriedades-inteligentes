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

    // Verificar se o usuário é admin
    const userIsAdmin = session?.user?.email && isAdmin(session.user.email);

    // Verificar se a propriedade existe e pertence ao usuário (ou se é admin)
    const propriedade = await prisma.propriedade.findFirst({
      where: {
        id: propriedadeId,
        ...(userIsAdmin ? {} : { proprietarioId: userId }), // Admin pode acessar qualquer propriedade
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
    const { nomeRebanho, tipo, raca } = body;

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

    if (!nomeRebanho || !tipo) {
      return NextResponse.json(
        { error: "Nome do rebanho e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    if (tipo === "Caprino" && !raca) {
      return NextResponse.json(
        { error: "Para rebanhos de caprinos, a raça é obrigatória" },
        { status: 400 }
      );
    }

    // Criar o rebanho
    const rebanho = await prisma.rebanho.create({
      data: {
        nomeRebanho,
        tipo,
        raca: raca || null,
        quantidade: 0,
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
