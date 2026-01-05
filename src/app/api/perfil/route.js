import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Função para formatar data de forma consistente (sempre retorna YYYY-MM-DD)
function formatDateToLocal(date) {
  if (!date) return "";
  // Usar a string ISO diretamente para evitar problemas de timezone
  const isoString = date.toISOString();
  return isoString.split("T")[0];
}

// Função simples para validar CPF
function isValidCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, "");

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Função para validar e sanitizar slug
function validateAndSanitizeSlug(slug) {
  if (!slug || typeof slug !== "string") {
    return { isValid: false, error: "Slug é obrigatório" };
  }

  // Remover espaços e caracteres especiais, converter para minúsculas
  const sanitized = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // substituir espaços por traços
    .replace(/[^a-z0-9-]/g, "") // remover caracteres não alfanuméricos exceto traços
    .replace(/-+/g, "-") // substituir múltiplos traços por um único
    .replace(/^-|-$/g, ""); // remover traços do início e fim

  if (sanitized.length < 3) {
    return { isValid: false, error: "Slug deve ter pelo menos 3 caracteres" };
  }

  if (sanitized.length > 50) {
    return { isValid: false, error: "Slug deve ter no máximo 50 caracteres" };
  }

  if (!/^[a-z0-9-]+$/.test(sanitized)) {
    return {
      isValid: false,
      error: "Slug deve conter apenas letras, números e traços",
    };
  }

  return { isValid: true, sanitized };
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const {
    fullName,
    birthDate,
    cpf: cpfValue,
    whatsapp,
    whatsappCountryCode,
    whatsappConsent,
    slug,
  } = await request.json();

  // Validações detalhadas
  const errors = [];

  // Validações serão feitas depois de verificar se existe perfil

  // Data de nascimento é opcional
  if (birthDate) {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDateObj.getFullYear();
    if (age < 18 || age > 120) {
      errors.push(
        "Data de nascimento inválida (idade deve ser entre 18 e 120 anos)"
      );
    }
  }

  // CPF é opcional, mas se fornecido deve ser válido
  if (
    cpfValue &&
    cpfValue.trim() !== "" &&
    cpfValue.trim() !== "___.___.___-__"
  ) {
    if (!isValidCPF(cpfValue)) {
      errors.push("CPF inválido. Verifique se todos os dígitos estão corretos");
    }
  }

  // Se houver erros, retornar todos de uma vez
  if (errors.length > 0) {
    return new Response(
      JSON.stringify({
        success: false,
        errors: errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Primeiro, garantir que existe um usuário na tabela User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response("Usuário não encontrado", { status: 404 });
    }

    // Verificar se já existe um perfil
    const existingProfile = await prisma.usuario.findUnique({
      where: { userId: user.id },
    });

    // Ajustar validação baseada na existência de perfil
    if (!existingProfile && (!fullName || fullName.trim().length < 2)) {
      errors.push("Nome completo é obrigatório para criar o perfil");
    }

    // Data de nascimento é opcional
    if (birthDate) {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDateObj.getFullYear();
      if (age < 18 || age > 120) {
        errors.push(
          "Data de nascimento inválida (idade deve ser entre 18 e 120 anos)"
        );
      }
    }

    // CPF é opcional, mas se fornecido deve ser válido
    if (
      cpfValue &&
      cpfValue.trim() !== "" &&
      cpfValue.trim() !== "___.___.___-__"
    ) {
      if (!isValidCPF(cpfValue)) {
        errors.push(
          "CPF inválido. Verifique se todos os dígitos estão corretos"
        );
      }
    }

    // Validar slug
    let sanitizedSlug = null;
    if (slug) {
      const slugValidation = validateAndSanitizeSlug(slug);
      if (!slugValidation.isValid) {
        errors.push(slugValidation.error);
      } else {
        sanitizedSlug = slugValidation.sanitized;
      }
    }

    // Verificar unicidade do slug e limite de alterações
    if (sanitizedSlug) {
      const existingSlugUser = await prisma.usuario.findFirst({
        where: {
          slug: sanitizedSlug,
          userId: { not: user.id }, // Excluir o próprio usuário
        },
      });

      if (existingSlugUser) {
        errors.push("Este identificador já está em uso. Escolha outro.");
      }

      // Verificar limite de alterações se for uma atualização
      if (existingProfile && existingProfile.slug !== sanitizedSlug) {
        if (existingProfile.slugChangeCount >= 5) {
          errors.push(
            "Você atingiu o limite máximo de 5 alterações do identificador."
          );
        }
      }
    }

    // Se houver erros, retornar todos de uma vez
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          errors: errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Atualizar ou criar perfil na tabela Usuario
    const updateData = {
      fullName: fullName && fullName.trim() !== "" ? fullName : null,
      whatsapp: whatsapp && whatsapp.trim() !== "" ? whatsapp : null,
      whatsappCountryCode:
        whatsappCountryCode && whatsappCountryCode.trim() !== ""
          ? whatsappCountryCode
          : "55",
      whatsappConsent: whatsappConsent || false,
    };

    // Tratar campos opcionais - definir como null se vazios
    if (birthDate && birthDate.trim() !== "") {
      // Criar data como UTC para garantir consistência
      const [year, month, day] = birthDate.split("-").map(Number);
      updateData.birthDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      updateData.birthDate = null;
    }

    if (
      cpfValue &&
      cpfValue.trim() !== "" &&
      cpfValue.trim() !== "___.___.___-__"
    ) {
      updateData.cpf = cpfValue;
    } else {
      updateData.cpf = null;
    }

    // Lidar com slug
    if (sanitizedSlug) {
      updateData.slug = sanitizedSlug;
      // Se for uma atualização e o slug mudou, incrementar contador e salvar histórico
      if (existingProfile && existingProfile.slug !== sanitizedSlug) {
        updateData.slugChangeCount = existingProfile.slugChangeCount + 1;

        // Salvar no histórico
        await prisma.slugHistory.create({
          data: {
            userId: existingProfile.id,
            oldSlug: existingProfile.slug,
            newSlug: sanitizedSlug,
          },
        });
      }
    }

    const updatedProfile = await prisma.usuario.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
      include: {
        slugHistory: {
          orderBy: { changedAt: "desc" },
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          fullName: updatedProfile.fullName,
          birthDate: updatedProfile.birthDate,
          cpf: updatedProfile.cpf,
          whatsapp: updatedProfile.whatsapp,
          whatsappCountryCode: updatedProfile.whatsappCountryCode,
          whatsappConsent: updatedProfile.whatsappConsent,
          slug: updatedProfile.slug,
          slugChangeCount: updatedProfile.slugChangeCount,
          slugHistory: updatedProfile.slugHistory,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return new Response("Erro ao atualizar perfil", { status: 500 });
  }
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    // Primeiro, encontrar o usuário na tabela User
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response("Usuário não encontrado", { status: 404 });
    }

    // Buscar perfil na tabela Usuario
    const profile = await prisma.usuario.findUnique({
      where: { userId: user.id },
      include: {
        slugHistory: {
          orderBy: { changedAt: "desc" },
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          fullName: profile?.fullName || "",
          birthDate: formatDateToLocal(profile?.birthDate),
          cpf: profile?.cpf || "",
          whatsapp: profile?.whatsapp || "",
          whatsappCountryCode: profile?.whatsappCountryCode || "55",
          whatsappConsent: profile?.whatsappConsent || false,
          slug: profile?.slug || "",
          slugChangeCount: profile?.slugChangeCount || 0,
          slugHistory: profile?.slugHistory || [],
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return new Response("Erro ao buscar perfil", { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    // Deletar o usuário (isso cascadeará para contas, sessões e perfil devido ao onDelete: Cascade)
    await prisma.user.delete({
      where: { email: session.user.email },
    });

    return new Response(
      JSON.stringify({ success: true, message: "Conta removida com sucesso" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao remover conta:", error);
    return new Response("Erro ao remover conta", { status: 500 });
  }
}
