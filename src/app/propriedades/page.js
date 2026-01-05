"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../components/button";

export default function PropriedadesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [propriedades, setPropriedades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchPropriedades();
    }
  }, [status, router]);

  const fetchPropriedades = async () => {
    try {
      const response = await fetch("/api/propriedades", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPropriedades(data);
      }
    } catch (error) {
      console.error("Erro ao buscar propriedades:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (propriedade) => {
    router.push(`/propriedades/nova?edit=${propriedade.id}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Minhas Propriedades
          </h1>
          <Link href="/propriedades/nova">
            <Button className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
              Adicionar Propriedade
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propriedades.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhuma propriedade cadastrada ainda.
              </p>
              <p className="text-gray-400 mt-2">
                Clique em "Adicionar Propriedade" para começar.
              </p>
            </div>
          ) : (
            propriedades.map((propriedade) => (
              <div
                key={propriedade.id}
                className="bg-white p-6 rounded-lg shadow-md relative"
              >
                {/* Ícone de edição no canto superior direito */}
                <button
                  onClick={() => handleEdit(propriedade)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Editar propriedade"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                {/* Ícone de acesso no canto inferior direito */}
                <Link
                  href={`/propriedades/${propriedade.id}`}
                  className="absolute bottom-4 right-4 p-3 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition-all shadow-sm border border-green-200"
                  title="Acessar propriedade"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>

                <h3 className="text-xl text-center font-semibold text-gray-900 mb-4 pr-12 pb-12">
                  {propriedade.nomePropriedade}
                </h3>
                <p className="text-gray-600 mb-1">
                  <strong>Tipo:</strong> {propriedade.tipo}
                </p>
                {propriedade.localidade && (
                  <p className="text-gray-600 mb-1">
                    <strong>Localidade:</strong> {propriedade.localidade}
                  </p>
                )}
                {propriedade.tamanho && (
                  <p className="text-gray-600 mb-1">
                    <strong>Tamanho:</strong> {propriedade.tamanho} ha
                  </p>
                )}
                {propriedade.latitude && propriedade.longitude && (
                  <p className="text-gray-600 mb-1">
                    <strong>GPS:</strong>{" "}
                    <a
                      href={`https://www.google.com/maps/@${propriedade.latitude},${propriedade.longitude},17z`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver no Google Maps
                    </a>
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-4">
                  Criado em:{" "}
                  {new Date(propriedade.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
