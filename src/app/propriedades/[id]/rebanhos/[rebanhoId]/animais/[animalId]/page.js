"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AnimalDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id: propriedadeId, rebanhoId, animalId } = useParams();

  const [animal, setAnimal] = useState(null);
  const [racaCaracteristicas, setRacaCaracteristicas] = useState(null);
  const [rebanho, setRebanho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, propriedadeId, rebanhoId, animalId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados do animal
      const animalResponse = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}/animais/${animalId}`,
        { credentials: "include" }
      );

      if (!animalResponse.ok) {
        throw new Error("Animal não encontrado");
      }

      const animalData = await animalResponse.json();
      setAnimal(animalData);

      // Buscar dados do rebanho
      const rebanhoResponse = await fetch(
        `/api/propriedades/${propriedadeId}/rebanhos/${rebanhoId}`,
        { credentials: "include" }
      );

      if (rebanhoResponse.ok) {
        const rebanhoData = await rebanhoResponse.json();
        setRebanho(rebanhoData);

        // Buscar características da raça se disponível
        const raca = animalData.raca || rebanhoData.raca;
        const tipo = rebanhoData.tipo;

        if (raca && tipo) {
          const racaResponse = await fetch(
            `/api/raca-caracteristicas?tipo=${encodeURIComponent(
              tipo
            )}&raca=${encodeURIComponent(raca)}`,
            { credentials: "include" }
          );

          if (racaResponse.ok) {
            const racaData = await racaResponse.json();
            setRacaCaracteristicas(racaData);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const diffTime = Math.abs(hoje - nascimento);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} dias`;
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      return `${meses} ${meses === 1 ? "mês" : "meses"}`;
    } else {
      const anos = Math.floor(diffDays / 365);
      const mesesRestantes = Math.floor((diffDays % 365) / 30);
      return `${anos} ${anos === 1 ? "ano" : "anos"}${
        mesesRestantes > 0
          ? ` e ${mesesRestantes} ${mesesRestantes === 1 ? "mês" : "meses"}`
          : ""
      }`;
    }
  };

  const obterPesoAtual = () => {
    if (!animal?.pesosHistoricos || animal.pesosHistoricos.length === 0)
      return null;

    const pesosOrdenados = [...animal.pesosHistoricos].sort(
      (a, b) => new Date(b.dataPeso) - new Date(a.dataPeso)
    );

    return pesosOrdenados[0];
  };

  const obterPesoAoNascer = () => {
    if (!animal?.pesosHistoricos || animal.pesosHistoricos.length === 0)
      return null;

    return animal.pesosHistoricos.find(
      (peso) =>
        peso.observacao === "Peso ao nascer" ||
        (animal.dataNascimento &&
          new Date(peso.dataPeso).getTime() ===
            new Date(animal.dataNascimento).getTime())
    );
  };

  const calcularGanhoPeso = () => {
    const pesoAtual = obterPesoAtual();
    const pesoAoNascer = obterPesoAoNascer();

    if (!pesoAtual || !pesoAoNascer || !animal.dataNascimento) return null;

    const diffPeso = pesoAtual.peso - pesoAoNascer.peso;
    const hoje = new Date();
    const nascimento = new Date(animal.dataNascimento);
    const diffDias = Math.ceil((hoje - nascimento) / (1000 * 60 * 60 * 24));

    if (diffDias <= 0) return null;

    const ganhoPorDia = (diffPeso * 1000) / diffDias; // em gramas por dia

    return {
      total: diffPeso,
      porDia: ganhoPorDia,
      dias: diffDias,
    };
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/propriedades/${propriedadeId}/rebanhos/${rebanhoId}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Voltar ao Rebanho
          </Link>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Animal não encontrado
          </h1>
          <Link
            href={`/propriedades/${propriedadeId}/rebanhos/${rebanhoId}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Voltar ao Rebanho
          </Link>
        </div>
      </div>
    );
  }

  const pesoAtual = obterPesoAtual();
  const pesoAoNascer = obterPesoAoNascer();
  const ganhoPeso = calcularGanhoPeso();
  const idade = calcularIdade(animal.dataNascimento);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link
              href={`/propriedades/${propriedadeId}/rebanhos/${rebanhoId}`}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Voltar ao Rebanho
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {animal.nome || `Animal ${animal.numeroIdentificacao}`}
            </h1>
            <p className="text-gray-600">
              Identificação: {animal.numeroIdentificacao} | Raça:{" "}
              {animal.raca || rebanho?.raca || "Não informada"} | Sexo:{" "}
              {animal.sexo || "Não informado"}
              {idade && ` | Idade: ${idade}`}
            </p>
          </div>
        </div>

        {/* Cards de Informações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Peso Atual */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Peso Atual
            </h3>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {pesoAtual ? `${pesoAtual.peso.toFixed(1)} kg` : "Não registrado"}
            </div>
            <p className="text-sm text-gray-500">
              {pesoAtual &&
                new Date(pesoAtual.dataPeso).toLocaleDateString("pt-BR")}
            </p>
          </div>

          {/* Peso ao Nascer */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Peso ao Nascer
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {pesoAoNascer
                ? `${pesoAoNascer.peso.toFixed(1)} kg`
                : "Não registrado"}
            </div>
            {racaCaracteristicas?.pesoNascer && (
              <p className="text-sm text-gray-500">
                Média da raça: {racaCaracteristicas.pesoNascer.toFixed(1)} kg
              </p>
            )}
          </div>

          {/* Ganho de Peso */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ganho de Peso
            </h3>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {ganhoPeso ? `${ganhoPeso.porDia.toFixed(0)}g/dia` : "Sem dados"}
            </div>
            {ganhoPeso && (
              <p className="text-sm text-gray-500">
                Total: +{ganhoPeso.total.toFixed(1)} kg em {ganhoPeso.dias} dias
              </p>
            )}
            {racaCaracteristicas?.ganhoPesoDiaGramas && (
              <p className="text-sm text-gray-500">
                Média da raça:{" "}
                {racaCaracteristicas.ganhoPesoDiaGramas.toFixed(0)}g/dia
              </p>
            )}
          </div>

          {/* Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Status</h3>
            <div className="space-y-2">
              {animal.vendido ? (
                <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                  Vendido
                </span>
              ) : animal.deletedAt ? (
                <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                  Inativo
                </span>
              ) : (
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  Ativo
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Comparação com a Raça */}
        {racaCaracteristicas && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comparação com a Raça {racaCaracteristicas.raca}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Comparação de Peso */}
              {pesoAtual &&
                racaCaracteristicas.pesoFemeaAdulta &&
                animal.sexo === "Fêmea" && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Peso vs Média da Raça (Fêmea)
                    </h4>
                    <div className="flex items-center justify-between">
                      <span>Animal: {pesoAtual.peso.toFixed(1)} kg</span>
                      <span>
                        Média: {racaCaracteristicas.pesoFemeaAdulta.toFixed(1)}{" "}
                        kg
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          pesoAtual.peso >= racaCaracteristicas.pesoFemeaAdulta
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }`}
                        style={{
                          width: `${Math.min(
                            (pesoAtual.peso /
                              racaCaracteristicas.pesoFemeaAdulta) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

              {pesoAtual &&
                racaCaracteristicas.pesoMachoAdulto &&
                animal.sexo === "Macho" && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Peso vs Média da Raça (Macho)
                    </h4>
                    <div className="flex items-center justify-between">
                      <span>Animal: {pesoAtual.peso.toFixed(1)} kg</span>
                      <span>
                        Média: {racaCaracteristicas.pesoMachoAdulto.toFixed(1)}{" "}
                        kg
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          pesoAtual.peso >= racaCaracteristicas.pesoMachoAdulto
                            ? "bg-green-600"
                            : "bg-yellow-600"
                        }`}
                        style={{
                          width: `${Math.min(
                            (pesoAtual.peso /
                              racaCaracteristicas.pesoMachoAdulto) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

              {/* Informações da Raça */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Características da Raça
                </h4>
                <div className="space-y-2 text-sm">
                  {racaCaracteristicas.origem && (
                    <p>
                      <strong>Origem:</strong> {racaCaracteristicas.origem}
                    </p>
                  )}
                  {racaCaracteristicas.maturidadeSexual && (
                    <p>
                      <strong>Maturidade Sexual:</strong>{" "}
                      {Math.floor(racaCaracteristicas.maturidadeSexual / 30)}{" "}
                      meses
                    </p>
                  )}
                  {racaCaracteristicas.periodoGestacao && (
                    <p>
                      <strong>Período Gestação:</strong>{" "}
                      {racaCaracteristicas.periodoGestacao} dias
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Histórico de Peso */}
        {animal.pesosHistoricos && animal.pesosHistoricos.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Histórico de Peso
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Data</th>
                    <th className="text-left py-2 px-4">Peso (kg)</th>
                    <th className="text-left py-2 px-4">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {[...animal.pesosHistoricos]
                    .sort((a, b) => new Date(b.dataPeso) - new Date(a.dataPeso))
                    .map((peso, index) => (
                      <tr key={peso.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">
                          {new Date(peso.dataPeso).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-2 px-4 font-semibold">
                          {peso.peso.toFixed(1)} kg
                        </td>
                        <td className="py-2 px-4">{peso.observacao || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
