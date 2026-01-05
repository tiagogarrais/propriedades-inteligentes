import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    const { id: propriedadeId, rebanhoId, animalId } = await params;

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

    // Verificar se o animal existe e pertence ao rebanho/propriedade do usuário
    const animal = await prisma.animal.findFirst({
      where: {
        id: animalId,
        rebanhoId,
        rebanho: {
          propriedadeId,
          propriedade: {
            proprietarioId: userId,
          },
        },
      },
    });

    if (!animal) {
      return NextResponse.json(
        { error: "Animal não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    return NextResponse.json(animal);
  } catch (error) {
    console.error("Erro ao buscar animal:", error);
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

    const { id: propriedadeId, rebanhoId, animalId } = await params;

    // Ler o body
    const body = await request.json();
    const {
      numeroIdentificacao,
      nome,
      raca,
      dataNascimento,
      sexo,
      pesoAoNascer,
      pesoAtual,
      action, // Novo campo para ações especiais como 'restore'
    } = body;

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

    // Verificar se o animal existe e pertence ao rebanho/propriedade do usuário
    const animalExistente = await prisma.animal.findFirst({
      where: {
        id: animalId,
        rebanhoId,
        rebanho: {
          propriedadeId,
          propriedade: {
            proprietarioId: userId,
          },
        },
      },
    });

    if (!animalExistente) {
      return NextResponse.json(
        { error: "Animal não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    // Se for uma ação de restaurar
    if (action === "restore") {
      await prisma.animal.update({
        where: { id: animalId },
        data: { deletedAt: null },
      });
      return NextResponse.json({ message: "Animal restaurado com sucesso" });
    }

    // Validação para atualização normal
    if (!numeroIdentificacao) {
      return NextResponse.json(
        { error: "Número de identificação é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o número de identificação mudou e se já existe outro animal com esse número
    // Inclui tanto animais ativos quanto excluídos (soft delete)
    if (numeroIdentificacao !== animalExistente.numeroIdentificacao) {
      const conflito = await prisma.animal.findFirst({
        where: {
          rebanhoId,
          numeroIdentificacao,
          id: { not: animalId }, // Excluir o próprio animal da verificação
        },
      });

      if (conflito) {
        return NextResponse.json(
          {
            error:
              "Já existe um animal com este número de identificação neste rebanho",
          },
          { status: 409 }
        );
      }
    }

    // Atualizar o animal
    const animalAtualizado = await prisma.animal.update({
      where: { id: animalId },
      data: {
        numeroIdentificacao,
        nome: nome || null,
        raca: raca || null,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        sexo: sexo || null,
        pesoAoNascer: pesoAoNascer ? parseFloat(pesoAoNascer) : null,
        pesoAtual: pesoAtual ? parseFloat(pesoAtual) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(animalAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar animal:", error);
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

    const { id: propriedadeId, rebanhoId, animalId } = await params;

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

    // Verificar se o animal existe e pertence ao rebanho/propriedade do usuário
    const animal = await prisma.animal.findFirst({
      where: {
        id: animalId,
        rebanhoId,
        rebanho: {
          propriedadeId,
          propriedade: {
            proprietarioId: userId,
          },
        },
        deletedAt: null, // Só pode excluir animais não excluídos
      },
    });

    if (!animal) {
      return NextResponse.json(
        { error: "Animal não encontrado ou não autorizado" },
        { status: 404 }
      );
    }

    // Soft delete - marcar como excluído
    await prisma.animal.update({
      where: { id: animalId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Animal excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir animal:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
