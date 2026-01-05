import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
function isAdmin(email) {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [];
  return adminEmails.includes(email);
}

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verificar se o usuário é admin
  if (!isAdmin(session.user.email)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    // Buscar todos os usuários (simplificado - apenas dados necessários)
    const users = await prisma.user.findMany({
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
        sessions: {
          select: {
            expires: true,
          },
        },
      },
    });

    // Formatar os dados para exibição (simplificado)
    const formattedUsers = users.map((user) => {
      // Verificar se usuário está ativo (tem sessão não expirada)
      const isActive = user.sessions.some(
        (session) => session.expires > new Date()
      );

      return {
        id: user.id,
        email: user.email,
        providers: user.accounts.map((account) => account.provider),
        isActive: isActive,
      };
    });

    // Ordenar por email
    formattedUsers.sort((a, b) => a.email.localeCompare(b.email));

    return new Response(
      JSON.stringify({
        success: true,
        users: formattedUsers,
        total: formattedUsers.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return new Response("Erro ao buscar usuários", { status: 500 });
  }
}
