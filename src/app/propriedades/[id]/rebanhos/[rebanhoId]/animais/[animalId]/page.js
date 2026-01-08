"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

  const calcularIdadeEmMeses = (dataNascimento) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const diffTime = Math.abs(hoje - nascimento);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44); // Média de dias por mês
  };

  const obterFaseAtual = () => {
    if (!animal?.dataNascimento || !racaCaracteristicas?.fasesGanhoPeso)
      return null;

    const idadeMeses = calcularIdadeEmMeses(animal.dataNascimento);

    // Encontrar a fase atual baseada na idade
    return racaCaracteristicas.fasesGanhoPeso.find((fase) => {
      const mesInicio = fase.mesInicio || 0;
      const mesFim = fase.mesFim || Infinity;
      return idadeMeses >= mesInicio && idadeMeses <= mesFim;
    });
  };

  const obterNomeFasePorIdade = (idadeMeses, sexo) => {
    if (idadeMeses <= 6) return "Bezerro/Bezerra";
    if (idadeMeses <= 12) return sexo === "Macho" ? "Novilho" : "Novilha";
    if (idadeMeses <= 24) return sexo === "Macho" ? "Garrote" : "Garrocha";
    if (idadeMeses <= 36) return sexo === "Macho" ? "Toucinho" : "Toucinha";
    return sexo === "Macho" ? "Adulto" : "Adulta";
  };

  const gerarDadosGraficoFase = (faseAtual, idadeMeses, animal) => {
    if (!faseAtual || !animal?.dataNascimento) return null;

    const pesoInicio = animal.sexo === "Macho" ? faseAtual.pesoMedioInicioMacho : faseAtual.pesoMedioInicioFemea;
    const pesoFim = animal.sexo === "Macho" ? faseAtual.pesoMedioFimMacho : faseAtual.pesoMedioFimFemea;

    if (!pesoInicio || !pesoFim) return null;

    const mesInicio = faseAtual.mesInicio || 0;
    const mesFim = faseAtual.mesFim || idadeMeses + 1;
    const totalMeses = mesFim - mesInicio;

    // Gerar pontos da curva esperada
    const labels = [];
    const dadosEsperados = [];

    for (let mes = mesInicio; mes <= mesFim; mes++) {
      labels.push(`${mes} meses`);
      const progresso = (mes - mesInicio) / totalMeses;
      const pesoEsperado = pesoInicio + (pesoFim - pesoInicio) * progresso;
      dadosEsperados.push(pesoEsperado);
    }

    // Preparar dados reais do animal (últimos 12 meses ou conforme disponível)
    const dadosReais = new Array(labels.length).fill(null);
    const nascimento = new Date(animal.dataNascimento);

    if (animal.pesosHistoricos && animal.pesosHistoricos.length > 0) {
      // Ordenar pesos por data
      const pesosOrdenados = [...animal.pesosHistoricos]
        .sort((a, b) => new Date(a.dataPeso) - new Date(b.dataPeso))
        .filter(peso => {
          const dataPeso = new Date(peso.dataPeso);
          const mesesDesdeNascimento = Math.floor((dataPeso - nascimento) / (1000 * 60 * 60 * 24 * 30.44));
          return mesesDesdeNascimento >= mesInicio && mesesDesdeNascimento <= mesFim;
        });

      pesosOrdenados.forEach(peso => {
        const dataPeso = new Date(peso.dataPeso);
        const mesesDesdeNascimento = Math.floor((dataPeso - nascimento) / (1000 * 60 * 60 * 24 * 30.44));
        const indice = mesesDesdeNascimento - mesInicio;

        if (indice >= 0 && indice < dadosReais.length) {
          dadosReais[indice] = peso.peso;
        }
      });
    }

    return {
      labels,
      datasets: [
        {
          label: "Peso Esperado (Raça)",
          data: dadosEsperados,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.4,
        },
        {
          label: `Peso Real (${animal.nome})`,
          data: dadosReais,
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          spanGaps: true,
        },
      ],
    };
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
              Último Peso registrado
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

        {/* Fase Atual de Vida */}
        {racaCaracteristicas?.fasesGanhoPeso &&
          racaCaracteristicas.fasesGanhoPeso.length > 0 &&
          (() => {
            const faseAtual = obterFaseAtual();
            const idadeMeses = calcularIdadeEmMeses(animal.dataNascimento);
            const pesoAtual = obterPesoAtual();
            const nomeFase = obterNomeFasePorIdade(idadeMeses, animal.sexo);

            if (!faseAtual) return null;

            const pesoInicio =
              animal.sexo === "Macho"
                ? faseAtual.pesoMedioInicioMacho
                : faseAtual.pesoMedioInicioFemea;
            const pesoFim =
              animal.sexo === "Macho"
                ? faseAtual.pesoMedioFimMacho
                : faseAtual.pesoMedioFimFemea;

            // Calcular desempenho comparativo
            let statusPeso = "normal";
            let comparacaoTexto = "";
            let corStatus = "text-gray-600";

            if (pesoAtual && pesoInicio && pesoFim) {
              const progressoEsperado =
                (idadeMeses - (faseAtual.mesInicio || 0)) /
                ((faseAtual.mesFim || idadeMeses + 1) -
                  (faseAtual.mesInicio || 0));
              const pesoEsperado =
                pesoInicio + (pesoFim - pesoInicio) * progressoEsperado;

              if (pesoAtual.peso > pesoEsperado * 1.1) {
                statusPeso = "acima";
                comparacaoTexto = `+${(pesoAtual.peso - pesoEsperado).toFixed(
                  1
                )} kg acima da média`;
                corStatus = "text-green-600";
              } else if (pesoAtual.peso < pesoEsperado * 0.9) {
                statusPeso = "abaixo";
                comparacaoTexto = `${(pesoEsperado - pesoAtual.peso).toFixed(
                  1
                )} kg abaixo da média`;
                corStatus = "text-red-600";
              } else {
                comparacaoTexto = "Dentro da média da raça";
                corStatus = "text-blue-600";
              }
            }

            return (
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Fase Atual: {nomeFase} ({idadeMeses} meses)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações da Fase */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {faseAtual.nome}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Período:</span>
                        <span className="font-medium">
                          {faseAtual.mesInicio || 0} - {faseAtual.mesFim || "?"}{" "}
                          meses
                        </span>
                      </div>
                      {pesoInicio && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Peso Início ({animal.sexo}):
                          </span>
                          <span className="font-medium">
                            {pesoInicio.toFixed(1)} kg
                          </span>
                        </div>
                      )}
                      {pesoFim && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Peso Fim ({animal.sexo}):
                          </span>
                          <span className="font-medium">
                            {pesoFim.toFixed(1)} kg
                          </span>
                        </div>
                      )}
                      {pesoInicio && pesoFim && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ganho Esperado:</span>
                          <span className="font-medium text-green-600">
                            +{(pesoFim - pesoInicio).toFixed(1)} kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Desempenho Atual */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Desempenho Atual
                    </h3>
                    <div className="space-y-2 text-sm">
                      {pesoAtual ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Peso Atual:</span>
                            <span className="font-medium">
                              {pesoAtual.peso.toFixed(1)} kg
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Data da Pesagem:
                            </span>
                            <span className="font-medium">
                              {new Date(pesoAtual.dataPeso).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Comparação com Média:
                            </span>
                            <span className={`font-medium ${corStatus}`}>
                              {comparacaoTexto}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500 italic">
                          Nenhum peso registrado ainda
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso Visual */}
                {pesoAtual && pesoInicio && pesoFim && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Progresso na Fase Atual
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          statusPeso === "acima"
                            ? "bg-green-500"
                            : statusPeso === "abaixo"
                            ? "bg-red-500"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              ((pesoAtual.peso - pesoInicio) /
                                (pesoFim - pesoInicio)) *
                                100
                            )
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>{pesoInicio.toFixed(1)} kg</span>
                      <span>{pesoFim.toFixed(1)} kg</span>
                    </div>
                  </div>
                )}

                {/* Gráfico de Curva de Peso */}
                {(() => {
                  const dadosGrafico = gerarDadosGraficoFase(faseAtual, idadeMeses, animal);
                  return dadosGrafico ? (
                    <div className="mt-8">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Curva de Peso - Fase Atual ({faseAtual.nome})
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Line
                          data={dadosGrafico}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "top",
                              },
                              title: {
                                display: false,
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    return `${context.dataset.label}: ${context.parsed.y?.toFixed(1)} kg`;
                                  }
                                }
                              }
                            },
                            scales: {
                              x: {
                                display: true,
                                title: {
                                  display: true,
                                  text: "Idade (meses)",
                                },
                              },
                              y: {
                                display: true,
                                title: {
                                  display: true,
                                  text: "Peso (kg)",
                                },
                                beginAtZero: false,
                              },
                            },
                            elements: {
                              point: {
                                radius: 4,
                                hoverRadius: 6,
                              },
                            },
                          }}
                          height={300}
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          <strong>Legenda:</strong> Linha azul mostra o peso esperado para a raça.
                          Linha verde mostra os pesos reais registrados do animal.
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            );
          })()}

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
