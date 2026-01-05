"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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

    const fetchAnimais = async () => {
      try {
        const response = await fetch(
          `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais`,
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
    };

    if (propriedadeId && rebanhoId) {
      fetchRebanho();
      fetchAnimais();
    }
  }, [propriedadeId, rebanhoId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const newAnimal = await response.json();
        setAnimais([newAnimal, ...animais]);
        setFormData({
          numeroIdentificacao: "",
          nome: "",
          raca: "",
          dataNascimento: "",
          sexo: "",
          pesoAoNascer: "",
          pesoAtual: "",
        });
        setShowForm(false);
        alert("Animal cadastrado com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro ao cadastrar animal: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao cadastrar animal:", error);
      alert("Erro ao cadastrar animal");
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
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              {showForm ? "Cancelar" : "Adicionar Animal"}
            </Button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="text-lg font-medium mb-4">Novo Animal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Número de Identificação{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numeroIdentificacao}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numeroIdentificacao: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
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
                  Cadastrar Animal
                </Button>
              </div>
            </form>
          )}

          {animais.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum animal cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {animais.map((animal) => (
                <div
                  key={animal.id}
                  className="border border-gray-200 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-medium">
                    {animal.numeroIdentificacao}
                    {animal.nome && ` - ${animal.nome}`}
                  </h3>
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
