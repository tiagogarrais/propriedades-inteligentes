import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function isAdmin(email) {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];
  return adminEmails.includes(email);
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário é admin
    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Buscar todas as propriedades com informações do proprietário
    const propriedades = await prisma.propriedade.findMany({
      include: {
        proprietario: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            rebanhos: true,
          },
        },
      },
      orderBy: [{ proprietario: { name: "asc" } }, { createdAt: "desc" }],
    });

    // Organizar por usuários
    const propriedadesPorUsuario = propriedades.reduce((acc, propriedade) => {
      const userId = propriedade.proprietario.id;
      if (!acc[userId]) {
        acc[userId] = {
          usuario: propriedade.proprietario,
          propriedades: [],
          totalPropriedades: 0,
          totalRebanhos: 0,
        };
      }

      acc[userId].propriedades.push({
        id: propriedade.id,
        nomePropriedade: propriedade.nomePropriedade,
        tipo: propriedade.tipo,
        localidade: propriedade.localidade,
        tamanho: propriedade.tamanho,
        createdAt: propriedade.createdAt,
        quantidadeRebanhos: propriedade._count.rebanhos,
      });

      acc[userId].totalPropriedades++;
      acc[userId].totalRebanhos += propriedade._count.rebanhos;

      return acc;
    }, {});

    // Converter para array
    const resultado = Object.values(propriedadesPorUsuario);

    return NextResponse.json({
      propriedadesPorUsuario: resultado,
      totalUsuarios: resultado.length,
      totalPropriedades: propriedades.length,
    });
  } catch (error) {
    console.error("Erro ao buscar propriedades por usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
