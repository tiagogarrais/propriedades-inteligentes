import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { sendVerificationRequest, sendNewUserNotification } from "@/lib/email";

export const authOptions = {
  adapter: PrismaAdapter(prisma), // Usar adapter padrão temporariamente
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASS,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "database",
  },
  pages: {
    // you can customize sign in/out/error etc here
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirecionar para o painel após login bem-sucedido
      if (url === baseUrl || url.startsWith(baseUrl + "/api/auth")) {
        return baseUrl + "/painel";
      }
      // Permitir outros redirecionamentos relativos
      if (url.startsWith("/")) return baseUrl + url;
      // Permitir redirecionamentos para a mesma origem
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/painel";
    },
    async signIn({ user, account, profile }) {
      try {
        console.log("SignIn callback:", {
          user: user?.email,
          account: account?.provider,
          userId: user?.id,
          userIdType: typeof user?.id,
        });

        // Verificar se é um novo usuário (não tem perfil na tabela Usuario)
        const existingProfile = await prisma.usuario.findUnique({
          where: { userId: user.id },
        });

        // Se não tem perfil, é um novo usuário
        if (!existingProfile) {
          // Verificar se o e-mail do novo usuário é diferente do e-mail do admin
          const adminEmail = process.env.EMAIL_SERVER_USER;
          if (user.email !== adminEmail) {
            try {
              // Enviar notificação para o admin
              await sendNewUserNotification({
                newUserEmail: user.email,
                provider: {
                  server: {
                    host: process.env.EMAIL_SERVER_HOST,
                    port: process.env.EMAIL_SERVER_PORT,
                    auth: {
                      user: process.env.EMAIL_SERVER_USER,
                      pass: process.env.EMAIL_SERVER_PASS,
                    },
                  },
                  from: process.env.EMAIL_FROM,
                },
              });
              console.log(
                `Notificação enviada para ${adminEmail} sobre novo usuário: ${user.email}`
              );
            } catch (emailError) {
              console.error(
                "Erro ao enviar notificação de novo usuário:",
                emailError
              );
              // Não bloquear o login por erro no e-mail
            }
          }
        }

        return true;
      } catch (error) {
        console.error("Erro no callback signIn:", error);
        return false;
      }
    },
    async session({ session, token }) {
      try {
        if (token && token.id) {
          console.log(
            "Session callback - token.id:",
            token.id,
            "type:",
            typeof token.id
          );
          session.user.id = token.id;
          // Adicionar campos do perfil da tabela Usuario
          try {
            const profile = await prisma.usuario.findUnique({
              where: { userId: token.id },
            });
            if (profile) {
              session.user = {
                ...session.user,
                fullName: profile.fullName,
                birthDate: profile.birthDate,
                cpf: profile.cpf,
                whatsapp: profile.whatsapp,
                whatsappCountryCode: profile.whatsappCountryCode,
                whatsappConsent: profile.whatsappConsent,
              };
            }
          } catch (dbError) {
            console.error("Erro ao buscar dados do usuário no banco:", dbError);
            // Continuar sem os dados extras do perfil
          }
        }
        return session;
      } catch (error) {
        console.error("Erro no callback de sessão:", error);
        // Retornar sessão sem campos extras em caso de erro
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          console.log(
            "JWT callback - user.id:",
            user.id,
            "type:",
            typeof user.id
          );
          token.id = user.id;
        }
        return token;
      } catch (error) {
        console.error("Erro no callback JWT:", error);
        return token;
      }
    },
  },
};
