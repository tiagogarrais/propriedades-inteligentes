import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const raca = searchParams.get("raca");

  if (!tipo || !raca) {
    return NextResponse.json(
      { error: "Tipo e raça são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const caracteristicas = await prisma.racaCaracteristicas.findUnique({
      where: {
        tipo_raca: {
          tipo,
          raca,
        },
      },
    });

    return NextResponse.json(caracteristicas);
  } catch (error) {
    console.error("Erro ao buscar características:", error);
    return NextResponse.json(
      { error: "Erro ao buscar características" },
      { status: 500 }
    );
  }
}
