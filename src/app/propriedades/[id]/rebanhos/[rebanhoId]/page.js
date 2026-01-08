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
  const [activeTab, setActiveTab] = useState("ativos"); // 'ativos', 'vendidos' ou 'excluidos'
  const [animaisAtivosCount, setAnimaisAtivosCount] = useState(0);
  const [animaisVendidosCount, setAnimaisVendidosCount] = useState(0);
  const [animaisExcluidosCount, setAnimaisExcluidosCount] = useState(0);
  const [numeroIdentificacaoError, setNumeroIdentificacaoError] = useState("");
  const [pesosHistoricos, setPesosHistoricos] = useState([]);
  const [novoPeso, setNovoPeso] = useState({
    peso: "",
    dataPeso: "",
    observacao: "",
  });
  const [formData, setFormData] = useState({
    numeroIdentificacao: "",
    nome: "",
    raca: "",
    dataNascimento: "",
    sexo: "",
    pesoAoNascer: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const fetchAnimais = useCallback(
    async (tab = "ativos") => {
      try {
        let queryParam = "";
        if (tab === "excluidos") {
          queryParam = "?deleted=true";
        } else if (tab === "vendidos") {
          queryParam = "?sold=true";
        }
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

      // Buscar vendidos
      const vendidosResponse = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais?sold=true`,
        { credentials: "include" }
      );
      if (vendidosResponse.ok) {
        const vendidos = await vendidosResponse.json();
        setAnimaisVendidosCount(vendidos.length);
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

  // Definir raça automaticamente baseada no rebanho
  useEffect(() => {
    if (rebanho?.raca && rebanho.raca !== "Rebanho misto" && !editingId) {
      setFormData((prev) => ({
        ...prev,
        raca: rebanho.raca,
      }));
    } else if (rebanho?.raca === "Rebanho misto" && !editingId) {
      setFormData((prev) => ({
        ...prev,
        raca: "",
      }));
    }
  }, [rebanho?.raca, editingId]);

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

    // Validar campos obrigatórios
    if (
      !formData.numeroIdentificacao ||
      !formData.raca ||
      !formData.dataNascimento ||
      !formData.sexo ||
      !formData.pesoAoNascer
    ) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // Construir pesos históricos: peso ao nascer + pesos adicionais
      const pesosHistoricosCompletos = [
        {
          peso: parseFloat(formData.pesoAoNascer),
          dataPeso: formData.dataNascimento,
          observacao: "Peso ao nascer",
        },
        ...pesosHistoricos.map((p) => ({
          peso: parseFloat(p.peso),
          dataPeso: p.data,
          observacao: "",
        })),
      ];

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
        body: JSON.stringify({
          numeroIdentificacao: formData.numeroIdentificacao,
          nome: formData.nome,
          raca: formData.raca,
          dataNascimento: formData.dataNascimento,
          sexo: formData.sexo,
          pesosHistoricos: pesosHistoricosCompletos,
        }),
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
    // Encontrar o peso ao nascer (peso com observação "Peso ao nascer" ou na data de nascimento)
    const pesoAoNascer =
      animal.pesosHistoricos && animal.pesosHistoricos.length > 0
        ? animal.pesosHistoricos.find(
            (peso) =>
              peso.observacao === "Peso ao nascer" ||
              (animal.dataNascimento &&
                new Date(peso.dataPeso).getTime() ===
                  new Date(animal.dataNascimento).getTime())
          )?.peso || ""
        : "";

    setFormData({
      numeroIdentificacao: animal.numeroIdentificacao || "",
      nome: animal.nome || "",
      raca:
        rebanho?.raca === "Rebanho misto"
          ? animal.raca || ""
          : animal.raca || rebanho?.raca || "",
      dataNascimento: animal.dataNascimento
        ? new Date(animal.dataNascimento).toISOString().split("T")[0]
        : "",
      sexo: animal.sexo || "",
      pesoAoNascer: pesoAoNascer,
    });
    // Carregar pesos históricos adicionais (excluindo o peso ao nascer)
    const pesosAdicionais =
      animal.pesosHistoricos && animal.pesosHistoricos.length > 0
        ? animal.pesosHistoricos
            .filter((peso) => {
              // Filtrar o peso ao nascer baseado na observação ou data de nascimento
              const isPesoAoNascer =
                peso.observacao === "Peso ao nascer" ||
                (animal.dataNascimento &&
                  new Date(peso.dataPeso).getTime() ===
                    new Date(animal.dataNascimento).getTime());
              return !isPesoAoNascer;
            })
            .sort((a, b) => new Date(a.dataPeso) - new Date(b.dataPeso))
            .map((p) => ({
              data: p.dataPeso.split("T")[0],
              peso: p.peso.toString(),
            }))
        : [];
    setPesosHistoricos(pesosAdicionais);
    setEditingId(animal.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      numeroIdentificacao: "",
      nome: "",
      raca:
        rebanho?.raca && rebanho.raca !== "Rebanho misto" ? rebanho.raca : "",
      dataNascimento: "",
      sexo: "",
      pesoAoNascer: "",
    });
    setPesosHistoricos([]);
    setNovoPeso({ peso: "", dataPeso: "", observacao: "" });
    setEditingId(null);
    setShowForm(false);
    setNumeroIdentificacaoError("");
  };

  // Funções para gerenciar pesos históricos
  const adicionarPesoHistorico = () => {
    setPesosHistoricos([...pesosHistoricos, { data: "", peso: "" }]);
  };

  const atualizarPesoHistorico = (index, campo, valor) => {
    const novosPesos = [...pesosHistoricos];
    novosPesos[index][campo] = valor;
    setPesosHistoricos(novosPesos);
  };

  const removerPesoHistorico = (index) => {
    setPesosHistoricos(pesosHistoricos.filter((_, i) => i !== index));
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

  const handleSell = async (animalId) => {
    const emailComprador = prompt("Digite o email do comprador:");
    if (!emailComprador) {
      return;
    }

    if (!emailComprador.includes("@")) {
      alert("Email inválido. Deve conter @.");
      return;
    }

    try {
      const response = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais/${animalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ action: "sell", emailComprador }),
        }
      );

      if (response.ok) {
        // Remover o animal da lista atual (ativos)
        setAnimais(animais.filter((animal) => animal.id !== animalId));
        alert("Animal vendido com sucesso!");
        fetchAnimaisCounts(); // Atualizar contagens
      } else {
        const error = await response.json();
        alert(`Erro ao vender animal: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao vender animal:", error);
      alert("Erro ao vender animal");
    }
  };

  const handleUnsell = async (animalId) => {
    if (!confirm("Tem certeza que deseja cancelar a venda deste animal?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais/${animalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ action: "unsell" }),
        }
      );

      if (response.ok) {
        // Remover o animal da lista atual (vendidos)
        setAnimais(animais.filter((animal) => animal.id !== animalId));
        alert("Venda cancelada com sucesso!");
        fetchAnimaisCounts(); // Atualizar contagens
      } else {
        const error = await response.json();
        alert(`Erro ao cancelar venda: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao cancelar venda:", error);
      alert("Erro ao cancelar venda");
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
              onClick={() => setActiveTab("vendidos")}
              className={`px-4 py-2 rounded-t-lg font-medium transition ${
                activeTab === "vendidos"
                  ? "bg-white text-gray-900 border-t border-l border-r border-gray-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Vendidos ({animaisVendidosCount})
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
                {rebanho?.tipo?.toLowerCase() === "caprino" && (
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Raça{" "}
                      {rebanho?.raca === "Rebanho misto" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {rebanho?.raca === "Rebanho misto" ? (
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
                        <option value="Canindé (nativa)">
                          Canindé (nativa)
                        </option>
                        <option value="Sem raça definida (SRD)">
                          Sem raça definida (SRD)
                        </option>
                        <option value="Boer">Boer</option>
                        <option value="Anglo-nubiana (exótica)">
                          Anglo-nubiana (exótica)
                        </option>
                        <option value="Saanen (exótica)">
                          Saanen (exótica)
                        </option>
                        <option value="Parda-alpina (exótica)">
                          Parda-alpina (exótica)
                        </option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData.raca}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    )}
                  </div>
                )}
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
                  <label className="block text-gray-700 mb-2">
                    Sexo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sexo}
                    onChange={(e) =>
                      setFormData({ ...formData, sexo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Peso ao nascer (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="200"
                    value={formData.pesoAoNascer}
                    onChange={(e) =>
                      setFormData({ ...formData, pesoAoNascer: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 2.5"
                    required
                  />
                </div>
              </div>

              {/* Histórico de Pesos Adicionais */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    📊 Pesos Adicionais
                  </h3>
                  <button
                    type="button"
                    onClick={adicionarPesoHistorico}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition"
                  >
                    ➕ Adicionar Peso
                  </button>
                </div>

                {pesosHistoricos.length > 0 && (
                  <div className="space-y-3">
                    {pesosHistoricos.map((peso, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data
                          </label>
                          <input
                            type="date"
                            value={peso.data}
                            onChange={(e) =>
                              atualizarPesoHistorico(
                                index,
                                "data",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            min={formData.dataNascimento || undefined}
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Peso (kg)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="200"
                            value={peso.peso}
                            onChange={(e) =>
                              atualizarPesoHistorico(
                                index,
                                "peso",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Ex: 35.5"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removerPesoHistorico(index)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Remover peso"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pesosHistoricos.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Nenhum peso adicional registrado. Clique em "Adicionar Peso"
                    para incluir mais registros.
                  </p>
                )}
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
                : activeTab === "vendidos"
                ? "Nenhum animal vendido."
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
                      <Link
                        href={`/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais/${animal.id}`}
                      >
                        <Button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition">
                          Ver detalhes
                        </Button>
                      </Link>
                      {activeTab === "ativos" ? (
                        <>
                          <Button
                            onClick={() => handleEdit(animal)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleSell(animal.id)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition"
                          >
                            Vender
                          </Button>
                          <Button
                            onClick={() => handleDelete(animal.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                          >
                            Excluir
                          </Button>
                        </>
                      ) : activeTab === "vendidos" ? (
                        <>
                          <Button
                            onClick={() => handleUnsell(animal.id)}
                            className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition"
                          >
                            Cancelar Venda
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
                    {animal.pesosHistoricos &&
                      animal.pesosHistoricos.length > 0 &&
                      (() => {
                        const primeiroPeso = animal.pesosHistoricos.sort(
                          (a, b) => new Date(a.dataPeso) - new Date(b.dataPeso)
                        )[0];
                        return (
                          <p>
                            <strong>Peso ao Nascer:</strong> {primeiroPeso.peso}{" "}
                            kg
                          </p>
                        );
                      })()}
                    {animal.pesosHistoricos &&
                      animal.pesosHistoricos.length > 0 &&
                      (() => {
                        const ultimoPeso = animal.pesosHistoricos.sort(
                          (a, b) => new Date(b.dataPeso) - new Date(a.dataPeso)
                        )[0];
                        return (
                          <p>
                            <strong>Último Peso:</strong> {ultimoPeso.peso} kg
                            <span className="text-xs text-gray-500 ml-1">
                              (
                              {new Date(ultimoPeso.dataPeso).toLocaleDateString(
                                "pt-BR"
                              )}
                              )
                            </span>
                          </p>
                        );
                      })()}
                    {activeTab === "vendidos" && animal.emailComprador && (
                      <p>
                        <strong>Comprador:</strong> {animal.emailComprador}
                      </p>
                    )}
                    {activeTab === "vendidos" && animal.dataVenda && (
                      <p>
                        <strong>Data da Venda:</strong>{" "}
                        {new Date(animal.dataVenda).toLocaleDateString("pt-BR")}
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
