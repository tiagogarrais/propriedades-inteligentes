"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../../components/button";
import { useGeolocated } from "react-geolocated";

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

const NovaPropriedadeForm = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get("edit");

  const [formData, setFormData] = useState({
    nomePropriedade: "",
    tipo: "",
    localidade: "",
    tamanho: "",
    estado: "",
    cidade: "",
    latitude: "",
    longitude: "",
  });

  const [estadosCidades, setEstadosCidades] = useState({
    states: {},
    cities: [],
  });
  const [cidadesFiltradas, setCidadesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: false,
      },
      userDecisionTimeout: 5000,
    });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
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

  // Carregar dados da propriedade se estiver editando
  useEffect(() => {
    if (editingId && status === "authenticated") {
      const fetchPropriedade = async () => {
        try {
          const response = await fetch(`/api/propriedades/${editingId}`, {
            credentials: "include",
          });
          if (response.ok) {
            const propriedade = await response.json();
            setFormData({
              nomePropriedade: propriedade.nomePropriedade || "",
              tipo: propriedade.tipo || "",
              localidade: propriedade.localidade || "",
              tamanho: propriedade.tamanho
                ? propriedade.tamanho.toString()
                : "",
              estado: propriedade.estado || "",
              cidade: propriedade.cidade || "",
              latitude: propriedade.latitude
                ? propriedade.latitude.toString()
                : "",
              longitude: propriedade.longitude
                ? propriedade.longitude.toString()
                : "",
            });
          } else {
            alert("Propriedade não encontrada");
            router.push("/propriedades");
          }
        } catch (error) {
          console.error("Erro ao buscar propriedade:", error);
          router.push("/propriedades");
        } finally {
          setLoading(false);
        }
      };
      fetchPropriedade();
    } else {
      setLoading(false);
    }
  }, [editingId, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/propriedades/${editingId}`
        : "/api/propriedades";

      const response = await fetch(url, {
        method,
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
          sessionToken: session?.user?.id || session?.user?.email,
        }),
      });

      if (response.ok) {
        router.push("/propriedades");
      } else {
        const error = await response.json();
        alert(
          error.error ||
            `Erro ao ${editingId ? "atualizar" : "criar"} propriedade`
        );
      }
    } catch (error) {
      console.error(
        `Erro ao ${editingId ? "atualizar" : "criar"} propriedade:`,
        error
      );
      alert(`Erro ao ${editingId ? "atualizar" : "criar"} propriedade`);
    } finally {
      setSubmitting(false);
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/propriedades"
            className="text-blue-600 hover:underline mb-4 inline-block"
          >
            ← Voltar para Propriedades
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {editingId ? "Editar Propriedade" : "Nova Propriedade"}
          </h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
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

            <div>
              <label className="block text-gray-700 mb-2">
                GPS da sede principal ou entrada principal
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Latitude (opcional)"
                  />
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Longitude (opcional)"
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (coords) {
                      setFormData({
                        ...formData,
                        latitude: coords.latitude.toString(),
                        longitude: coords.longitude.toString(),
                      });
                    } else {
                      getPosition();
                    }
                  }}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-md font-medium hover:bg-blue-700 transition text-sm"
                  disabled={!isGeolocationAvailable || !isGeolocationEnabled}
                >
                  Capturar coordenadas
                </Button>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Dica:</strong> As coordenadas GPS devem ser cadastradas apenas se você conhecer a localização exata da propriedade ou estiver fisicamente no local para capturar os dados por GPS. Coordenadas incorretas podem comprometer a precisão das informações.
                  </p>
                </div>
              </div>
              {!isGeolocationAvailable && (
                <p className="text-red-500 text-sm mt-1">
                  Geolocation não está disponível neste navegador.
                </p>
              )}
              {isGeolocationAvailable && !isGeolocationEnabled && (
                <p className="text-red-500 text-sm mt-1">
                  Geolocation está desabilitada. Permita o acesso à localização.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full max-w-md mx-auto bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 text-center block"
            >
              {submitting
                ? "Salvando..."
                : editingId
                ? "Atualizar Propriedade"
                : "Criar Propriedade"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function NovaPropriedadePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NovaPropriedadeForm />
    </Suspense>
  );
}
