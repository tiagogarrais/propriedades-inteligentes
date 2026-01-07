"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Button from "../../../../../../components/button";
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
  const [loading, setLoading] = useState(true);
  const [racaCaracteristicas, setRacaCaracteristicas] = useState(null);

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

  // Buscar características da raça quando o animal for carregado
  useEffect(() => {
    const fetchRacaCaracteristicas = async () => {
      if (animal?.raca) {
        try {
          const response = await fetch(
            `/api/raca-caracteristicas?tipo=Caprino&raca=${encodeURIComponent(
              animal.raca
            )}`
          );
          if (response.ok) {
            const data = await response.json();
            setRacaCaracteristicas(data);
          }
        } catch (error) {
          console.error("Erro ao buscar características da raça:", error);
        }
      }
    };

    if (animal) {
      fetchRacaCaracteristicas();
    }
  }, [animal]);

  // Função para calcular idade do animal
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return null;

    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const diffTime = Math.abs(hoje - nascimento);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
    } else if (diffDays < 365) {
      const meses = Math.floor(diffDays / 30);
      const diasRestantes = diffDays % 30;
      return `${meses} ${meses === 1 ? "mês" : "meses"}${
        diasRestantes > 0
          ? ` e ${diasRestantes} dia${diasRestantes !== 1 ? "s" : ""}`
          : ""
      }`;
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

  // Função para calcular idade em meses
  const calcularIdadeEmMeses = (dataNascimento) => {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    return Math.floor((hoje - nascimento) / (1000 * 60 * 60 * 24 * 30));
  };

  // Função para calcular idade em dias
  const calcularIdadeEmDias = (dataNascimento) => {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    return Math.floor((hoje - nascimento) / (1000 * 60 * 60 * 24));
  };

  // Função para analisar desenvolvimento do animal
  const analisarDesenvolvimento = () => {
    if (!animal?.dataNascimento || !animal?.pesoAtual || !racaCaracteristicas) {
      return null;
    }

    const idadeMeses = calcularIdadeEmMeses(animal.dataNascimento);
    const idadeDias = calcularIdadeEmDias(animal.dataNascimento);
    const pesoAtual = animal.pesoAtual;

    let pesoEsperado = 0;
    let statusDesenvolvimento = "";
    let recomendacao = "";
    let percentualPadrao = 0;

    if (idadeMeses <= 1) {
      pesoEsperado = racaCaracteristicas.pesoNascer || 0;
    } else if (idadeMeses <= 10) {
      const pesoInicial = racaCaracteristicas.pesoNascer || 0;
      const pesoFinal = racaCaracteristicas.peso10Meses || 0;
      const progresso = Math.min(idadeMeses / 10, 1);
      pesoEsperado = pesoInicial + (pesoFinal - pesoInicial) * progresso;
    } else {
      pesoEsperado =
        animal.sexo === "Macho"
          ? racaCaracteristicas.pesoMachoAdulto || 0
          : racaCaracteristicas.pesoFemeaAdulta || 0;
    }

    if (pesoEsperado > 0) {
      percentualPadrao = ((pesoAtual / pesoEsperado) * 100).toFixed(1);

      if (percentualPadrao >= 90 && percentualPadrao <= 110) {
        statusDesenvolvimento = "Desenvolvimento adequado";
        recomendacao = "Manter manejo atual";
      } else if (percentualPadrao < 90) {
        statusDesenvolvimento = "Abaixo do peso esperado";
        recomendacao =
          percentualPadrao < 75
            ? "Avaliar saúde e aumentar suplementação urgente"
            : "Aumentar suplementação alimentar";
      } else {
        statusDesenvolvimento = "Acima do peso esperado";
        recomendacao = "Excelente desenvolvimento, monitorar";
      }
    } else {
      statusDesenvolvimento = "Dados insuficientes";
    }

    return {
      pesoEsperado,
      statusDesenvolvimento,
      recomendacao,
      idadeMeses,
      idadeDias,
      percentualPadrao,
    };
  };

  // Função para gerar agenda futura
  const gerarAgendaFutura = () => {
    if (!animal?.dataNascimento || !racaCaracteristicas) {
      return [];
    }

    const eventos = [];
    const hoje = new Date();
    const nascimento = new Date(animal.dataNascimento);
    const idadeDias = calcularIdadeEmDias(animal.dataNascimento);
    const idadeMeses = calcularIdadeEmMeses(animal.dataNascimento);

    // Função auxiliar para adicionar dias a uma data
    const adicionarDias = (data, dias) => {
      const novaData = new Date(data);
      novaData.setDate(novaData.getDate() + dias);
      return novaData;
    };

    // Desmame (geralmente entre 60-90 dias)
    const diasDesmame = 75;
    if (idadeDias < diasDesmame) {
      const dataDesmame = adicionarDias(nascimento, diasDesmame);
      eventos.push({
        tipo: "desmame",
        titulo: "🍼 Desmame Recomendado",
        data: dataDesmame,
        diasRestantes: diasDesmame - idadeDias,
        descricao: "Idade ideal para iniciar o desmame gradual",
        cor: "amber",
        prioridade: 1,
      });
    }

    // Maturidade Sexual
    if (racaCaracteristicas.maturidadeSexual) {
      const diasMaturidade = racaCaracteristicas.maturidadeSexual * 30;
      if (idadeDias < diasMaturidade) {
        const dataMaturidade = adicionarDias(nascimento, diasMaturidade);
        eventos.push({
          tipo: "maturidade",
          titulo:
            animal.sexo === "Fêmea"
              ? "🌸 Maturidade Sexual"
              : "🦌 Maturidade Sexual",
          data: dataMaturidade,
          diasRestantes: diasMaturidade - idadeDias,
          descricao:
            animal.sexo === "Fêmea"
              ? "Animal estará apto para reprodução"
              : "Animal poderá ser usado como reprodutor",
          cor: "pink",
          prioridade: 2,
        });
      }
    }

    // Abate Precoce (carne premium)
    if (racaCaracteristicas.abatePrecoceDias) {
      const diasAbatePrecoce = racaCaracteristicas.abatePrecoceDias;
      const margem = 15; // margem de +/- 15 dias
      if (idadeDias < diasAbatePrecoce + margem) {
        const dataAbatePrecoce = adicionarDias(nascimento, diasAbatePrecoce);
        const status =
          idadeDias >= diasAbatePrecoce - margem &&
          idadeDias <= diasAbatePrecoce + margem
            ? "atual"
            : idadeDias < diasAbatePrecoce - margem
            ? "futuro"
            : "passado";

        if (status !== "passado") {
          eventos.push({
            tipo: "abate_precoce",
            titulo: "⭐ Janela Abate Precoce",
            data: dataAbatePrecoce,
            diasRestantes: diasAbatePrecoce - idadeDias,
            descricao: `Período ideal para carne premium (${
              diasAbatePrecoce - margem
            } a ${diasAbatePrecoce + margem} dias)`,
            cor: "yellow",
            prioridade: status === "atual" ? 0 : 3,
            status,
          });
        }
      }
    }

    // Abate Convencional
    if (racaCaracteristicas.abateConvencionalDias) {
      const diasAbateConv = racaCaracteristicas.abateConvencionalDias;
      const margem = 30;
      if (idadeDias < diasAbateConv + margem) {
        const dataAbateConv = adicionarDias(nascimento, diasAbateConv);
        const status =
          idadeDias >= diasAbateConv - margem &&
          idadeDias <= diasAbateConv + margem
            ? "atual"
            : idadeDias < diasAbateConv - margem
            ? "futuro"
            : "passado";

        if (status !== "passado") {
          eventos.push({
            tipo: "abate_convencional",
            titulo: "🎯 Janela Abate Convencional",
            data: dataAbateConv,
            diasRestantes: diasAbateConv - idadeDias,
            descricao: `Período padrão para abate (${
              diasAbateConv - margem
            } a ${diasAbateConv + margem} dias)`,
            cor: "blue",
            prioridade: status === "atual" ? 0 : 4,
            status,
          });
        }
      }
    }

    // Abate Tardio
    if (
      racaCaracteristicas.abateTardioDiasMin &&
      racaCaracteristicas.abateTardioDiasMax
    ) {
      const diasMin = racaCaracteristicas.abateTardioDiasMin;
      const diasMax = racaCaracteristicas.abateTardioDiasMax;
      if (idadeDias < diasMax) {
        const dataInicio = adicionarDias(nascimento, diasMin);
        const status =
          idadeDias >= diasMin && idadeDias <= diasMax
            ? "atual"
            : idadeDias < diasMin
            ? "futuro"
            : "passado";

        if (status !== "passado") {
          eventos.push({
            tipo: "abate_tardio",
            titulo: "📅 Janela Abate Tardio",
            data: dataInicio,
            diasRestantes: diasMin - idadeDias,
            descricao: `Período para maior peso (${diasMin} a ${diasMax} dias)`,
            cor: "red",
            prioridade: status === "atual" ? 0 : 5,
            status,
          });
        }
      }
    }

    // Para fêmeas: primeira cobertura ideal
    if (animal.sexo === "Fêmea" && racaCaracteristicas.maturidadeSexual) {
      const diasPrimeiraCria = (racaCaracteristicas.maturidadeSexual + 2) * 30; // 2 meses após maturidade
      if (idadeDias < diasPrimeiraCria) {
        const dataPrimeiraCria = adicionarDias(nascimento, diasPrimeiraCria);
        eventos.push({
          tipo: "cobertura",
          titulo: "💕 Primeira Cobertura Ideal",
          data: dataPrimeiraCria,
          diasRestantes: diasPrimeiraCria - idadeDias,
          descricao: "Idade recomendada para primeira cobertura",
          cor: "purple",
          prioridade: 6,
        });
      }
    }

    // Peso adulto estimado
    const pesoAdultoEsperado =
      animal.sexo === "Macho"
        ? racaCaracteristicas.pesoMachoAdulto
        : racaCaracteristicas.pesoFemeaAdulta;

    if (pesoAdultoEsperado && animal.pesoAtual) {
      const percentualAtual = (animal.pesoAtual / pesoAdultoEsperado) * 100;
      if (percentualAtual < 95) {
        // Estimar quando atingirá peso adulto
        const ganhoDia = racaCaracteristicas.ganhoPesoDiaGramas || 150;
        const pesoFaltante = pesoAdultoEsperado - animal.pesoAtual;
        const diasParaPesoAdulto = Math.ceil((pesoFaltante * 1000) / ganhoDia);
        const dataAtingirPeso = adicionarDias(hoje, diasParaPesoAdulto);

        eventos.push({
          tipo: "peso_adulto",
          titulo: "⚖️ Peso Adulto Estimado",
          data: dataAtingirPeso,
          diasRestantes: diasParaPesoAdulto,
          descricao: `Previsão para atingir ${pesoAdultoEsperado}kg`,
          cor: "green",
          prioridade: 7,
        });
      }
    }

    // Ordenar por prioridade e depois por data
    return eventos.sort(
      (a, b) => a.prioridade - b.prioridade || a.diasRestantes - b.diasRestantes
    );
  };

  // Função para gerar comparações detalhadas
  const gerarComparacoes = () => {
    if (!animal || !racaCaracteristicas) return null;

    const comparacoes = [];

    // Comparação peso ao nascer
    if (animal.pesoAoNascer && racaCaracteristicas.pesoNascer) {
      const diff = animal.pesoAoNascer - racaCaracteristicas.pesoNascer;
      const percentual = (
        (animal.pesoAoNascer / racaCaracteristicas.pesoNascer) *
        100
      ).toFixed(0);
      comparacoes.push({
        titulo: "Peso ao Nascer",
        valorAnimal: `${animal.pesoAoNascer} kg`,
        valorPadrao: `${racaCaracteristicas.pesoNascer} kg`,
        diferenca: diff.toFixed(2),
        percentual,
        status:
          percentual >= 90 && percentual <= 110
            ? "adequado"
            : percentual > 110
            ? "acima"
            : "abaixo",
        icone: "🐣",
      });
    }

    // Comparação peso atual
    const analise = analisarDesenvolvimento();
    if (analise && analise.pesoEsperado > 0 && animal.pesoAtual) {
      const diff = animal.pesoAtual - analise.pesoEsperado;
      comparacoes.push({
        titulo: `Peso aos ${analise.idadeMeses} meses`,
        valorAnimal: `${animal.pesoAtual} kg`,
        valorPadrao: `${analise.pesoEsperado.toFixed(1)} kg`,
        diferenca: diff.toFixed(2),
        percentual: analise.percentualPadrao,
        status:
          analise.percentualPadrao >= 90 && analise.percentualPadrao <= 110
            ? "adequado"
            : analise.percentualPadrao > 110
            ? "acima"
            : "abaixo",
        icone: "⚖️",
      });
    }

    // Comparação ganho de peso diário
    if (
      animal.pesoAoNascer &&
      animal.pesoAtual &&
      animal.dataNascimento &&
      racaCaracteristicas.ganhoPesoDiaGramas
    ) {
      const idadeDias = calcularIdadeEmDias(animal.dataNascimento);
      if (idadeDias > 0) {
        const ganhoTotal = animal.pesoAtual - animal.pesoAoNascer;
        const ganhoDiaReal = (ganhoTotal * 1000) / idadeDias; // em gramas
        const ganhoPadrao = racaCaracteristicas.ganhoPesoDiaGramas;
        const percentual = ((ganhoDiaReal / ganhoPadrao) * 100).toFixed(0);

        comparacoes.push({
          titulo: "Ganho Diário Médio",
          valorAnimal: `${ganhoDiaReal.toFixed(0)}g/dia`,
          valorPadrao: `${ganhoPadrao}g/dia`,
          diferenca: (ganhoDiaReal - ganhoPadrao).toFixed(0),
          percentual,
          status:
            percentual >= 85 && percentual <= 115
              ? "adequado"
              : percentual > 115
              ? "acima"
              : "abaixo",
          icone: "📈",
        });
      }
    }

    return comparacoes;
  };

  // Função para gerar dados do gráfico peso-idade
  const gerarDadosGrafico = () => {
    if (!animal?.dataNascimento || !racaCaracteristicas) {
      return null;
    }

    const idadeAtualMeses = calcularIdadeEmMeses(animal.dataNascimento);
    const pesoAtual = animal.pesoAtual;

    // Gerar pontos da curva esperada (até 24 meses)
    const pontosEsperados = [];
    const labels = [];
    const pesosEsperados = [];
    const pesosAtuais = [];

    for (let mes = 0; mes <= 24; mes++) {
      labels.push(`${mes}m`);

      let pesoEsperadoMes = 0;

      if (mes === 0) {
        // Nascimento
        pesoEsperadoMes = racaCaracteristicas.pesoNascer || 0;
      } else if (mes <= 10) {
        // Até 10 meses - interpolação linear
        const pesoInicial = racaCaracteristicas.pesoNascer || 0;
        const pesoFinal = racaCaracteristicas.peso10Meses || 0;
        const progresso = mes / 10;
        pesoEsperadoMes = pesoInicial + (pesoFinal - pesoInicial) * progresso;
      } else {
        // Após 10 meses - aproximando para peso adulto
        const pesoAdulto =
          animal.sexo === "Macho"
            ? racaCaracteristicas.pesoMachoAdulto || 0
            : racaCaracteristicas.pesoFemeaAdulta || 0;

        if (pesoAdulto > 0) {
          const peso10Meses = racaCaracteristicas.peso10Meses || 0;
          // Crescimento mais lento após 10 meses
          const progressoAdulto = Math.min((mes - 10) / 14, 1); // 14 meses para atingir peso adulto
          pesoEsperadoMes =
            peso10Meses + (pesoAdulto - peso10Meses) * progressoAdulto;
        } else {
          pesoEsperadoMes = racaCaracteristicas.peso10Meses || 0;
        }
      }

      pesosEsperados.push(pesoEsperadoMes);

      // Ponto atual do animal
      if (mes === Math.round(idadeAtualMeses)) {
        pesosAtuais.push(pesoAtual);
      } else {
        pesosAtuais.push(null); // null para não mostrar ponto
      }
    }

    return {
      labels,
      datasets: [
        {
          label: "Curva Esperada da Raça",
          data: pesosEsperados,
          borderColor: "rgb(59, 130, 246)", // blue-500
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: "Peso Atual do Animal",
          data: pesosAtuais,
          borderColor: "rgb(239, 68, 68)", // red-500
          backgroundColor: "rgb(239, 68, 68)",
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: false,
          showLine: false, // Apenas pontos, não linha
        },
      ],
    };
  };

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
                {animal.dataNascimento && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Idade
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {calcularIdade(animal.dataNascimento)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seção de Comparações com Padrão da Raça */}
          {(() => {
            const comparacoes = gerarComparacoes();
            return comparacoes && comparacoes.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📊 Comparação com Padrão da Raça
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparacoes.map((comp, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-lg p-4 ${
                        comp.status === "adequado"
                          ? "border-green-300 bg-green-50"
                          : comp.status === "acima"
                          ? "border-blue-300 bg-blue-50"
                          : "border-red-300 bg-red-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{comp.icone}</span>
                        <h3 className="font-medium text-gray-900">
                          {comp.titulo}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Animal:</span>
                          <span className="font-bold">{comp.valorAnimal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Padrão:</span>
                          <span className="font-medium">
                            {comp.valorPadrao}
                          </span>
                        </div>

                        {/* Barra de progresso visual */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>0%</span>
                            <span
                              className={`font-bold ${
                                comp.status === "adequado"
                                  ? "text-green-600"
                                  : comp.status === "acima"
                                  ? "text-blue-600"
                                  : "text-red-600"
                              }`}
                            >
                              {comp.percentual}%
                            </span>
                            <span>150%</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full relative">
                              {/* Zona ideal (90-110%) */}
                              <div
                                className="absolute h-full bg-green-200"
                                style={{ left: "60%", width: "13.3%" }}
                              ></div>
                              {/* Marcador do animal */}
                              <div
                                className={`absolute h-full w-1 ${
                                  comp.status === "adequado"
                                    ? "bg-green-600"
                                    : comp.status === "acima"
                                    ? "bg-blue-600"
                                    : "bg-red-600"
                                }`}
                                style={{
                                  left: `${Math.min(
                                    Math.max(comp.percentual / 1.5, 0),
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`text-sm font-medium text-center mt-2 ${
                            comp.status === "adequado"
                              ? "text-green-700"
                              : comp.status === "acima"
                              ? "text-blue-700"
                              : "text-red-700"
                          }`}
                        >
                          {comp.status === "adequado"
                            ? "✅ Dentro do padrão"
                            : comp.status === "acima"
                            ? "⬆️ Acima do padrão"
                            : "⬇️ Abaixo do padrão"}
                          <span className="ml-1">
                            ({comp.diferenca > 0 ? "+" : ""}
                            {comp.diferenca}
                            {comp.titulo.includes("Ganho") ? "g" : "kg"})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Seção de Análise de Desenvolvimento */}
          {(() => {
            const analise = analisarDesenvolvimento();
            return analise ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🔬 Análise de Desenvolvimento
                </h2>

                {/* Card de Status Principal */}
                <div
                  className={`p-6 rounded-xl border-2 ${
                    analise.statusDesenvolvimento.includes("adequado")
                      ? "bg-gradient-to-r from-green-50 to-emerald-100 border-green-300"
                      : analise.statusDesenvolvimento.includes("Abaixo")
                      ? "bg-gradient-to-r from-red-50 to-orange-100 border-red-300"
                      : "bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">
                          {analise.statusDesenvolvimento.includes("adequado")
                            ? "✅"
                            : analise.statusDesenvolvimento.includes("Abaixo")
                            ? "⚠️"
                            : "🚀"}
                        </span>
                        <div>
                          <h3
                            className={`text-xl font-bold ${
                              analise.statusDesenvolvimento.includes("adequado")
                                ? "text-green-800"
                                : analise.statusDesenvolvimento.includes(
                                    "Abaixo"
                                  )
                                ? "text-red-800"
                                : "text-blue-800"
                            }`}
                          >
                            {analise.statusDesenvolvimento}
                          </h3>
                          {analise.recomendacao && (
                            <p className="text-gray-600 mt-1">
                              💡 {analise.recomendacao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Indicador Visual de Percentual */}
                    {analise.percentualPadrao > 0 && (
                      <div className="text-center">
                        <div
                          className={`text-5xl font-black ${
                            analise.percentualPadrao >= 90 &&
                            analise.percentualPadrao <= 110
                              ? "text-green-600"
                              : analise.percentualPadrao > 110
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {analise.percentualPadrao}%
                        </div>
                        <div className="text-sm text-gray-500">
                          do peso esperado
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Métricas Resumidas */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {analise.idadeMeses}
                    </div>
                    <div className="text-sm text-gray-600">Meses de vida</div>
                  </div>

                  <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {analise.idadeDias}
                    </div>
                    <div className="text-sm text-gray-600">Dias de vida</div>
                  </div>

                  {animal.pesoAoNascer && animal.pesoAtual && (
                    <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-emerald-600">
                        +{(animal.pesoAtual - animal.pesoAoNascer).toFixed(1)}kg
                      </div>
                      <div className="text-sm text-gray-600">Ganho total</div>
                    </div>
                  )}

                  {animal.pesoAoNascer && animal.pesoAtual && (
                    <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-indigo-600">
                        {(animal.pesoAtual / animal.pesoAoNascer).toFixed(1)}x
                      </div>
                      <div className="text-sm text-gray-600">Multiplicador</div>
                    </div>
                  )}
                </div>
              </div>
            ) : null;
          })()}

          {/* Seção do Gráfico Peso-Idade */}
          {(() => {
            const dadosGrafico = gerarDadosGrafico();
            return dadosGrafico ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Curva de Crescimento Peso-Idade
                </h2>
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="h-80">
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
                            display: true,
                            text: `Desenvolvimento de Peso - ${animal.raca}`,
                            font: {
                              size: 14,
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `${
                                  context.dataset.label
                                }: ${context.parsed.y?.toFixed(1)} kg`;
                              },
                            },
                          },
                        },
                        scales: {
                          x: {
                            title: {
                              display: true,
                              text: "Idade (meses)",
                            },
                          },
                          y: {
                            title: {
                              display: true,
                              text: "Peso (kg)",
                            },
                            beginAtZero: true,
                          },
                        },
                        interaction: {
                          intersect: false,
                          mode: "index",
                        },
                      }}
                    />
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      <strong>Legenda:</strong> A linha azul mostra a curva de
                      crescimento esperada para a raça {animal.raca}. O ponto
                      vermelho indica o peso atual do animal aos{" "}
                      {calcularIdadeEmMeses(animal.dataNascimento)} meses de
                      idade.
                    </p>
                    <p className="mt-2">
                      <strong>Projeção:</strong> A curva continua até os 24
                      meses, mostrando o desenvolvimento esperado até a
                      maturidade.
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Seção de Agenda Futura */}
          {(() => {
            const eventos = gerarAgendaFutura();
            return eventos && eventos.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  📅 Agenda Futura - Eventos Previstos
                </h2>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Timeline de eventos */}
                  <div className="divide-y divide-gray-100">
                    {eventos.map((evento, index) => {
                      const corClasses = {
                        amber: "bg-amber-100 border-amber-500 text-amber-800",
                        pink: "bg-pink-100 border-pink-500 text-pink-800",
                        yellow:
                          "bg-yellow-100 border-yellow-500 text-yellow-800",
                        blue: "bg-blue-100 border-blue-500 text-blue-800",
                        red: "bg-red-100 border-red-500 text-red-800",
                        purple:
                          "bg-purple-100 border-purple-500 text-purple-800",
                        green: "bg-green-100 border-green-500 text-green-800",
                      };
                      const corBadge = {
                        amber: "bg-amber-500",
                        pink: "bg-pink-500",
                        yellow: "bg-yellow-500",
                        blue: "bg-blue-500",
                        red: "bg-red-500",
                        purple: "bg-purple-500",
                        green: "bg-green-500",
                      };

                      return (
                        <div
                          key={index}
                          className={`p-4 flex items-start gap-4 ${
                            evento.status === "atual"
                              ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                              : ""
                          }`}
                        >
                          {/* Indicador de timeline */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                corBadge[evento.cor]
                              }`}
                            ></div>
                            {index < eventos.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                            )}
                          </div>

                          {/* Conteúdo do evento */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">
                                {evento.titulo}
                              </span>
                              {evento.status === "atual" && (
                                <span className="px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full animate-pulse">
                                  JANELA ATUAL
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {evento.descricao}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span
                                className={`px-2 py-1 rounded border-l-4 ${
                                  corClasses[evento.cor]
                                }`}
                              >
                                📆 {evento.data.toLocaleDateString("pt-BR")}
                              </span>
                              {evento.diasRestantes > 0 ? (
                                <span className="text-gray-500">
                                  ⏳ {evento.diasRestantes} dias restantes
                                </span>
                              ) : evento.diasRestantes < 0 ? (
                                <span className="text-orange-600 font-medium">
                                  🔔 Há {Math.abs(evento.diasRestantes)} dias
                                </span>
                              ) : (
                                <span className="text-green-600 font-medium">
                                  ✨ Hoje!
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resumo visual da linha do tempo */}
                <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    📊 Visão Geral da Linha do Tempo
                  </h3>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    {/* Marcador de posição atual */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
                      style={{ left: "0%" }}
                      title="Hoje"
                    ></div>

                    {eventos.slice(0, 5).map((evento, index) => {
                      const maxDias = Math.max(
                        ...eventos.map((e) => e.diasRestantes),
                        365
                      );
                      const posicao = Math.min(
                        (evento.diasRestantes / maxDias) * 100,
                        100
                      );
                      const cores = {
                        amber: "bg-amber-400",
                        pink: "bg-pink-400",
                        yellow: "bg-yellow-400",
                        blue: "bg-blue-400",
                        red: "bg-red-400",
                        purple: "bg-purple-400",
                        green: "bg-green-400",
                      };

                      return (
                        <div
                          key={index}
                          className={`absolute top-1 bottom-1 w-3 h-6 rounded ${
                            cores[evento.cor]
                          } cursor-pointer hover:scale-125 transition-transform`}
                          style={{ left: `${posicao}%` }}
                          title={`${evento.titulo}: ${evento.diasRestantes} dias`}
                        ></div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Hoje</span>
                    <span>
                      +{Math.max(...eventos.map((e) => e.diasRestantes))} dias
                    </span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Seção de Características Técnicas da Raça - Colapsável */}
          {racaCaracteristicas && (
            <details className="mt-6 group">
              <summary className="list-none cursor-pointer">
                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    📋 Características Técnicas da Raça {animal.raca}
                  </h2>
                  <span className="text-sm opacity-80 group-open:hidden">
                    ▼ Clique para expandir
                  </span>
                  <span className="text-sm opacity-80 hidden group-open:inline">
                    ▲ Clique para recolher
                  </span>
                </div>
              </summary>

              <div className="mt-2 space-y-4">
                {/* Informações de Peso da Raça */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    ⚖️ Padrões de Peso da Raça
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {racaCaracteristicas.pesoNascer && (
                      <div className="bg-cyan-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-cyan-700">
                          {racaCaracteristicas.pesoNascer}kg
                        </div>
                        <div className="text-xs text-cyan-600 mt-1">
                          Ao nascer
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.peso10Meses && (
                      <div className="bg-blue-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          {racaCaracteristicas.peso10Meses}kg
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Aos 10 meses
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.pesoMachoAdulto && (
                      <div className="bg-indigo-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-indigo-700">
                          {racaCaracteristicas.pesoMachoAdulto}kg
                        </div>
                        <div className="text-xs text-indigo-600 mt-1">
                          ♂ Adulto
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.pesoFemeaAdulta && (
                      <div className="bg-pink-50 p-3 rounded text-center">
                        <div className="text-2xl font-bold text-pink-700">
                          {racaCaracteristicas.pesoFemeaAdulta}kg
                        </div>
                        <div className="text-xs text-pink-600 mt-1">
                          ♀ Adulta
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Características Reprodutivas */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    🧬 Informações Reprodutivas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {racaCaracteristicas.maturidadeSexual && (
                      <div className="flex items-center gap-3 bg-purple-50 p-3 rounded">
                        <span className="text-2xl">🌸</span>
                        <div>
                          <div className="text-sm text-purple-600">
                            Maturidade Sexual
                          </div>
                          <div className="font-bold text-purple-900">
                            {racaCaracteristicas.maturidadeSexual} meses
                          </div>
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.periodoGestacao && (
                      <div className="flex items-center gap-3 bg-pink-50 p-3 rounded">
                        <span className="text-2xl">🤰</span>
                        <div>
                          <div className="text-sm text-pink-600">Gestação</div>
                          <div className="font-bold text-pink-900">
                            {racaCaracteristicas.periodoGestacao} dias
                          </div>
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.quantidadeCabritosParto && (
                      <div className="flex items-center gap-3 bg-green-50 p-3 rounded">
                        <span className="text-2xl">👶</span>
                        <div>
                          <div className="text-sm text-green-600">
                            Crias por Parto
                          </div>
                          <div className="font-bold text-green-900">
                            {racaCaracteristicas.quantidadeCabritosParto} média
                          </div>
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.femeasPorMachoIdeal && (
                      <div className="flex items-center gap-3 bg-blue-50 p-3 rounded">
                        <span className="text-2xl">💕</span>
                        <div>
                          <div className="text-sm text-blue-600">
                            Fêmeas/Macho Ideal
                          </div>
                          <div className="font-bold text-blue-900">
                            {racaCaracteristicas.femeasPorMachoIdeal} fêmeas
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 bg-teal-50 p-3 rounded">
                      <span className="text-2xl">🍼</span>
                      <div>
                        <div className="text-sm text-teal-600">
                          Leite para Cria
                        </div>
                        <div className="font-bold text-teal-900">
                          {racaCaracteristicas.femeaTemLeite
                            ? "Suficiente"
                            : "Insuficiente"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Características de Abate */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    🎯 Períodos de Abate
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {racaCaracteristicas.abatePrecoceDias && (
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-4 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">⭐</span>
                          <span className="font-semibold text-yellow-800">
                            Precoce (Premium)
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-yellow-700">
                          {racaCaracteristicas.abatePrecoceDias} dias
                        </div>
                        <div className="text-sm text-yellow-600 mt-1">
                          Carne mais macia e saborosa
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.abateConvencionalDias && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🎯</span>
                          <span className="font-semibold text-blue-800">
                            Convencional
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-blue-700">
                          {racaCaracteristicas.abateConvencionalDias} dias
                        </div>
                        <div className="text-sm text-blue-600 mt-1">
                          Equilíbrio peso/qualidade
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.abateTardioDiasMin &&
                      racaCaracteristicas.abateTardioDiasMax && (
                        <div className="bg-gradient-to-br from-red-50 to-orange-100 p-4 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">📅</span>
                            <span className="font-semibold text-red-800">
                              Tardio
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-red-700">
                            {racaCaracteristicas.abateTardioDiasMin}-
                            {racaCaracteristicas.abateTardioDiasMax} dias
                          </div>
                          <div className="text-sm text-red-600 mt-1">
                            Maior peso final
                          </div>
                        </div>
                      )}
                  </div>
                  {racaCaracteristicas.ganhoPesoDiaGramas && (
                    <div className="mt-4 bg-gray-50 p-3 rounded-lg flex items-center justify-center gap-4">
                      <span className="text-gray-600">
                        📈 Ganho médio diário:
                      </span>
                      <span className="text-xl font-bold text-gray-800">
                        {racaCaracteristicas.ganhoPesoDiaGramas}g/dia
                      </span>
                    </div>
                  )}
                </div>

                {/* Qualidade da Carne */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    🥩 Qualidade da Carne
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div
                      className={`p-3 rounded-lg text-center ${
                        racaCaracteristicas.carneMacia
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <span className="text-2xl">
                        {racaCaracteristicas.carneMacia ? "✅" : "❌"}
                      </span>
                      <div className="text-sm font-medium mt-1">Macia</div>
                    </div>
                    <div
                      className={`p-3 rounded-lg text-center ${
                        racaCaracteristicas.carneSaborosa
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <span className="text-2xl">
                        {racaCaracteristicas.carneSaborosa ? "✅" : "❌"}
                      </span>
                      <div className="text-sm font-medium mt-1">Saborosa</div>
                    </div>
                    <div
                      className={`p-3 rounded-lg text-center ${
                        racaCaracteristicas.carneSucculenta
                          ? "bg-green-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <span className="text-2xl">
                        {racaCaracteristicas.carneSucculenta ? "✅" : "❌"}
                      </span>
                      <div className="text-sm font-medium mt-1">Suculenta</div>
                    </div>
                    {racaCaracteristicas.indiceColesterol && (
                      <div className="p-3 rounded-lg text-center bg-sky-50">
                        <span className="text-2xl">❤️</span>
                        <div className="text-xs text-sky-600 mt-1">
                          Colesterol
                        </div>
                        <div className="text-sm font-bold text-sky-800 capitalize">
                          {racaCaracteristicas.indiceColesterol}
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.indiceGorduraSaturada && (
                      <div className="p-3 rounded-lg text-center bg-lime-50">
                        <span className="text-2xl">🧈</span>
                        <div className="text-xs text-lime-600 mt-1">
                          Gord. Saturada
                        </div>
                        <div className="text-sm font-bold text-lime-800 capitalize">
                          {racaCaracteristicas.indiceGorduraSaturada}
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.indiceCalorias && (
                      <div className="p-3 rounded-lg text-center bg-amber-50">
                        <span className="text-2xl">🔥</span>
                        <div className="text-xs text-amber-600 mt-1">
                          Calorias
                        </div>
                        <div className="text-sm font-bold text-amber-800 capitalize">
                          {racaCaracteristicas.indiceCalorias}
                        </div>
                      </div>
                    )}
                  </div>
                  {racaCaracteristicas.percentualGorduraCarne && (
                    <div className="mt-3 text-center text-sm text-gray-600">
                      Percentual de gordura:{" "}
                      <span className="font-bold">
                        {racaCaracteristicas.percentualGorduraCarne}
                      </span>
                    </div>
                  )}
                </div>

                {/* Informações Gerais */}
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    🌍 Origem e Outras Informações
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {racaCaracteristicas.origem && (
                      <div className="flex items-center gap-3 bg-violet-50 p-3 rounded">
                        <span className="text-2xl">🗺️</span>
                        <div>
                          <div className="text-sm text-violet-600">
                            País de Origem
                          </div>
                          <div className="font-bold text-violet-900">
                            {racaCaracteristicas.origem}
                          </div>
                        </div>
                      </div>
                    )}
                    {racaCaracteristicas.pelagemCouro && (
                      <div className="flex items-center gap-3 bg-stone-50 p-3 rounded">
                        <span className="text-2xl">🐐</span>
                        <div>
                          <div className="text-sm text-stone-600">
                            Pelagem do Couro
                          </div>
                          <div className="font-bold text-stone-900 capitalize">
                            {racaCaracteristicas.pelagemCouro}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </details>
          )}

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
