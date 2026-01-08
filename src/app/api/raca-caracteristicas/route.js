import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function isAdmin(email) {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];
  return adminEmails.includes(email);
}

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

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const {
      tipo,
      raca,
      origem,
      pesoNascer,
      peso10Meses,
      pesoMachoAdulto,
      pesoFemeaAdulta,
      maturidadeSexual,
      femeaTemLeite,
      periodoGestacao,
      quantidadeCabritosParto,
      abatePrecoceDias,
      abateConvencionalDias,
      abateTardioDiasMin,
      abateTardioDiasMax,
      pelagemCouro,
      maxFemeasPorMacho,
      femeasPorMachoIdeal,
      ganhoPesoDiaGramas,
      percentualGorduraCarne,
      indiceColesterol,
      indiceGorduraSaturada,
      indiceCalorias,
      carneMacia,
      carneSaborosa,
      carneSucculenta,
      fasesGanhoPeso,
    } = body;

    if (!tipo || !raca) {
      return NextResponse.json(
        { error: "Tipo e raça são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar pelagemCouro
    const allowedPelagem = ["Curto", "Médio", "Longo"];
    if (pelagemCouro && !allowedPelagem.includes(pelagemCouro)) {
      return NextResponse.json(
        { error: "Pelagem do couro deve ser Curto, Médio ou Longo" },
        { status: 400 }
      );
    }

    const caracteristicasAtualizadas = await prisma.racaCaracteristicas.upsert({
      where: {
        tipo_raca: {
          tipo,
          raca,
        },
      },
      update: {
        origem: origem || null,
        pesoNascer: pesoNascer ? parseFloat(pesoNascer) : null,
        peso10Meses: peso10Meses ? parseFloat(peso10Meses) : null,
        pesoMachoAdulto: pesoMachoAdulto ? parseFloat(pesoMachoAdulto) : null,
        pesoFemeaAdulta: pesoFemeaAdulta ? parseFloat(pesoFemeaAdulta) : null,
        maturidadeSexual: maturidadeSexual ? parseInt(maturidadeSexual) : null,
        femeaTemLeite: femeaTemLeite !== undefined ? femeaTemLeite : true,
        periodoGestacao: periodoGestacao ? parseInt(periodoGestacao) : null,
        quantidadeCabritosParto: quantidadeCabritosParto
          ? parseFloat(quantidadeCabritosParto)
          : null,
        abatePrecoceDias: abatePrecoceDias ? parseInt(abatePrecoceDias) : null,
        abateConvencionalDias: abateConvencionalDias
          ? parseInt(abateConvencionalDias)
          : null,
        abateTardioDiasMin: abateTardioDiasMin
          ? parseInt(abateTardioDiasMin)
          : null,
        abateTardioDiasMax: abateTardioDiasMax
          ? parseInt(abateTardioDiasMax)
          : null,
        pelagemCouro: pelagemCouro || null,
        maxFemeasPorMacho: maxFemeasPorMacho
          ? parseInt(maxFemeasPorMacho)
          : null,
        femeasPorMachoIdeal: femeasPorMachoIdeal
          ? parseInt(femeasPorMachoIdeal)
          : null,
        ganhoPesoDiaGramas: ganhoPesoDiaGramas
          ? parseFloat(ganhoPesoDiaGramas)
          : null,
        percentualGorduraCarne: percentualGorduraCarne
          ? parseFloat(percentualGorduraCarne)
          : null,
        indiceColesterol: indiceColesterol || null,
        indiceGorduraSaturada: indiceGorduraSaturada || null,
        indiceCalorias: indiceCalorias || null,
        carneMacia: carneMacia !== undefined ? carneMacia : true,
        carneSaborosa: carneSaborosa !== undefined ? carneSaborosa : true,
        carneSucculenta: carneSucculenta !== undefined ? carneSucculenta : true,
        fasesGanhoPeso: fasesGanhoPeso || null,
      },
      create: {
        tipo,
        raca,
        origem: origem || null,
        pesoNascer: pesoNascer ? parseFloat(pesoNascer) : null,
        peso10Meses: peso10Meses ? parseFloat(peso10Meses) : null,
        pesoMachoAdulto: pesoMachoAdulto ? parseFloat(pesoMachoAdulto) : null,
        pesoFemeaAdulta: pesoFemeaAdulta ? parseFloat(pesoFemeaAdulta) : null,
        maturidadeSexual: maturidadeSexual ? parseInt(maturidadeSexual) : null,
        femeaTemLeite: femeaTemLeite !== undefined ? femeaTemLeite : true,
        periodoGestacao: periodoGestacao ? parseInt(periodoGestacao) : null,
        quantidadeCabritosParto: quantidadeCabritosParto
          ? parseFloat(quantidadeCabritosParto)
          : null,
        abatePrecoceDias: abatePrecoceDias ? parseInt(abatePrecoceDias) : null,
        abateConvencionalDias: abateConvencionalDias
          ? parseInt(abateConvencionalDias)
          : null,
        abateTardioDiasMin: abateTardioDiasMin
          ? parseInt(abateTardioDiasMin)
          : null,
        abateTardioDiasMax: abateTardioDiasMax
          ? parseInt(abateTardioDiasMax)
          : null,
        pelagemCouro: pelagemCouro || null,
        maxFemeasPorMacho: maxFemeasPorMacho
          ? parseInt(maxFemeasPorMacho)
          : null,
        femeasPorMachoIdeal: femeasPorMachoIdeal
          ? parseInt(femeasPorMachoIdeal)
          : null,
        ganhoPesoDiaGramas: ganhoPesoDiaGramas
          ? parseFloat(ganhoPesoDiaGramas)
          : null,
        percentualGorduraCarne: percentualGorduraCarne
          ? parseFloat(percentualGorduraCarne)
          : null,
        indiceColesterol: indiceColesterol || null,
        indiceGorduraSaturada: indiceGorduraSaturada || null,
        indiceCalorias: indiceCalorias || null,
        carneMacia: carneMacia !== undefined ? carneMacia : true,
        carneSaborosa: carneSaborosa !== undefined ? carneSaborosa : true,
        carneSucculenta: carneSucculenta !== undefined ? carneSucculenta : true,
        fasesGanhoPeso: fasesGanhoPeso || null,
      },
    });

    return NextResponse.json(caracteristicasAtualizadas);
  } catch (error) {
    console.error("Erro ao atualizar características:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar características" },
      { status: 500 }
    );
  }
}
