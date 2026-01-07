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
  const [activeTab, setActiveTab] = useState("ativas");
  const [contadores, setContadores] = useState({ ativas: 0, excluidas: 0 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchPropriedades();
      fetchContadores();
    }
  }, [status, router, activeTab]);

  const fetchPropriedades = async () => {
    try {
      const response = await fetch(`/api/propriedades?status=${activeTab}`, {
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

  const fetchContadores = async () => {
    try {
      const [ativasResponse, excluidasResponse] = await Promise.all([
        fetch("/api/propriedades?status=ativas", { credentials: "include" }),
        fetch("/api/propriedades?status=excluidas", { credentials: "include" }),
      ]);

      const ativas = ativasResponse.ok ? await ativasResponse.json() : [];
      const excluidas = excluidasResponse.ok
        ? await excluidasResponse.json()
        : [];

      setContadores({
        ativas: ativas.length,
        excluidas: excluidas.length,
      });
    } catch (error) {
      console.error("Erro ao buscar contadores:", error);
    }
  };

  const handleEdit = (propriedade) => {
    router.push(`/propriedades/nova?edit=${propriedade.id}`);
  };

  const handleDelete = async (propriedadeId) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta propriedade? Ela será movida para a aba 'Excluídas'."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/propriedades/${propriedadeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Atualizar a lista removendo a propriedade excluída
        setPropriedades(propriedades.filter((p) => p.id !== propriedadeId));
        // Recarregar contadores para garantir precisão
        await fetchContadores();
        alert("Propriedade excluída com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro ao excluir propriedade: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao excluir propriedade:", error);
      alert("Erro interno do servidor");
    }
  };

  const handleRestore = async (propriedadeId) => {
    if (
      !confirm(
        "Tem certeza que deseja restaurar esta propriedade? Ela voltará para a aba 'Ativas'."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/propriedades/${propriedadeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          nomePropriedade: propriedades.find((p) => p.id === propriedadeId)
            ?.nomePropriedade,
          tipo: propriedades.find((p) => p.id === propriedadeId)?.tipo,
          localidade: propriedades.find((p) => p.id === propriedadeId)
            ?.localidade,
          tamanho: propriedades.find((p) => p.id === propriedadeId)?.tamanho,
          estado: propriedades.find((p) => p.id === propriedadeId)?.estado,
          cidade: propriedades.find((p) => p.id === propriedadeId)?.cidade,
          latitude: propriedades.find((p) => p.id === propriedadeId)?.latitude,
          longitude: propriedades.find((p) => p.id === propriedadeId)
            ?.longitude,
          deletedAt: null, // Restaurar
        }),
      });

      if (response.ok) {
        // Atualizar a lista removendo a propriedade restaurada
        setPropriedades(propriedades.filter((p) => p.id !== propriedadeId));
        // Recarregar contadores para garantir precisão
        await fetchContadores();
        alert("Propriedade restaurada com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro ao restaurar propriedade: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao restaurar propriedade:", error);
      alert("Erro interno do servidor");
    }
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

        {/* Abas */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("ativas")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "ativas"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Ativas ({contadores.ativas})
              </button>
              <button
                onClick={() => setActiveTab("excluidas")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "excluidas"
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Excluídas ({contadores.excluidas})
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propriedades.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                {activeTab === "ativas"
                  ? "Nenhuma propriedade ativa cadastrada ainda."
                  : "Nenhuma propriedade excluída."}
              </p>
              <p className="text-gray-400 mt-2">
                {activeTab === "ativas"
                  ? 'Clique em "Adicionar Propriedade" para começar.'
                  : "As propriedades excluídas aparecerão aqui."}
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

                {/* Ícone de exclusão/restauração no canto superior esquerdo */}
                {activeTab === "ativas" ? (
                  <button
                    onClick={() => handleDelete(propriedade.id)}
                    className="absolute top-4 left-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Excluir propriedade"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestore(propriedade.id)}
                    className="absolute top-4 left-4 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                    title="Restaurar propriedade"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                )}

                {/* Ícone de acesso no canto inferior direito */}
                {activeTab === "ativas" && (
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
                )}

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
                  {activeTab === "ativas" ? (
                    <>
                      Criado em:{" "}
                      {new Date(propriedade.createdAt).toLocaleDateString(
                        "pt-BR"
                      )}
                    </>
                  ) : (
                    <>
                      Excluído em:{" "}
                      {new Date(propriedade.deletedAt).toLocaleDateString(
                        "pt-BR"
                      )}
                    </>
                  )}
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
