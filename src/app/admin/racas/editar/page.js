"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/button";

// Funções utilitárias para formatação de números com vírgula
const formatNumberWithComma = (value) => {
  if (!value || value === "") return "";
  let numStr = value.toString();
  // Se termina com vírgula, mantém para permitir digitação
  if (numStr.endsWith(",")) {
    return numStr;
  }
  const num = parseFloat(numStr.replace(",", "."));
  if (isNaN(num)) return numStr; // Retorna original se inválido
  return num.toString().replace(".", ",");
};

const parseNumberWithComma = (value) => {
  if (!value || value === "") return "";
  return value.toString().replace(",", ".");
};

// Função para retornar as fases padrão de cada tipo de animal
const getFasesPadrao = (tipo) => {
  const fasesPorTipo = {
    Caprino: [
      {
        nome: "Cabrito",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Jovem",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Adulto",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Veterano",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
    ],
    Ovino: [
      {
        nome: "Cordeiro",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Borrego",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Adulto",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Veterano",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
    ],
    Bovino: [
      {
        nome: "Bezerro",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Desmame",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Recria",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Engorda",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Adulto",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
    ],
    Suíno: [
      {
        nome: "Leitão",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Crescimento",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Terminação",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Adulto",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
    ],
    Equino: [
      {
        nome: "Potro",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Doma",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Adulto",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
      {
        nome: "Veterano",
        mesInicio: "",
        mesFim: "",
        pesoMedioInicioMacho: "",
        pesoMedioInicioFemea: "",
        pesoMedioFimMacho: "",
        pesoMedioFimFemea: "",
      },
    ],
  };

  return fasesPorTipo[tipo] || [];
};

const EditarRacaPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoUrl = searchParams.get("tipo");
  const racaUrl = searchParams.get("raca");

  const [racasDisponiveis, setRacasDisponiveis] = useState([]);
  const [selecaoTipo, setSelecaoTipo] = useState("");
  const [selecaoRaca, setSelecaoRaca] = useState("");

  const [caracteristicas, setCaracteristicas] = useState({
    origem: "",
    pesoNascer: "",
    peso10Meses: "",
    pesoMachoAdulto: "",
    pesoFemeaAdulta: "",
    maturidadeSexual: "",
    femeaTemLeite: true,
    periodoGestacao: "",
    quantidadeCabritosParto: "",
    abatePrecoceDias: "",
    abateConvencionalDias: "",
    abateTardioDiasMin: "",
    abateTardioDiasMax: "",
    pelagemCouro: "",
    maxFemeasPorMacho: "",
    femeasPorMachoIdeal: "",
    ganhoPesoDiaGramas: "",
    percentualGorduraCarne: "",
    indiceColesterol: "",
    indiceGorduraSaturada: "",
    indiceCalorias: "",
    carneMacia: true,
    carneSaborosa: true,
    carneSucculenta: true,
    fasesGanhoPeso: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, session, router]);

  // Efeito para preencher os selects com parâmetros de URL
  useEffect(() => {
    if (tipoUrl && !selecaoTipo) {
      setSelecaoTipo(tipoUrl);
    }
    if (racaUrl && !selecaoRaca) {
      setSelecaoRaca(racaUrl);
    }
  }, [tipoUrl, racaUrl, selecaoTipo, selecaoRaca]);

  useEffect(() => {
    const fetchRacas = async () => {
      if (selecaoTipo) {
        try {
          const response = await fetch(
            `/api/racas?tipo=${encodeURIComponent(selecaoTipo)}`
          );
          if (response.ok) {
            const data = await response.json();
            setRacasDisponiveis(data);
          }
        } catch (error) {
          console.error("Erro ao buscar raças:", error);
        }
      } else {
        setRacasDisponiveis([]);
        setSelecaoRaca("");
      }
    };

    fetchRacas();
  }, [selecaoTipo]);

  // Efeito para carregar características quando uma raça é selecionada
  useEffect(() => {
    const fetchCaracteristicas = async () => {
      if (!selecaoTipo || !selecaoRaca) {
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/raca-caracteristicas?tipo=${encodeURIComponent(
            selecaoTipo
          )}&raca=${encodeURIComponent(selecaoRaca)}`
        );
        if (response.ok) {
          const data = await response.json();
          setCaracteristicas({
            origem: data.origem || "",
            pesoNascer: formatNumberWithComma(data.pesoNascer),
            peso10Meses: formatNumberWithComma(data.peso10Meses),
            pesoMachoAdulto: formatNumberWithComma(data.pesoMachoAdulto),
            pesoFemeaAdulta: formatNumberWithComma(data.pesoFemeaAdulta),
            maturidadeSexual: data.maturidadeSexual || "",
            femeaTemLeite:
              data.femeaTemLeite !== undefined ? data.femeaTemLeite : true,
            periodoGestacao: data.periodoGestacao || "",
            quantidadeCabritosParto: formatNumberWithComma(
              data.quantidadeCabritosParto
            ),
            abatePrecoceDias: data.abatePrecoceDias || "",
            abateConvencionalDias: data.abateConvencionalDias || "",
            abateTardioDiasMin: data.abateTardioDiasMin || "",
            abateTardioDiasMax: data.abateTardioDiasMax || "",
            pelagemCouro: data.pelagemCouro || "",
            maxFemeasPorMacho: data.maxFemeasPorMacho || "",
            femeasPorMachoIdeal: data.femeasPorMachoIdeal || "",
            ganhoPesoDiaGramas: formatNumberWithComma(data.ganhoPesoDiaGramas),
            percentualGorduraCarne: formatNumberWithComma(
              data.percentualGorduraCarne
            ),
            indiceColesterol: data.indiceColesterol || "",
            indiceGorduraSaturada: data.indiceGorduraSaturada || "",
            indiceCalorias: data.indiceCalorias || "",
            carneMacia: data.carneMacia !== undefined ? data.carneMacia : true,
            carneSaborosa:
              data.carneSaborosa !== undefined ? data.carneSaborosa : true,
            carneSucculenta:
              data.carneSucculenta !== undefined ? data.carneSucculenta : true,
            fasesGanhoPeso:
              data.fasesGanhoPeso && data.fasesGanhoPeso.length > 0
                ? data.fasesGanhoPeso
                : getFasesPadrao(selecaoTipo),
          });
        }
      } catch (error) {
        console.error("Erro ao buscar características:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaracteristicas();
  }, [selecaoTipo, selecaoRaca]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Preparar dados para envio, convertendo vírgula para ponto nos campos decimais
      const decimalFields = [
        "pesoNascer",
        "peso10Meses",
        "pesoMachoAdulto",
        "pesoFemeaAdulta",
        "quantidadeCabritosParto",
        "ganhoPesoDiaGramas",
      ];

      const dataToSend = { ...caracteristicas };
      decimalFields.forEach((field) => {
        if (dataToSend[field]) {
          dataToSend[field] = parseNumberWithComma(dataToSend[field]);
        }
      });

      const response = await fetch("/api/raca-caracteristicas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tipo: selecaoTipo,
          raca: selecaoRaca,
          ...dataToSend,
        }),
      });

      if (response.ok) {
        alert("Características atualizadas com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro ao atualizar características: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar características:", error);
      alert("Erro interno do servidor");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    // Campos que devem usar vírgula como separador decimal
    const decimalFields = [
      "pesoNascer",
      "peso10Meses",
      "pesoMachoAdulto",
      "pesoFemeaAdulta",
      "quantidadeCabritosParto",
      "ganhoPesoDiaGramas",
      "percentualGorduraCarne",
    ];

    if (decimalFields.includes(field)) {
      // Para campos decimais, formatar com vírgula
      const formattedValue = formatNumberWithComma(value);
      setCaracteristicas((prev) => ({
        ...prev,
        [field]: formattedValue,
      }));
    } else {
      setCaracteristicas((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFaseChange = (index, field, value) => {
    if (field === "nome") return; // Não permitir editar nome
    let processedValue = value;
    if (field === "mesInicio" || field === "mesFim") {
      processedValue = value === "" ? null : parseInt(value);
    } else if (
      field === "pesoMedioInicioMacho" ||
      field === "pesoMedioInicioFemea" ||
      field === "pesoMedioFimMacho" ||
      field === "pesoMedioFimFemea"
    ) {
      processedValue = value === "" ? null : parseFloat(value);
    }
    setCaracteristicas((prev) => ({
      ...prev,
      fasesGanhoPeso: prev.fasesGanhoPeso.map((fase, i) =>
        i === index ? { ...fase, [field]: processedValue } : fase
      ),
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Menu de Seleção */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Selecionar Raça para Editar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={selecaoTipo}
                  onChange={(e) => {
                    setSelecaoTipo(e.target.value);
                    setSelecaoRaca("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Bovino">Bovino</option>
                  <option value="Ovino">Ovino</option>
                  <option value="Caprino">Caprino</option>
                  <option value="Suíno">Suíno</option>
                  <option value="Equino">Equino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raça <span className="text-red-500">*</span>
                </label>
                <select
                  value={selecaoRaca}
                  onChange={(e) => setSelecaoRaca(e.target.value)}
                  disabled={!selecaoTipo}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selecaoTipo
                      ? "Selecione a raça"
                      : "Primeiro selecione o tipo"}
                  </option>
                  {racasDisponiveis.map((racaNome, index) => (
                    <option key={index} value={racaNome}>
                      {racaNome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Header da Página */}
        {selecaoTipo && selecaoRaca && (
          <div className="mb-8">
            <Link
              href="/painel-administrativo"
              className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
            >
              ← Voltar
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Editar Características da Raça
            </h1>
            <p className="text-gray-600 mt-2">
              {selecaoTipo} - {selecaoRaca}
            </p>
          </div>
        )}

        {!selecaoTipo || !selecaoRaca ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-600">
            <p>Selecione o tipo e a raça para editar as características.</p>
          </div>
        ) : loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p>Carregando características...</p>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origem
                </label>
                <input
                  type="text"
                  value={caracteristicas.origem}
                  onChange={(e) => handleChange("origem", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Brasil, Europa, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso médio ao nascer (kg)
                  </label>
                  <input
                    type="text"
                    value={caracteristicas.pesoNascer}
                    onChange={(e) => handleChange("pesoNascer", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 3,5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso médio aos 10 meses (kg)
                  </label>
                  <input
                    type="text"
                    value={caracteristicas.peso10Meses}
                    onChange={(e) =>
                      handleChange("peso10Meses", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 25,0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso médio do macho adulto (kg)
                  </label>
                  <input
                    type="text"
                    value={caracteristicas.pesoMachoAdulto}
                    onChange={(e) =>
                      handleChange("pesoMachoAdulto", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 80,0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso médio da fêmea adulta (kg)
                  </label>
                  <input
                    type="text"
                    value={caracteristicas.pesoFemeaAdulta}
                    onChange={(e) =>
                      handleChange("pesoFemeaAdulta", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 65,0"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                Características Reprodutivas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maturidade sexual (dias)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={caracteristicas.maturidadeSexual}
                    onChange={(e) =>
                      handleChange("maturidadeSexual", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fêmea tem leite suficiente
                  </label>
                  <select
                    value={caracteristicas.femeaTemLeite}
                    onChange={(e) =>
                      handleChange("femeaTemLeite", e.target.value === "true")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={true}>Sim</option>
                    <option value={false}>Não</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período de gestação (dias)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={caracteristicas.periodoGestacao}
                    onChange={(e) =>
                      handleChange("periodoGestacao", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade média de cabritos por parto
                  </label>
                  <input
                    type="text"
                    value={caracteristicas.quantidadeCabritosParto}
                    onChange={(e) =>
                      handleChange("quantidadeCabritosParto", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 2,5"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                Características de Abate
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias para abate precoce
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={caracteristicas.abatePrecoceDias}
                    onChange={(e) =>
                      handleChange("abatePrecoceDias", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias para abate convencional
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={caracteristicas.abateConvencionalDias}
                    onChange={(e) =>
                      handleChange("abateConvencionalDias", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 165"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias mínimos para abate tardio
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={caracteristicas.abateTardioDiasMin}
                    onChange={(e) =>
                      handleChange("abateTardioDiasMin", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 180"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias máximos para abate tardio
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={caracteristicas.abateTardioDiasMax}
                    onChange={(e) =>
                      handleChange("abateTardioDiasMax", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 360"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                Características Físicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pelagem do couro
                  </label>
                  <select
                    value={caracteristicas.pelagemCouro || ""}
                    onChange={(e) =>
                      handleChange("pelagemCouro", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="Curto">Curto</option>
                    <option value="Médio">Médio</option>
                    <option value="Longo">Longo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de fêmeas por macho
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={caracteristicas.maxFemeasPorMacho}
                    onChange={(e) =>
                      handleChange("maxFemeasPorMacho", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fêmeas por macho ideal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={caracteristicas.femeasPorMachoIdeal}
                    onChange={(e) =>
                      handleChange("femeasPorMachoIdeal", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 33"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ganho de peso por dia (gramas)
                  </label>
                  <input
                    type="text"
                    value={caracteristicas.ganhoPesoDiaGramas}
                    onChange={(e) =>
                      handleChange("ganhoPesoDiaGramas", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 350,0"
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                Características da Carne
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentual de gordura da carne
                  </label>
                  <input
                    type="text"
                    value={caracteristicas.percentualGorduraCarne}
                    onChange={(e) =>
                      handleChange("percentualGorduraCarne", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 3,5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Índice de colesterol
                  </label>
                  <select
                    value={caracteristicas.indiceColesterol}
                    onChange={(e) =>
                      handleChange("indiceColesterol", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="baixo">Baixo</option>
                    <option value="médio">Médio</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Índice de gordura saturada
                  </label>
                  <select
                    value={caracteristicas.indiceGorduraSaturada}
                    onChange={(e) =>
                      handleChange("indiceGorduraSaturada", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="baixo">Baixo</option>
                    <option value="médio">Médio</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Índice de calorias
                  </label>
                  <select
                    value={caracteristicas.indiceCalorias}
                    onChange={(e) =>
                      handleChange("indiceCalorias", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="baixo">Baixo</option>
                    <option value="médio">Médio</option>
                    <option value="alto">Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carne macia
                  </label>
                  <select
                    value={caracteristicas.carneMacia}
                    onChange={(e) =>
                      handleChange("carneMacia", e.target.value === "true")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={true}>Sim</option>
                    <option value={false}>Não</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carne saborosa
                  </label>
                  <select
                    value={caracteristicas.carneSaborosa}
                    onChange={(e) =>
                      handleChange("carneSaborosa", e.target.value === "true")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={true}>Sim</option>
                    <option value={false}>Não</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carne suculenta
                  </label>
                  <select
                    value={caracteristicas.carneSucculenta}
                    onChange={(e) =>
                      handleChange("carneSucculenta", e.target.value === "true")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={true}>Sim</option>
                    <option value={false}>Não</option>
                  </select>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                Fases de Vida
              </h2>
              <div className="space-y-4">
                {caracteristicas.fasesGanhoPeso.map((fase, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-md"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {fase.nome}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mês Início
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={fase.mesInicio ?? ""}
                          onChange={(e) =>
                            handleFaseChange(index, "mesInicio", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mês Fim
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={fase.mesFim ?? ""}
                          onChange={(e) =>
                            handleFaseChange(index, "mesFim", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 6"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Peso Médio Início Macho (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={fase.pesoMedioInicioMacho ?? ""}
                          onChange={(e) =>
                            handleFaseChange(
                              index,
                              "pesoMedioInicioMacho",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Peso Médio Início Fêmea (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={fase.pesoMedioInicioFemea ?? ""}
                          onChange={(e) =>
                            handleFaseChange(
                              index,
                              "pesoMedioInicioFemea",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 2.3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Peso Médio Fim Macho (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={fase.pesoMedioFimMacho ?? ""}
                          onChange={(e) =>
                            handleFaseChange(
                              index,
                              "pesoMedioFimMacho",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 15.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Peso Médio Fim Fêmea (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={fase.pesoMedioFimFemea ?? ""}
                          onChange={(e) =>
                            handleFaseChange(
                              index,
                              "pesoMedioFimFemea",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: 13.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Link href="/painel-administrativo">
                  <Button
                    type="button"
                    className="bg-gray-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-gray-700 transition"
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EditarRacaPage />
    </Suspense>
  );
}
