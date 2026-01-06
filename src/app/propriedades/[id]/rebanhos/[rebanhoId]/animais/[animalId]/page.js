"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "../../../../../../components/button";

export default function AnimalDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id: propriedadeId, rebanhoId, animalId } = useParams();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchAnimal = async () => {
      try {
        const response = await fetch(
          `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais/${animalId}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setAnimal(data);
        } else {
          alert("Erro ao buscar detalhes do animal");
        }
      } catch (error) {
        console.error("Erro ao buscar animal:", error);
        alert("Erro ao buscar detalhes do animal");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchAnimal();
    }
  }, [status, propriedadeId, rebanhoId, animalId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p>Animal não encontrado.</p>
          <Link href={`/propriedades/${propriedadeId}/rebanhos/${rebanhoId}`}>
            <Button className="mt-4">Voltar ao rebanho</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/propriedades/${propriedadeId}/rebanhos/${rebanhoId}`}>
            <Button className="bg-gray-600 text-white hover:bg-gray-700">
              ← Voltar ao rebanho
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">
            Detalhes do Animal: {animal.numeroIdentificacao}
            {animal.nome && ` - ${animal.nome}`}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Informações Básicas
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Identificação
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {animal.numeroIdentificacao}
                  </p>
                </div>
                {animal.nome && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{animal.nome}</p>
                  </div>
                )}
                {animal.raca && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Raça
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{animal.raca}</p>
                  </div>
                )}
                {animal.sexo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sexo
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{animal.sexo}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Dados Físicos</h2>
              <div className="space-y-3">
                {animal.dataNascimento && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Data de Nascimento
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(animal.dataNascimento).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>
                )}
                {animal.pesoAoNascer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Peso ao Nascer
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {animal.pesoAoNascer} kg
                    </p>
                  </div>
                )}
                {animal.pesoAtual && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Peso Atual
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {animal.pesoAtual} kg
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {animal.deletedAt
                    ? "Excluído"
                    : animal.vendido
                    ? "Vendido"
                    : "Ativo"}
                </p>
              </div>
              {animal.vendido && animal.dataVenda && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data da Venda
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(animal.dataVenda).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              {animal.vendido && animal.emailComprador && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email do Comprador
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {animal.emailComprador}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Datas do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Criado em
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(animal.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Última atualização
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(animal.updatedAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
