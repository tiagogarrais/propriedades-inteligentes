"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "../../../../components/button";

export default function RebanhoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id: propriedadeId, rebanhoId } = useParams();
  const [rebanho, setRebanho] = useState(null);
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("ativos"); // 'ativos' ou 'excluidos'
  const [animaisAtivosCount, setAnimaisAtivosCount] = useState(0);
  const [animaisExcluidosCount, setAnimaisExcluidosCount] = useState(0);
  const [numeroIdentificacaoError, setNumeroIdentificacaoError] = useState("");
  const [formData, setFormData] = useState({
    numeroIdentificacao: "",
    nome: "",
    raca: "",
    dataNascimento: "",
    sexo: "",
    pesoAoNascer: "",
    pesoAtual: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const fetchAnimais = useCallback(
    async (tab = "ativos") => {
      try {
        const queryParam = tab === "excluidos" ? "?deleted=true" : "";
        const response = await fetch(
          `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais${queryParam}`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setAnimais(data);
        }
      } catch (error) {
        console.error("Erro ao buscar animais:", error);
      } finally {
        setLoading(false);
      }
    },
    [propriedadeId, rebanhoId]
  );

  const fetchAnimaisCounts = useCallback(async () => {
    try {
      // Buscar ativos
      const ativosResponse = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais`,
        { credentials: "include" }
      );
      if (ativosResponse.ok) {
        const ativos = await ativosResponse.json();
        setAnimaisAtivosCount(ativos.length);
      }

      // Buscar excluídos
      const excluidosResponse = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais?deleted=true`,
        { credentials: "include" }
      );
      if (excluidosResponse.ok) {
        const excluidos = await excluidosResponse.json();
        setAnimaisExcluidosCount(excluidos.length);
      }
    } catch (error) {
      console.error("Erro ao buscar contagens:", error);
    }
  }, [propriedadeId, rebanhoId]);

  useEffect(() => {
    const fetchRebanho = async () => {
      try {
        const response = await fetch(
          `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setRebanho(data);
        } else {
          alert("Rebanho não encontrado");
          router.push(`/propriedades/${propriedadeId}`);
        }
      } catch (error) {
        console.error("Erro ao buscar rebanho:", error);
        alert("Erro ao buscar rebanho");
        router.push(`/propriedades/${propriedadeId}`);
      }
    };

    if (propriedadeId && rebanhoId) {
      fetchRebanho();
      fetchAnimais();
      fetchAnimaisCounts();
    }
  }, [propriedadeId, rebanhoId, router]);

  // Buscar animais quando a aba muda
  useEffect(() => {
    if (propriedadeId && rebanhoId) {
      fetchAnimais(activeTab);
    }
  }, [activeTab, propriedadeId, rebanhoId, fetchAnimais]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar unicidade antes de enviar
    const isUnico = await verificarNumeroIdentificacaoUnico(
      formData.numeroIdentificacao
    );
    if (!isUnico) {
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais/${editingId}`
        : `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const animalAtualizado = await response.json();
        if (editingId) {
          // Atualizar animal existente na lista
          setAnimais(
            animais.map((animal) =>
              animal.id === editingId ? animalAtualizado : animal
            )
          );
        } else {
          // Adicionar novo animal
          setAnimais([animalAtualizado, ...animais]);
        }
        handleCancel();
        alert(`Animal ${editingId ? "atualizado" : "cadastrado"} com sucesso!`);
        fetchAnimaisCounts(); // Atualizar contagens
      } else {
        const error = await response.json();
        alert(
          `Erro ao ${editingId ? "atualizar" : "cadastrar"} animal: ${
            error.error
          }`
        );
      }
    } catch (error) {
      console.error(
        `Erro ao ${editingId ? "atualizar" : "cadastrar"} animal:`,
        error
      );
      alert(`Erro ao ${editingId ? "atualizar" : "cadastrar"} animal`);
    }
  };

  const handleEdit = (animal) => {
    setFormData({
      numeroIdentificacao: animal.numeroIdentificacao || "",
      nome: animal.nome || "",
      raca: animal.raca || "",
      dataNascimento: animal.dataNascimento
        ? new Date(animal.dataNascimento).toISOString().split("T")[0]
        : "",
      sexo: animal.sexo || "",
      pesoAoNascer: animal.pesoAoNascer ? animal.pesoAoNascer.toString() : "",
      pesoAtual: animal.pesoAtual ? animal.pesoAtual.toString() : "",
    });
    setEditingId(animal.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      numeroIdentificacao: "",
      nome: "",
      raca: "",
      dataNascimento: "",
      sexo: "",
      pesoAoNascer: "",
      pesoAtual: "",
    });
    setEditingId(null);
    setShowForm(false);
    setNumeroIdentificacaoError("");
  };

  const verificarNumeroIdentificacaoUnico = async (numero) => {
    if (!numero) {
      setNumeroIdentificacaoError("");
      return true;
    }

    try {
      // Buscar todos os animais do rebanho (ativos e excluídos) para validação
      const response = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais?deleted=true`,
        { credentials: "include" }
      );

      if (response.ok) {
        const todosAnimais = await response.json();
        const isUnico = !todosAnimais.some(
          (animal) =>
            animal.numeroIdentificacao === numero && animal.id !== editingId // Excluir o próprio animal se estiver editando
        );

        if (!isUnico) {
          setNumeroIdentificacaoError(
            "Este número de identificação já existe neste rebanho"
          );
        } else {
          setNumeroIdentificacaoError("");
        }
        return isUnico;
      } else {
        // Se não conseguir buscar, permitir continuar (validação backend vai impedir)
        setNumeroIdentificacaoError("");
        return true;
      }
    } catch (error) {
      console.error("Erro ao verificar unicidade:", error);
      // Se houver erro, permitir continuar (validação backend vai impedir)
      setNumeroIdentificacaoError("");
      return true;
    }
  };

  const handleDelete = async (animalId) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este animal? Ele será movido para a aba 'Excluídos'."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais/${animalId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        // Remover o animal da lista atual
        setAnimais(animais.filter((animal) => animal.id !== animalId));
        alert("Animal excluído com sucesso!");
        fetchAnimaisCounts(); // Atualizar contagens
      } else {
        const error = await response.json();
        alert(`Erro ao excluir animal: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao excluir animal:", error);
      alert("Erro ao excluir animal");
    }
  };

  const handleRestore = async (animalId) => {
    try {
      const response = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais/${animalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ action: "restore" }),
        }
      );

      if (response.ok) {
        // Remover o animal da lista atual (excluídos)
        setAnimais(animais.filter((animal) => animal.id !== animalId));
        alert("Animal restaurado com sucesso!");
        fetchAnimaisCounts(); // Atualizar contagens
      } else {
        const error = await response.json();
        alert(`Erro ao restaurar animal: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao restaurar animal:", error);
      alert("Erro ao restaurar animal");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!session || !rebanho) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href={`/propriedades/${propriedadeId}`}
            className="text-blue-600 hover:underline"
          >
            ← Voltar para Propriedade
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Animais do Rebanho: {rebanho?.nomeRebanho}
          </h1>
          <p className="text-gray-600">Gerencie os animais deste rebanho.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Animais</h2>
            <Button
              onClick={editingId ? handleCancel : () => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {showForm ? "Cancelar" : "Adicionar Animal"}
            </Button>
          </div>

          {/* Abas */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab("ativos")}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                activeTab === "ativos"
                  ? "bg-white text-gray-900 border-t border-l border-r border-gray-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Ativos ({animaisAtivosCount})
            </button>
            <button
              onClick={() => setActiveTab("excluidos")}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                activeTab === "excluidos"
                  ? "bg-white text-gray-900 border-t border-l border-r border-gray-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Excluídos ({animaisExcluidosCount})
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-medium mb-4">
                {editingId ? "Editar Animal" : "Novo Animal"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Número de Identificação{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numeroIdentificacao}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        numeroIdentificacao: e.target.value,
                      });
                      // Limpar erro enquanto digita
                      if (numeroIdentificacaoError) {
                        setNumeroIdentificacaoError("");
                      }
                    }}
                    onBlur={async () =>
                      await verificarNumeroIdentificacaoUnico(
                        formData.numeroIdentificacao
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      numeroIdentificacaoError
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {numeroIdentificacaoError && (
                    <p className="text-red-500 text-sm mt-1">
                      {numeroIdentificacaoError}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Raça</label>
                  <input
                    type="text"
                    value={formData.raca}
                    onChange={(e) =>
                      setFormData({ ...formData, raca: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Nelore, Angus"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataNascimento: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Sexo</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) =>
                      setFormData({ ...formData, sexo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Peso ao Nascer (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.pesoAoNascer}
                    onChange={(e) =>
                      setFormData({ ...formData, pesoAoNascer: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 25.5"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Peso Atual (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.pesoAtual}
                    onChange={(e) =>
                      setFormData({ ...formData, pesoAtual: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 450.5"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition"
                >
                  {editingId ? "Atualizar Animal" : "Cadastrar Animal"}
                </Button>
              </div>
            </form>
          )}

          {animais.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {activeTab === "ativos"
                ? "Nenhum animal ativo cadastrado ainda."
                : "Nenhum animal excluído."}
            </p>
          ) : (
            <div className="space-y-4">
              {animais.map((animal) => (
                <div
                  key={animal.id}
                  className="border border-gray-200 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">
                      {animal.numeroIdentificacao}
                      {animal.nome && ` - ${animal.nome}`}
                    </h3>
                    <div className="flex space-x-2">
                      {activeTab === "ativos" ? (
                        <>
                          <Button
                            onClick={() => handleEdit(animal)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDelete(animal.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                          >
                            Excluir
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleRestore(animal.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                        >
                          Restaurar
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                    {animal.raca && (
                      <p>
                        <strong>Raça:</strong> {animal.raca}
                      </p>
                    )}
                    {animal.dataNascimento && (
                      <p>
                        <strong>Nascimento:</strong>{" "}
                        {new Date(animal.dataNascimento).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    )}
                    {animal.sexo && (
                      <p>
                        <strong>Sexo:</strong> {animal.sexo}
                      </p>
                    )}
                    {animal.pesoAoNascer && (
                      <p>
                        <strong>Peso ao Nascer:</strong> {animal.pesoAoNascer}{" "}
                        kg
                      </p>
                    )}
                    {animal.pesoAtual && (
                      <p>
                        <strong>Peso Atual:</strong> {animal.pesoAtual} kg
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
