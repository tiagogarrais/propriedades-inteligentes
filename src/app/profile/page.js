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
  });
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
        const res = await fetch("/api/countries");
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
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            fullName: data.user.fullName || "",
            birthDate: data.user.birthDate || "",
            cpf: data.user.cpf || "",
            whatsapp: data.user.whatsapp || "",
            whatsappCountryCode: data.user.whatsappCountryCode || "55",
            whatsappConsent: data.user.whatsappConsent || false,
          });
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
          whatsappConsent: session.user.whatsappConsent || false,
        });
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
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccessMessage("Perfil salvo com sucesso!");

      // Se estava completando perfil obrigatório, redirecionar para dashboard
      if (isCompletingProfile) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
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
    const res = await fetch("/api/profile", {
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
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>
        {isCompletingProfile
          ? "Complete seu Perfil (Obrigatório)"
          : "Meu Perfil"}
      </h1>

      {isCompletingProfile && (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: 4,
            color: "#856404",
          }}
        >
          <strong>Importante:</strong> Para acessar sua área privada, é
          necessário preencher seu nome completo. Os outros campos são opcionais
          e podem ser preenchidos depois.
        </div>
      )}

      <div
        style={{
          marginBottom: 20,
          padding: 12,
          backgroundColor: "#f8f9fa",
          borderRadius: 4,
        }}
      >
        <label
          style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}
        >
          E-mail:
        </label>
        <input
          type="email"
          value={session?.user?.email || ""}
          readOnly
          style={{
            padding: 8,
            width: "100%",
            backgroundColor: "#e9ecef",
            border: "1px solid #ced4da",
            borderRadius: 4,
            color: "#6c757d",
          }}
        />
        <small style={{ color: "#6c757d", marginTop: 4, display: "block" }}>
          Este e-mail foi validado durante o login e não pode ser alterado.
        </small>
      </div>

      {errors.length > 0 && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: 12,
            borderRadius: 4,
            border: "1px solid #f5c6cb",
            marginBottom: 20,
          }}
        >
          <strong>Por favor, corrija os seguintes erros:</strong>
          <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
            {errors.map((error, index) => (
              <li key={index} style={{ marginBottom: 4 }}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 15 }}
      >
        <label>
          Nome Completo:{" "}
          {isCompletingProfile && <span style={{ color: "red" }}>*</span>}
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            required={isCompletingProfile}
            style={{ padding: 8, width: "100%" }}
          />
        </label>
        <div
          style={{
            marginTop: 10,
            marginBottom: 10,
            padding: 12,
            backgroundColor: "#e7f3ff",
            border: "1px solid #b3d9ff",
            borderRadius: 4,
            color: "#004085",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Informações Adicionais (Opcionais)
          </h3>
          <p style={{ margin: 0, fontSize: "14px" }}>
            Os campos abaixo são opcionais e servem para personalizar melhor seu
            perfil. Você pode preenchê-los agora ou deixar para depois.
          </p>
        </div>
        <label>
          Data de Nascimento:{" "}
          {!isCompletingProfile && (
            <span style={{ color: "#666", fontSize: "12px" }}>(opcional)</span>
          )}
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) =>
              setFormData({ ...formData, birthDate: e.target.value })
            }
            required={false}
            style={{ padding: 8, width: "100%" }}
          />
        </label>
        <label>
          CPF:{" "}
          {!isCompletingProfile && (
            <span style={{ color: "#666", fontSize: "12px" }}>(opcional)</span>
          )}
          <IMaskInput
            mask="000.000.000-00"
            value={formData.cpf}
            onAccept={(value) => setFormData({ ...formData, cpf: value })}
            placeholder="000.000.000-00"
            required={false}
            style={{ padding: 8, width: "100%" }}
          />
        </label>
        <label>
          WhatsApp:{" "}
          {!isCompletingProfile && (
            <span style={{ color: "#666", fontSize: "12px" }}>(opcional)</span>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={formData.whatsappCountryCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  whatsappCountryCode: e.target.value,
                })
              }
              style={{ padding: 8, minWidth: 120 }}
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
              required={false}
              style={{ padding: 8, flex: 1 }}
            />
          </div>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={formData.whatsappConsent}
            onChange={(e) =>
              setFormData({ ...formData, whatsappConsent: e.target.checked })
            }
          />
          Concordo em receber comunicações via WhatsApp
        </label>
      </form>

      {successMessage && (
        <div
          style={{
            textAlign: "center",
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: 12,
            borderRadius: 4,
            border: "1px solid #c3e6cb",
            marginBottom: 20,
          }}
        >
          {successMessage}
          <div
            style={{
              textAlign: "center",
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: 12,
              borderRadius: 4,
              border: "1px solid #c3e6cb",
            }}
          >
            <Link href="/">Retornar para a página inicial.</Link>
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: 12,
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          marginTop: 15,
          marginBottom: 10,
          width: "100%",
        }}
      >
        {loading ? "Salvando..." : "Salvar Perfil"}
      </Button>

      <Button
        onClick={handleDeleteAccount}
        disabled={loading}
        style={{
          padding: 12,
          backgroundColor: loading ? "#ccc" : "#dc3545",
          color: "white",
          marginTop: 15,
          marginBottom: 50,
          width: "100%",
        }}
      >
        {loading ? "Removendo..." : "Remover Conta"}
      </Button>
    </div>
  );
}
