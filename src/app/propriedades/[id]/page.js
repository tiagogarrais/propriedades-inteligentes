"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "../../components/button";

export default function PropriedadePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [propriedade, setPropriedade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rebanhos, setRebanhos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nomeRebanho: "",
    tipo: "",
  });

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
        });
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
            <div className="space-y-4">
              {rebanhos.map((rebanho) => (
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
                    </div>
                    <Link href={`/propriedades/${id}/rebanhos/${rebanho.id}`}>
                      <Button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
                        Gerenciar Animais
                      </Button>
                    </Link>
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
