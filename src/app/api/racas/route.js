import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  if (!tipo) {
    return NextResponse.json({ error: "Tipo é obrigatório" }, { status: 400 });
  }

  try {
    // Buscar raças distintas do tipo especificado
    const racas = await prisma.racaCaracteristicas.findMany({
      where: {
        tipo: tipo,
      },
      select: {
        raca: true,
      },
      distinct: ["raca"],
      orderBy: {
        raca: "asc",
      },
    });

    // Extrair apenas os nomes das raças
    const racasNomes = racas.map((item) => item.raca);

    return NextResponse.json(racasNomes);
  } catch (error) {
    console.error("Erro ao buscar raças:", error);
    return NextResponse.json(
      { error: "Erro ao buscar raças" },
      { status: 500 }
    );
  }
}
