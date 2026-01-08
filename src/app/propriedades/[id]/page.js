"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "../../components/button";

function isAdmin(email) {
  // Lista de emails de administradores (mesma do backend)
  const adminEmails = ["tiagoarraisholanda@gmail.com"];
  return adminEmails.includes(email);
}

export default function PropriedadePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [propriedade, setPropriedade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rebanhos, setRebanhos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("ativos"); // 'ativos' ou 'excluidos'
  const [formData, setFormData] = useState({
    nomeRebanho: "",
    tipo: "",
    raca: "",
  });
  const [caracteristicasRaca, setCaracteristicasRaca] = useState(null);

  useEffect(() => {
    const fetchCaracteristicas = async () => {
      if (formData.tipo && formData.raca) {
        try {
          const response = await fetch(
            `/api/raca-caracteristicas?tipo=${encodeURIComponent(
              formData.tipo
            )}&raca=${encodeURIComponent(formData.raca)}`
          );
          if (response.ok) {
            const data = await response.json();
            setCaracteristicasRaca(data);
          } else {
            setCaracteristicasRaca(null);
          }
        } catch (error) {
          console.error("Erro ao buscar características:", error);
          setCaracteristicasRaca(null);
        }
      } else {
        setCaracteristicasRaca(null);
      }
    };

    fetchCaracteristicas();
  }, [formData.tipo, formData.raca]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPropriedade = async () => {
      try {
        const response = await fetch(`/api/propriedades/${id}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setPropriedade(data);
        } else {
          alert("Propriedade não encontrada");
          router.push("/propriedades");
        }
      } catch (error) {
        console.error("Erro ao buscar propriedade:", error);
        alert("Erro ao buscar propriedade");
        router.push("/propriedades");
      } finally {
        setLoading(false);
      }
    };

    const fetchRebanhos = async () => {
      try {
        const response = await fetch(`/api/propriedades/${id}/rebanhos`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setRebanhos(data);
        }
      } catch (error) {
        console.error("Erro ao buscar rebanhos:", error);
      }
    };

    if (id) {
      fetchPropriedade();
      fetchRebanhos();
    }
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/propriedades/${id}/rebanhos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newRebanho = await response.json();
        setRebanhos([newRebanho, ...rebanhos]);
        setFormData({
          nomeRebanho: "",
          tipo: "",
          raca: "",
        });
        setCaracteristicasRaca(null);
        setShowForm(false);
        alert("Rebanho cadastrado com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro ao cadastrar rebanho: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar rebanho:", error);
      alert("Erro ao cadastrar rebanho");
    }
  };

  const handleDeleteRebanho = async (rebanhoId) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este rebanho? Ele será movido para a aba Excluídos."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/propriedades/${id}/rebanhos/${rebanhoId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Atualizar o rebanho na lista com deletedAt
        setRebanhos(
          rebanhos.map((r) =>
            r.id === rebanhoId ? { ...r, deletedAt: new Date() } : r
          )
        );
        alert("Rebanho excluído com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro ao excluir rebanho: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao excluir rebanho:", error);
      alert("Erro ao excluir rebanho");
    }
  };

  const handleRestoreRebanho = async (rebanhoId) => {
    if (!confirm("Tem certeza que deseja restaurar este rebanho?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/propriedades/${id}/rebanhos/${rebanhoId}/restore`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Atualizar o rebanho na lista removendo deletedAt
        setRebanhos(
          rebanhos.map((r) =>
            r.id === rebanhoId ? { ...r, deletedAt: null } : r
          )
        );
        alert("Rebanho restaurado com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro ao restaurar rebanho: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao restaurar rebanho:", error);
      alert("Erro ao restaurar rebanho");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session || !propriedade) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/propriedades" className="text-blue-600 hover:underline">
            ← Voltar para Propriedades
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {propriedade.nomePropriedade}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-gray-600">
              <strong>Tipo:</strong> {propriedade.tipo}
            </p>
            {propriedade.localidade && (
              <p className="text-gray-600">
                <strong>Localidade:</strong> {propriedade.localidade}
              </p>
            )}
            {propriedade.tamanho && (
              <p className="text-gray-600">
                <strong>Tamanho:</strong> {propriedade.tamanho} ha
              </p>
            )}
            {propriedade.latitude && propriedade.longitude && (
              <p className="text-gray-600">
                <strong>GPS:</strong>{" "}
                <a
                  href={`https://www.google.com/maps/@${propriedade.latitude},${propriedade.longitude},20z`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Ver no Google Maps
                </a>
              </p>
            )}
            <p className="text-gray-500 text-sm">
              Criado em:{" "}
              {new Date(propriedade.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Rebanhos</h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {showForm ? "Cancelar" : "Adicionar Rebanho"}
            </Button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-medium mb-4">Novo Rebanho</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Nome do Rebanho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nomeRebanho}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeRebanho: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Bovino">Bovino</option>
                    <option value="Ovino">Ovino</option>
                    <option value="Caprino">Caprino</option>
                    <option value="Suíno">Suíno</option>
                    <option value="Equino">Equino</option>
                  </select>
                </div>
                {formData.tipo === "Caprino" && (
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Raça <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.raca}
                      onChange={(e) =>
                        setFormData({ ...formData, raca: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Selecione a raça</option>
                      <option value="Moxotó (nativa)">Moxotó (nativa)</option>
                      <option value="Repartida ou Surrão (nativa)">
                        Repartida ou Surrão (nativa)
                      </option>
                      <option value="Marota ou Curaça (nativa)">
                        Marota ou Curaça (nativa)
                      </option>
                      <option value="Canindé (nativa)">Canindé (nativa)</option>
                      <option value="Sem raça definida (SRD)">
                        Sem raça definida (SRD)
                      </option>
                      <option value="Boer">Boer</option>
                      <option value="Anglo-nubiana (exótica)">
                        Anglo-nubiana (exótica)
                      </option>
                      <option value="Saanen (exótica)">Saanen (exótica)</option>
                      <option value="Parda-alpina (exótica)">
                        Parda-alpina (exótica)
                      </option>
                      <option value="Rebanho misto">Rebanho misto</option>
                    </select>
                  </div>
                )}
                {formData.tipo === "Caprino" && formData.raca && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium mb-2">
                      Características da Raça
                    </h4>
                    {caracteristicasRaca ? (
                      <table className="w-full border border-gray-300 rounded-md">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">
                              Característica
                            </th>
                            <th className="border border-gray-300 px-4 py-2 text-left">
                              Valor
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {caracteristicasRaca.origem && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Origem
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.origem}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.pesoNascer && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Peso médio ao nascer
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.pesoNascer} kg
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.peso10Meses && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Peso médio aos 10 meses
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.peso10Meses} kg
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.pesoMachoAdulto && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Peso médio do macho adulto
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.pesoMachoAdulto} kg
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.pesoFemeaAdulta && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Peso médio da fêmea adulta
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.pesoFemeaAdulta} kg
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.maturidadeSexual && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Maturidade sexual
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.maturidadeSexual} meses
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.femeaTemLeite !== undefined && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Fêmea tem leite suficiente
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.femeaTemLeite
                                  ? "Sim"
                                  : "Não"}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.periodoGestacao && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Período de gestação
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.periodoGestacao} dias
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.quantidadeCabritosParto && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Quantidade média de cabritos por parto
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.quantidadeCabritosParto}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.abatePrecoceDias && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Dias para abate precoce
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.abatePrecoceDias} dias
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.abateConvencionalDias && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Dias para abate convencional
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.abateConvencionalDias} dias
                              </td>
                            </tr>
                          )}
                          {(caracteristicasRaca.abateTardioDiasMin ||
                            caracteristicasRaca.abateTardioDiasMax) && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Dias para abate tardio
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.abateTardioDiasMin &&
                                caracteristicasRaca.abateTardioDiasMax
                                  ? `${caracteristicasRaca.abateTardioDiasMin}-${caracteristicasRaca.abateTardioDiasMax} dias`
                                  : caracteristicasRaca.abateTardioDiasMin
                                  ? `Mínimo ${caracteristicasRaca.abateTardioDiasMin} dias`
                                  : `Máximo ${caracteristicasRaca.abateTardioDiasMax} dias`}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.pelagemCouro && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Pelagem do couro
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.pelagemCouro}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.maxFemeasPorMacho && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Máximo de fêmeas por macho
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.maxFemeasPorMacho}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.femeasPorMachoIdeal && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Fêmeas por macho ideal
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.femeasPorMachoIdeal}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.ganhoPesoDiaGramas && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Ganho de peso por dia
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.ganhoPesoDiaGramas} gramas
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.percentualGorduraCarne && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Percentual de gordura da carne
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.percentualGorduraCarne}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.indiceColesterol && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Índice de colesterol
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.indiceColesterol}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.indiceGorduraSaturada && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Índice de gordura saturada
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.indiceGorduraSaturada}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.indiceCalorias && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Índice de calorias
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.indiceCalorias}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.carneMacia !== undefined && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Carne macia
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.carneMacia ? "Sim" : "Não"}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.carneSaborosa !== undefined && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Carne saborosa
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.carneSaborosa
                                  ? "Sim"
                                  : "Não"}
                              </td>
                            </tr>
                          )}
                          {caracteristicasRaca.carneSucculenta !==
                            undefined && (
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">
                                Carne suculenta
                              </td>
                              <td className="border border-gray-300 px-4 py-2">
                                {caracteristicasRaca.carneSucculenta
                                  ? "Sim"
                                  : "Não"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500">
                        Nenhuma característica cadastrada para esta raça.
                      </p>
                    )}
                    {session?.user?.email &&
                      isAdmin(session.user.email) &&
                      formData.tipo === "Caprino" &&
                      formData.raca && (
                        <div className="mt-4">
                          <Link
                            href={`/admin/racas/editar?tipo=${encodeURIComponent(
                              formData.tipo
                            )}&raca=${encodeURIComponent(formData.raca)}`}
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
                            Editar características
                          </Link>
                        </div>
                      )}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition"
                >
                  Cadastrar Rebanho
                </Button>
              </div>
            </form>
          )}

          {rebanhos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum rebanho cadastrado ainda.
            </p>
          ) : (
            <>
              {/* Abas */}
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setActiveTab("ativos")}
                  className={`px-4 py-2 rounded ${
                    activeTab === "ativos"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Ativos ({rebanhos.filter((r) => !r.deletedAt).length})
                </button>
                <button
                  onClick={() => setActiveTab("excluidos")}
                  className={`px-4 py-2 rounded ${
                    activeTab === "excluidos"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Excluídos ({rebanhos.filter((r) => r.deletedAt).length})
                </button>
              </div>

              <div className="space-y-4">
                {rebanhos
                  .filter((rebanho) =>
                    activeTab === "ativos"
                      ? !rebanho.deletedAt
                      : rebanho.deletedAt
                  )
                  .map((rebanho) => (
                    <div
                      key={rebanho.id}
                      className="border border-gray-200 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">
                            {rebanho.nomeRebanho}
                          </h3>
                          <p className="text-gray-600">Tipo: {rebanho.tipo}</p>
                          {rebanho.raca && (
                            <p className="text-gray-600">
                              Raça: {rebanho.raca}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/propriedades/${id}/rebanhos/${rebanho.id}`}
                          >
                            <Button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                              Gerenciar Animais
                            </Button>
                          </Link>
                          {activeTab === "ativos" ? (
                            <Button
                              onClick={() => handleDeleteRebanho(rebanho.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                            >
                              Excluir Rebanho
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleRestoreRebanho(rebanho.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                            >
                              Restaurar Rebanho
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
