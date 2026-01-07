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

    // Verificar se o usuário é admin
    const userIsAdmin = session?.user?.email && isAdmin(session.user.email);

    // Buscar o rebanho
    const rebanho = await prisma.rebanho.findFirst({
      where: {
        id: rebanhoId,
        propriedadeId,
        ...(userIsAdmin
          ? {}
          : {
              propriedade: {
                proprietarioId: userId,
              },
            }),
      },
    });

    if (!rebanho) {
      return NextResponse.json(
        { error: "Rebanho não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rebanho);
  } catch (error) {
    console.error("Erro ao buscar rebanho:", error);
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

    // Verificar se o rebanho existe e pertence ao usuário
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

    // Soft delete
    await prisma.rebanho.update({
      where: { id: rebanhoId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Rebanho excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir rebanho:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
