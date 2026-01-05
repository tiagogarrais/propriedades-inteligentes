"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../components/button";

// Mapeamento de códigos de estado para siglas
const stateCodeToSigla = {
  11: "RO",
  12: "AC",
  13: "AM",
  14: "RR",
  15: "PA",
  16: "AP",
  17: "TO",
  21: "MA",
  22: "PI",
  23: "CE",
  24: "RN",
  25: "PB",
  26: "PE",
  27: "AL",
  28: "SE",
  29: "BA",
  31: "MG",
  32: "ES",
  33: "RJ",
  35: "SP",
  41: "PR",
  42: "SC",
  43: "RS",
  50: "MS",
  51: "MT",
  52: "GO",
  53: "DF",
};

export default function PropriedadesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [propriedades, setPropriedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nomePropriedade: "",
    tipo: "",
    localidade: "",
    tamanho: "",
    estado: "",
    cidade: "",
  });

  const [estadosCidades, setEstadosCidades] = useState({
    states: {},
    cities: [],
  });
  const [cidadesFiltradas, setCidadesFiltradas] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchPropriedades();
    }
  }, [status, router]);

  // Carregar dados de estados e cidades
  useEffect(() => {
    const loadEstadosCidades = async () => {
      try {
        const response = await fetch("/estados-cidades2.json");
        const data = await response.json();
        setEstadosCidades(data);
      } catch (error) {
        console.error("Erro ao carregar estados e cidades:", error);
      }
    };
    loadEstadosCidades();
  }, []);

  // Filtrar cidades baseado no estado selecionado
  useEffect(() => {
    if (formData.estado) {
      const cidades = estadosCidades.cities.filter(
        (city) => city.state_id === parseInt(formData.estado)
      );
      setCidadesFiltradas(cidades.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      setCidadesFiltradas([]);
    }
  }, [formData.estado, estadosCidades]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/propriedades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          estadoNome: estadosCidades.states[formData.estado] || "",
          cidadeNome:
            cidadesFiltradas.find((c) => c.id === parseInt(formData.cidade))
              ?.name || "",
          sessionToken: session?.user?.id || session?.user?.email, // Passar ID ou email como fallback
        }),
      });

      if (response.ok) {
        const novaPropriedade = await response.json();
        setPropriedades([novaPropriedade, ...propriedades]);
        setFormData({
          nomePropriedade: "",
          tipo: "",
          localidade: "",
          tamanho: "",
          estado: "",
          cidade: "",
        });
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao criar propriedade");
      }
    } catch (error) {
      console.error("Erro ao criar propriedade:", error);
      alert("Erro ao criar propriedade");
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
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {showForm ? "Cancelar" : "Adicionar Propriedade"}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Nova Propriedade</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Obrigatório */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Nome da Propriedade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nomePropriedade}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nomePropriedade: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoComplete="off"
                  required
                />
              </div>

              {/* Campos Opcionais */}
              <div>
                <label className="block text-gray-700 mb-2">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione o tipo (opcional)</option>
                  <option value="Fazenda">Fazenda</option>
                  <option value="Sítio">Sítio</option>
                  <option value="Chácara">Chácara</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Rancho">Rancho</option>
                  <option value="Propriedade Rural">Propriedade Rural</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Estado (UF)</label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value,
                      cidade: "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione o estado (opcional)</option>
                  {Object.entries(estadosCidades.states)
                    .sort(([, a], [, b]) =>
                      stateCodeToSigla[a.split(" ")[0]]?.localeCompare(
                        stateCodeToSigla[b.split(" ")[0]]
                      )
                    )
                    .map(([code, name]) => (
                      <option key={code} value={code}>
                        {stateCodeToSigla[code]} - {name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Cidade</label>
                <select
                  value={formData.cidade}
                  onChange={(e) =>
                    setFormData({ ...formData, cidade: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!formData.estado}
                >
                  <option value="">Selecione a cidade (opcional)</option>
                  {cidadesFiltradas.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Localidade</label>
                <input
                  type="text"
                  value={formData.localidade}
                  onChange={(e) =>
                    setFormData({ ...formData, localidade: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Bairro, distrito ou referência (opcional)"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Tamanho (hectares)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.tamanho}
                  onChange={(e) =>
                    setFormData({ ...formData, tamanho: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 50.5 (opcional)"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-green-700 transition"
              >
                Criar Propriedade
              </Button>
            </form>
          </div>
        )}

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
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
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
