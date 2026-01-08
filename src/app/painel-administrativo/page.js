"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "../components/button";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [propriedadesPorUsuario, setPropriedadesPorUsuario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("usuarios");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    fetchUsers();
    fetchPropriedades();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/usuarios");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setLoading(false);
      } else {
        if (response.status === 403) {
          router.push("/painel");
          return;
        }
        setError(data.message || "Erro ao carregar usuários");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setError("Erro ao carregar usuários");
      setLoading(false);
    }
  };

  const fetchPropriedades = async () => {
    try {
      const response = await fetch("/api/admin/propriedades");
      const data = await response.json();

      if (response.ok) {
        setPropriedadesPorUsuario(data.propriedadesPorUsuario);
      } else {
        console.error("Erro ao buscar propriedades:", data.error);
      }
    } catch (error) {
      console.error("Erro ao buscar propriedades:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Erro</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/painel"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Voltar ao Painel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie usuários e monitore a plataforma
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/painel">
                <Button className="bg-gray-600 hover:bg-gray-700">
                  ← Voltar ao Painel
                </Button>
              </Link>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-600 hover:bg-red-700"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-blue-600">
              {users.length}
            </div>
            <div className="text-gray-600">Total de Usuários</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-green-600">
              {users.filter((u) => u.isActive).length}
            </div>
            <div className="text-gray-600">Usuários Ativos</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter((u) => u.profile?.profileCompleted).length}
            </div>
            <div className="text-gray-600">Perfis Completos</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-2xl font-bold text-orange-600">
              {propriedadesPorUsuario.reduce(
                (total, user) => total + user.totalPropriedades,
                0
              )}
            </div>
            <div className="text-gray-600">Total de Propriedades</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("usuarios")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "usuarios"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Usuários ({users.length})
              </button>
              <button
                onClick={() => setActiveTab("propriedades")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "propriedades"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Propriedades (
                {propriedadesPorUsuario.reduce(
                  (total, user) => total + user.totalPropriedades,
                  0
                )}
                )
              </button>
              <button
                onClick={() => setActiveTab("racas")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "racas"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Características de Raças
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "usuarios" ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Usuários Cadastrados
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.providers.join(", ")}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum usuário encontrado.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {propriedadesPorUsuario.map((usuarioData) => (
              <div
                key={usuarioData.usuario.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {usuarioData.usuario.name || usuarioData.usuario.email}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {usuarioData.usuario.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {usuarioData.totalPropriedades} propriedade
                        {usuarioData.totalPropriedades !== 1 ? "s" : ""} •{" "}
                        {usuarioData.totalRebanhos} rebanho
                        {usuarioData.totalRebanhos !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {usuarioData.propriedades.map((propriedade) => (
                    <div
                      key={propriedade.id}
                      className="px-6 py-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-gray-900">
                              {propriedade.nomePropriedade}
                            </h4>
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {propriedade.tipo}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">
                            📍 {propriedade.localidade} • 📏{" "}
                            {propriedade.tamanho} ha • 🐐{" "}
                            {propriedade.quantidadeRebanhos} rebanho
                            {propriedade.quantidadeRebanhos !== 1 ? "s" : ""}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Criada em{" "}
                            {new Date(propriedade.createdAt).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/propriedades/${propriedade.id}`}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Ver detalhes →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {usuarioData.propriedades.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      Nenhuma propriedade cadastrada.
                    </p>
                  </div>
                )}
              </div>
            ))}

            {propriedadesPorUsuario.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">Nenhuma propriedade encontrada.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "racas" && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Características de Raças
              </h2>
              <p className="text-gray-600">
                Gerencie as características das raças de animais disponíveis na
                plataforma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500 rounded-full p-3 mr-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Raças Caprinas
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Acesse a lista completa de raças caprinas para editar suas
                  características.
                </p>
                <Link
                  href="/admin/racas"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
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
                  Gerenciar Raças Caprinas
                </Link>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 rounded-full p-3 mr-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Raças Ovinas
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Acesse a lista completa de raças ovinas para editar suas
                  características.
                </p>
                <Link
                  href="/admin/racas"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
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
                  Gerenciar Raças Ovinas
                </Link>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-500 rounded-full p-3 mr-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Outros Tipos
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Gerencie características de outros tipos de animais.
                </p>
                <button
                  disabled
                  className="inline-flex items-center px-4 py-2 bg-gray-400 text-gray-200 text-sm font-medium rounded-md cursor-not-allowed"
                >
                  Em breve
                </button>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Informações Importantes
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      As características das raças são usadas para fornecer
                      informações detalhadas aos usuários durante o cadastro de
                      rebanhos. Mantenha as informações atualizadas e precisas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
