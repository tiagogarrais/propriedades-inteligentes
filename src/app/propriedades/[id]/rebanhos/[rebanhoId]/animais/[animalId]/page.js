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

  // Função para analisar desenvolvimento do animal
  const analisarDesenvolvimento = () => {
    if (!animal?.dataNascimento || !animal?.pesoAtual || !racaCaracteristicas) {
      return null;
    }

    const idadeMeses = calcularIdadeEmMeses(animal.dataNascimento);
    const pesoAtual = animal.pesoAtual;

    let pesoEsperado = 0;
    let statusDesenvolvimento = "";
    let recomendacao = "";

    if (idadeMeses <= 1) {
      // Até 1 mês - baseado no peso ao nascer
      pesoEsperado = racaCaracteristicas.pesoNascer || 0;
      if (pesoAtual >= pesoEsperado * 0.9 && pesoAtual <= pesoEsperado * 1.1) {
        statusDesenvolvimento = "Desenvolvimento adequado";
      } else if (pesoAtual < pesoEsperado * 0.9) {
        statusDesenvolvimento = "Abaixo do peso";
        recomendacao = "Verificar alimentação e saúde";
      } else {
        statusDesenvolvimento = "Acima do peso";
        recomendacao = "Monitorar crescimento";
      }
    } else if (idadeMeses <= 10) {
      // Até 10 meses - interpolação linear
      const pesoInicial = racaCaracteristicas.pesoNascer || 0;
      const pesoFinal = racaCaracteristicas.peso10Meses || 0;
      const progresso = Math.min(idadeMeses / 10, 1);
      pesoEsperado = pesoInicial + (pesoFinal - pesoInicial) * progresso;

      if (
        pesoAtual >= pesoEsperado * 0.85 &&
        pesoAtual <= pesoEsperado * 1.15
      ) {
        statusDesenvolvimento = "Desenvolvimento adequado";
      } else if (pesoAtual < pesoEsperado * 0.85) {
        statusDesenvolvimento = "Abaixo do peso";
        recomendacao = "Aumentar suplementação alimentar";
      } else {
        statusDesenvolvimento = "Acima do peso";
        recomendacao = "Ajustar dieta se necessário";
      }
    } else {
      // Adulto
      const pesoEsperadoAdulto =
        animal.sexo === "Macho"
          ? racaCaracteristicas.pesoMachoAdulto || 0
          : racaCaracteristicas.pesoFemeaAdulta || 0;

      if (pesoEsperadoAdulto > 0) {
        if (
          pesoAtual >= pesoEsperadoAdulto * 0.9 &&
          pesoAtual <= pesoEsperadoAdulto * 1.1
        ) {
          statusDesenvolvimento = "Peso adequado para adulto";
        } else if (pesoAtual < pesoEsperadoAdulto * 0.9) {
          statusDesenvolvimento = "Abaixo do peso ideal";
          recomendacao = "Melhorar nutrição";
        } else {
          statusDesenvolvimento = "Acima do peso ideal";
          recomendacao = "Considerar redução na alimentação";
        }
        pesoEsperado = pesoEsperadoAdulto;
      } else {
        statusDesenvolvimento = "Dados insuficientes para análise";
      }
    }

    return {
      pesoEsperado,
      statusDesenvolvimento,
      recomendacao,
      idadeMeses,
    };
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

          {/* Seção de Características da Raça */}
          {racaCaracteristicas && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">
                Características da Raça ({animal.raca})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {racaCaracteristicas.origem && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">
                      Origem
                    </label>
                    <p className="mt-1 text-sm text-blue-900">
                      {racaCaracteristicas.origem}
                    </p>
                  </div>
                )}
                {racaCaracteristicas.pesoNascer && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-700">
                      Peso Médio ao Nascer
                    </label>
                    <p className="mt-1 text-sm text-green-900">
                      {racaCaracteristicas.pesoNascer} kg
                    </p>
                  </div>
                )}
                {racaCaracteristicas.peso10Meses && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-700">
                      Peso Médio aos 10 Meses
                    </label>
                    <p className="mt-1 text-sm text-green-900">
                      {racaCaracteristicas.peso10Meses} kg
                    </p>
                  </div>
                )}
                {racaCaracteristicas.pesoMachoAdulto &&
                  animal.sexo === "Macho" && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-purple-700">
                        Peso Médio Adulto (Macho)
                      </label>
                      <p className="mt-1 text-sm text-purple-900">
                        {racaCaracteristicas.pesoMachoAdulto} kg
                      </p>
                    </div>
                  )}
                {racaCaracteristicas.pesoFemeaAdulta &&
                  animal.sexo === "Fêmea" && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-purple-700">
                        Peso Médio Adulto (Fêmea)
                      </label>
                      <p className="mt-1 text-sm text-purple-900">
                        {racaCaracteristicas.pesoFemeaAdulta} kg
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Seção de Análise de Desenvolvimento */}
          {(() => {
            const analise = analisarDesenvolvimento();
            return analise ? (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Análise de Desenvolvimento
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Status de Desenvolvimento
                    </h3>
                    <p
                      className={`text-sm font-medium ${
                        analise.statusDesenvolvimento.includes("adequado") ||
                        analise.statusDesenvolvimento.includes("adequado")
                          ? "text-green-600"
                          : analise.statusDesenvolvimento.includes("Abaixo")
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {analise.statusDesenvolvimento}
                    </p>
                    {analise.recomendacao && (
                      <p className="text-sm text-gray-600 mt-2">
                        💡 {analise.recomendacao}
                      </p>
                    )}
                  </div>

                  {analise.pesoEsperado > 0 && (
                    <div className="bg-white border border-gray-200 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Comparação com Padrão da Raça
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Peso Atual:
                          </span>
                          <span className="text-sm font-medium">
                            {animal.pesoAtual} kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Peso Esperado:
                          </span>
                          <span className="text-sm font-medium">
                            {analise.pesoEsperado.toFixed(1)} kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Diferença:
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              animal.pesoAtual - analise.pesoEsperado > 0
                                ? "text-blue-600"
                                : animal.pesoAtual - analise.pesoEsperado < -2
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {(animal.pesoAtual - analise.pesoEsperado).toFixed(
                              1
                            )}{" "}
                            kg
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Métricas adicionais */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {analise.idadeMeses}
                    </div>
                    <div className="text-sm text-gray-600">Meses de idade</div>
                  </div>

                  {animal.pesoAoNascer && animal.pesoAtual && (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {(
                          (animal.pesoAtual / animal.pesoAoNascer - 1) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Ganho de peso desde o nascimento
                      </div>
                    </div>
                  )}

                  {analise.pesoEsperado > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {(
                          (animal.pesoAtual / analise.pesoEsperado - 1) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Comparado ao padrão da raça
                      </div>
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
