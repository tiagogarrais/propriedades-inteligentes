import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  if (!tipo) {
    return NextResponse.json({ error: "Tipo é obrigatório" }, { status: 400 });
  }

  try {
    // Buscar todas as raças do tipo especificado e remover duplicatas manualmente
    const racas = await prisma.racaCaracteristicas.findMany({
      where: {
        tipo: tipo,
      },
      select: {
        raca: true,
      },
      orderBy: {
        raca: "asc",
      },
    });

    // Remover duplicatas manualmente e extrair apenas os nomes das raças
    const racasUnicas = [...new Set(racas.map((item) => item.raca))];
    const racasNomes = racasUnicas.sort();

    return NextResponse.json(racasNomes);
  } catch (error) {
    console.error("Erro ao buscar raças:", error);
    return NextResponse.json(
      { error: "Erro ao buscar raças" },
      { status: 500 }
    );
  }
}
