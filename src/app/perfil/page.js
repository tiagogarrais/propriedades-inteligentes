"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import Button from "../components/button";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    cpf: "",
    whatsapp: "",
    whatsappCountryCode: "55", // Padrão Brasil
    whatsappConsent: false,
    slug: "",
  });
  const [slugHistory, setSlugHistory] = useState([]);
  const [slugChangeCount, setSlugChangeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [countries, setCountries] = useState([]);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);

  // Verificar se é obrigatório completar perfil
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setIsCompletingProfile(urlParams.get("complete") === "true");
  }, []);

  // Buscar lista de países
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("/api/paises");
        if (res.ok) {
          const data = await res.json();
          setCountries(data.countries);
        }
      } catch (error) {
        console.error("Erro ao buscar países:", error);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/");

    // Buscar dados do perfil via API
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/perfil");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            fullName: data.user.fullName || "",
            birthDate: data.user.birthDate || "",
            cpf: data.user.cpf || "",
            whatsapp: data.user.whatsapp || "",
            whatsappCountryCode: data.user.whatsappCountryCode || "55",
            whatsappConsent: data.user.whatsappConsent || false,
            slug: data.user.slug || "",
          });
          setSlugHistory(data.user.slugHistory || []);
          setSlugChangeCount(data.user.slugChangeCount || 0);
        } else {
          // Se não conseguir buscar, usar dados da sessão como fallback
          setFormData({
            fullName: "",
            birthDate: session.user.birthDate
              ? new Date(session.user.birthDate).toISOString().split("T")[0]
              : "",
            cpf: session.user.cpf || "",
            whatsapp: session.user.whatsapp || "",
            whatsappCountryCode: session.user.whatsappCountryCode || "55",
            whatsappConsent: session.user.whatsappConsent || false,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        // Fallback para dados da sessão
        setFormData({
          fullName: "",
          birthDate: session.user.birthDate
            ? new Date(session.user.birthDate).toISOString().split("T")[0]
            : "",
          cpf: session.user.cpf || "",
          whatsapp: session.user.whatsapp || "",
          whatsappCountryCode: session.user.whatsappCountryCode || "55",
          whatsappConsent: session.user.whatsappConsent || false,
          slug: session.user.slug || "",
        });
        setSlugHistory([]);
        setSlugChangeCount(0);
      }
    };

    fetchProfile();
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]); // Limpar erros anteriores

    // Validação específica para completar perfil obrigatório
    if (isCompletingProfile) {
      if (!formData.fullName || formData.fullName.trim() === "") {
        setErrors([
          "Nome completo é obrigatório para acessar sua área privada.",
        ]);
        setLoading(false);
        return;
      }
      if (!formData.slug || formData.slug.trim() === "") {
        setErrors([
          "Identificador único é obrigatório para acessar sua área privada.",
        ]);
        setLoading(false);
        return;
      }
    }

    const res = await fetch("/api/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccessMessage("Perfil salvo com sucesso!");
      setSlugHistory(data.user.slugHistory || []);
      setSlugChangeCount(data.user.slugChangeCount || 0);

      // Sempre redirecionar para o painel após salvar
      setTimeout(() => {
        router.push("/painel");
      }, 4000); // 4 segundos
    } else {
      try {
        const errorData = await res.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setErrors(errorData.errors);
        } else {
          setErrors(["Erro ao salvar perfil. Tente novamente."]);
        }
      } catch {
        setErrors(["Erro ao salvar perfil. Tente novamente."]);
      }
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Tem certeza de que deseja remover sua conta? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }
    const confirmation = prompt(
      "Para confirmar, digite 'SIM' (em maiúsculas):"
    );
    if (confirmation !== "SIM") {
      alert("Ação cancelada.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/perfil", {
      method: "DELETE",
    });
    if (res.ok) {
      // Logout e redirecionar
      await signOut({ callbackUrl: "/" });
    } else {
      alert("Erro ao remover conta. Tente novamente.");
    }
    setLoading(false);
  };

  if (status === "loading") return <p>Carregando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {isCompletingProfile
            ? "Complete seu Perfil (Obrigatório)"
            : "Meu Perfil"}
        </h1>

        {isCompletingProfile && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-amber-600 text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-amber-800">Importante:</p>
                <p className="text-amber-700">
                  Para acessar sua área privada, é necessário preencher seu nome
                  completo. Os outros campos são opcionais e podem ser
                  preenchidos depois.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <label className="block text-gray-700 font-semibold mb-2">
            E-mail:
          </label>
          <input
            type="email"
            value={session?.user?.email || ""}
            readOnly
            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
          />
          <p className="text-sm text-gray-500 mt-2">
            Este e-mail foi validado durante o login e não pode ser alterado.
          </p>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-red-500 text-lg">❌</span>
              <p className="font-semibold text-red-800">
                Por favor, corrija os seguintes erros:
              </p>
            </div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nome Completo:
                {isCompletingProfile && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required={isCompletingProfile}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Identificador Único (Slug):
                {isCompletingProfile && (
                  <span className="text-red-500 ml-1">*</span>
                )}
                {!isCompletingProfile && (
                  <span className="text-gray-500 text-sm font-normal ml-1">
                    (obrigatório)
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  // Sanitizar o slug em tempo real
                  const sanitized = e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")
                    .replace(/-+/g, "-")
                    .replace(/^-|-$/g, "");
                  setFormData({ ...formData, slug: sanitized });
                }}
                required
                placeholder="exemplo: joao-silva-123"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Este será seu identificador único para páginas públicas. Use
                apenas letras, números e traços. Espaços serão convertidos
                automaticamente em traços.
              </p>
            </div>

            {/* Histórico de Slugs */}
            {slugChangeCount > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">
                  📊 Histórico do Identificador
                </h4>
                <div className="text-sm text-amber-700 space-y-2">
                  <p>
                    <strong>Alterações realizadas:</strong> {slugChangeCount} de
                    5 possíveis
                  </p>
                  <p>
                    <strong>Alterações restantes:</strong> {5 - slugChangeCount}
                  </p>
                  {slugHistory.length > 0 && (
                    <div>
                      <p className="font-medium">
                        Seus identificadores anteriores:
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {slugHistory.map((history, index) => (
                          <li key={index} className="text-xs">
                            <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800">
                              {history.oldSlug || "(nenhum)"}
                            </code>
                            {" → "}
                            <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800">
                              {history.newSlug}
                            </code>
                            <span className="text-amber-600 ml-2">
                              (
                              {new Date(history.changedAt).toLocaleDateString(
                                "pt-BR"
                              )}
                              )
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">
                Informações Adicionais (Opcionais)
              </h3>
              <p className="text-sm text-blue-700">
                Os campos abaixo são opcionais e servem para personalizar melhor
                seu perfil. Você pode preenchê-los agora ou deixar para depois.
              </p>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Data de Nascimento:
                {!isCompletingProfile && (
                  <span className="text-gray-500 text-sm font-normal ml-1">
                    (opcional)
                  </span>
                )}
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                CPF:
                {!isCompletingProfile && (
                  <span className="text-gray-500 text-sm font-normal ml-1">
                    (opcional)
                  </span>
                )}
              </label>
              <IMaskInput
                mask="000.000.000-00"
                value={formData.cpf}
                onAccept={(value) => setFormData({ ...formData, cpf: value })}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                WhatsApp:
                {!isCompletingProfile && (
                  <span className="text-gray-500 text-sm font-normal ml-1">
                    (opcional)
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.whatsappCountryCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsappCountryCode: e.target.value,
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-w-fit"
                >
                  {countries.map((country, index) => (
                    <option key={index} value={country.ddi}>
                      +{country.ddi} {country.pais}
                    </option>
                  ))}
                </select>
                <IMaskInput
                  mask={
                    formData.whatsappCountryCode === "55"
                      ? "(00) 00000-0000"
                      : "000000000000000"
                  }
                  value={formData.whatsapp}
                  onAccept={(value) =>
                    setFormData({ ...formData, whatsapp: value })
                  }
                  placeholder={
                    formData.whatsappCountryCode === "55"
                      ? "(11) 99999-9999"
                      : "Número do telefone"
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="whatsappConsent"
                checked={formData.whatsappConsent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappConsent: e.target.checked,
                  })
                }
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="whatsappConsent" className="text-gray-700">
                Concordo em receber comunicações via WhatsApp
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar Perfil"}
              </Button>

              <Button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Removendo..." : "Remover Conta"}
              </Button>
            </div>
          </form>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-green-500 text-lg">✓</span>
              <p className="text-green-800 font-semibold">{successMessage}</p>
            </div>
            <p className="text-green-700 text-sm">
              Você será redirecionado para o painel em alguns segundos...
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/painel"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Voltar ao Painel
          </Link>
        </div>
      </div>
    </div>
  );
}
