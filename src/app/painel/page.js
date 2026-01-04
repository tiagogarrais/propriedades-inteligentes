"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../components/button";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/perfil");
      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        // Se não tem nome completo, redirecionar para completar perfil
        if (!data.user.fullName || data.user.fullName.trim() === "") {
          router.push("/perfil?complete=true");
        }
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirecionamento será feito pelo useEffect
  }

  // Se não tem perfil completo, não renderizar (será redirecionado)
  if (!profile?.fullName || profile.fullName.trim() === "") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Redirecionando para completar perfil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Bem-vindo, {profile?.fullName || session.user?.email}!
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Perfil
            </h2>
            <p className="text-gray-600 mb-4">
              Atualize suas informações pessoais.
            </p>
            <Link href="/perfil" className="text-blue-600 hover:underline">
              Editar Perfil
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-600 mb-4">
              Propriedades
            </h2>
            <p className="text-gray-600 mb-4">
              Gerencie suas fazendas e terrenos.
            </p>
            <Link
              href="/propriedades"
              className="text-blue-600 hover:underline"
            >
              Ver Propriedades
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-green-600 mb-4">Sair</h2>
            <p className="text-gray-600 mb-4">Encerrar sessão.</p>
            <Button
              onClick={() => signOut()}
              className="text-red-600 hover:underline"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
