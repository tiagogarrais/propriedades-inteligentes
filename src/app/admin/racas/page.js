"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

function isAdmin(email) {
  // Lista de emails de administradores (mesma do backend)
  const adminEmails = ["tiagoarraisholanda@gmail.com"];
  return adminEmails.includes(email);
}

export default function RacasAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [racasCaprinas, setRacasCaprinas] = useState([]);
  const [racasOvinas, setRacasOvinas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      if (!session?.user?.email || !isAdmin(session.user.email)) {
        router.push("/");
        return;
      }
      fetchRacas();
    }
  }, [status, session, router]);

  const fetchRacas = async () => {
    try {
      // Buscar raças caprinas
      const responseCaprinas = await fetch("/api/racas?tipo=Caprino");
      if (responseCaprinas.ok) {
        const dataCaprinas = await responseCaprinas.json();
        setRacasCaprinas(dataCaprinas);
      }

      // Buscar raças ovinas
      const responseOvinas = await fetch("/api/racas?tipo=Ovino");
      if (responseOvinas.ok) {
        const dataOvinas = await responseOvinas.json();
        setRacasOvinas(dataOvinas);
      }
    } catch (error) {
      console.error("Erro ao buscar raças:", error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="javascript:history.back()"
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            ← Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Características de Raças
          </h1>
          <p className="text-gray-600 mt-2">
            Selecione uma raça para editar suas características
          </p>
        </div>

        <div className="space-y-8">
          {/* Raças Caprinas */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <h2 className="text-xl font-semibold text-gray-900">
                Raças Caprinas
              </h2>
            </div>
            <div className="p-6">
              {racasCaprinas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {racasCaprinas.map((raca) => (
                    <div
                      key={raca}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">{raca}</h3>
                      <Link
                        href={`/admin/racas/editar?tipo=Caprino&raca=${encodeURIComponent(
                          raca
                        )}`}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Editar Características
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma raça caprina encontrada.
                </p>
              )}
            </div>
          </div>

          {/* Raças Ovinas */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
              <h2 className="text-xl font-semibold text-gray-900">
                Raças Ovinas
              </h2>
            </div>
            <div className="p-6">
              {racasOvinas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {racasOvinas.map((raca) => (
                    <div
                      key={raca}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">{raca}</h3>
                      <Link
                        href={`/admin/racas/editar?tipo=Ovino&raca=${encodeURIComponent(
                          raca
                        )}`}
                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
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
                        Editar Características
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma raça ovina encontrada.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
