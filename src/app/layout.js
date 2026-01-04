"use client";

import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { useSession, signOut, signIn } from "next-auth/react";
import Button from "./components/button";
import "./globals.css";

function Header() {
  const { data: session } = useSession();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderBottom: "1px solid #e0e0e0",
        padding: "12px 24px",
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Propriedades Inteligentes
        </Link>

        <nav>
          {session ? (
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <Link
                href="/profile"
                style={{
                  color: "#007bff",
                  textDecoration: "none",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  transition: "background-color 0.2s",
                }}
              >
                Meu Perfil
              </Link>
              <Button
                onClick={() => signOut()}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  padding: "8px 12px",
                  fontSize: "14px",
                }}
              >
                Sair
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => signIn()}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Entrar
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#f8f9fa",
        borderTop: "1px solid #e0e0e0",
        padding: "12px 24px",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          textAlign: "center",
          color: "#6c757d",
          fontSize: "14px",
        }}
      >
        © 2026 Propriedades Inteligentes. Todos os direitos reservados.
      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>
          Propriedades Inteligentes - Controle Total da Sua Propriedade Agrícola
        </title>
        <meta
          name="description"
          content="Gerencie propriedades rurais com inteligência. Cadastro seguro de fazendas, animais, máquinas e plantações com autenticação por e-mail."
        />
        <meta
          name="keywords"
          content="propriedades inteligentes, gerenciamento agrícola, cadastro propriedades rurais, animais, máquinas, plantações, agricultura"
        />
        <meta name="author" content="Tiago das Graças Arrais" />
        <meta property="og:title" content="Propriedades Inteligentes" />
        <meta
          property="og:description"
          content="Controle completo das suas propriedades agrícolas com nosso sistema web intuitivo."
        />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SessionProvider>
          <Header />
          <main
            style={{
              marginTop: "80px", // Altura do header
              flex: 1,
              paddingBottom: "20px",
            }}
          >
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
