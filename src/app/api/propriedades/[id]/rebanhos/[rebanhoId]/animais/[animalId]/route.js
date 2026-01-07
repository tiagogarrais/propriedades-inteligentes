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

    // Verificar se o usuário é admin
    const userIsAdmin = session?.user?.email && isAdmin(session.user.email);

    // Verificar se o animal existe e pertence ao rebanho/propriedade do usuário (ou se é admin)
    const animal = await prisma.animal.findFirst({
      where: {
        id: animalId,
        rebanhoId,
        ...(userIsAdmin
          ? {}
          : {
              rebanho: {
                propriedadeId,
                propriedade: {
                  proprietarioId: userId,
                },
              },
            }),
      },
      include: {
        pesosHistoricos: {
          orderBy: {
            dataPeso: "asc",
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
      pesosHistoricos, // Agora obrigatório - deve incluir pelo menos o peso ao nascer
      action, // Novo campo para ações especiais como 'restore', 'sell', 'unsell'
      emailComprador, // Email do comprador para ação de venda
    } = body;

    // Validar que há pelo menos um peso histórico (peso ao nascer) se não for ação especial
    if (
      !action &&
      (!pesosHistoricos ||
        !Array.isArray(pesosHistoricos) ||
        pesosHistoricos.length === 0)
    ) {
      return NextResponse.json(
        { error: "É obrigatório informar pelo menos o peso ao nascer" },
        { status: 400 }
      );
    }

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

    // Se for uma ação de vender
    if (action === "sell") {
      if (!emailComprador || !emailComprador.includes("@")) {
        return NextResponse.json(
          { error: "Email do comprador é obrigatório e deve ser válido" },
          { status: 400 }
        );
      }

      await prisma.animal.update({
        where: { id: animalId },
        data: {
          vendido: true,
          emailComprador,
          dataVenda: new Date(),
        },
      });
      return NextResponse.json({ message: "Animal vendido com sucesso" });
    }

    // Se for uma ação de cancelar venda
    if (action === "unsell") {
      await prisma.animal.update({
        where: { id: animalId },
        data: {
          vendido: false,
          emailComprador: null,
          dataVenda: null,
        },
      });
      return NextResponse.json({ message: "Venda cancelada com sucesso" });
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
        updatedAt: new Date(),
      },
    });

    // Atualizar pesos históricos se fornecidos
    if (pesosHistoricos && Array.isArray(pesosHistoricos)) {
      // Primeiro, deletar todos os pesos históricos existentes
      await prisma.pesoHistorico.deleteMany({
        where: { animalId },
      });

      // Depois, criar os novos pesos históricos
      if (pesosHistoricos.length > 0) {
        // Garantir que o primeiro peso seja na data de nascimento
        const dataNasc = new Date(dataNascimento);
        const primeiroPeso = pesosHistoricos[0];
        const dataPrimeiroPeso = new Date(primeiroPeso.dataPeso);

        // Se não for na data de nascimento, adicionar o peso ao nascer
        if (dataPrimeiroPeso.getTime() !== dataNasc.getTime()) {
          pesosHistoricos.unshift({
            peso: primeiroPeso.peso, // Usar o peso fornecido como peso ao nascer
            dataPeso: dataNasc.toISOString(),
            observacao: "Peso ao nascer",
          });
        }

        await prisma.pesoHistorico.createMany({
          data: pesosHistoricos.map((peso) => ({
            animalId,
            peso: parseFloat(peso.peso),
            dataPeso: new Date(peso.dataPeso),
            observacao: peso.observacao || null,
          })),
        });
      }
    }

    // Retornar o animal com os pesos históricos atualizados
    const animalComPesos = await prisma.animal.findUnique({
      where: { id: animalId },
      include: {
        pesosHistoricos: {
          orderBy: {
            dataPeso: "asc",
          },
        },
      },
    });

    return NextResponse.json(animalComPesos);
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
