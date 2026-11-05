import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import styles from "./Login.module.css";

export function Login({ onSuccess, onNavigateToRegister }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); 

  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState("customer");

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "O e-mail é obrigatório.";
    if (!formData.senha) newErrors.senha = "A senha é obrigatória.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);
    try {

      const response = await authService.login(formData.email, formData.senha);


      const jwtToken = response?.access_token || response?.token;

      const userData = response?.user || response?.usuario || {
        email: formData.email,
        nome: response?.nome || formData.email.split("@")[0]
      };
      const returnedRole = userData.role || response?.role;
      const isLojista = returnedRole === "admin" || returnedRole === "lojista";
      const isUsuario =
        returnedRole === "cliente" ||
        returnedRole === "customer" ||
        returnedRole === "user" ||
        returnedRole === "usuario";
      const profileMatches =
        (perfil === "lojista" && isLojista) ||
        (perfil === "customer" && isUsuario);

      if (jwtToken) {
        if (!profileMatches) {
          setApiError(
            returnedRole
              ? "Este acesso não pertence ao perfil selecionado."
              : "A API não informou o perfil desta conta."
          );
          return;
        }

        login({ ...userData, role: isLojista ? "admin" : "customer" }, jwtToken);

        if (onSuccess) {
          onSuccess();
        } else {
          navigate(perfil === "lojista" ? "/admin" : from, { replace: true });
        }
      } else {
        setApiError("Não foi possível recuperar o token de acesso da API.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail || "E-mail ou senha incorretos.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else {
      navigate("/cadastro");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brandHeader}>
          <h1 className={styles.brandLogo}>
            WM<span className={styles.brandGreen}>_IMPORTS</span>
          </h1>
          <p className={styles.subtitle}>Acesse sua conta para continuar</p>
        </div>

        <div className={styles.profileSelector} aria-label="Selecione o perfil de acesso">
          <div
            className={`${styles.profileIndicator} ${
              perfil === "lojista" ? styles.profileIndicatorRight : ""
            }`}
            aria-hidden="true"
          />
          <button
            type="button"
            className={`${styles.profileOption} ${
              perfil === "customer" ? styles.profileOptionActive : ""
            }`}
            onClick={() => {
              setPerfil("customer");
              setApiError("");
            }}
            aria-pressed={perfil === "customer"}
          >
            Usuário
          </button>
          <button
            type="button"
            className={`${styles.profileOption} ${
              perfil === "lojista" ? styles.profileOptionActive : ""
            }`}
            onClick={() => {
              setPerfil("lojista");
              setApiError("");
            }}
            aria-pressed={perfil === "lojista"}
          >
            Lojista
          </button>
        </div>

        <p className={styles.profileHint}>
          {perfil === "lojista"
            ? "Acesse o painel de gestão da loja."
            : "Entre para acompanhar seus pedidos."}
        </p>

        {apiError && <div className={styles.alertError}>{apiError}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <TextField
            fullWidth
            id="email"
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={Boolean(errors.email)}
            helperText={errors.email}
            className={styles.muiInput}
          />

          <TextField
            fullWidth
            name="senha"
            label="Senha"
            type="password"
            id="senha"
            autoComplete="current-password"
            value={formData.senha}
            onChange={handleChange}
            error={Boolean(errors.senha)}
            helperText={errors.senha}
            className={styles.muiInput}
          />

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? <span className={styles.spinner} /> : "ENTRAR"}
          </button>
        </form>

        <div className={styles.footer}>
          {perfil === "customer" ? (
            <>
              <span>Ainda não tem conta?</span>
              <button
                type="button"
                onClick={handleGoToRegister}
                className={styles.linkBtn}
              >
                Cadastrar-se
              </button>
            </>
          ) : (
            <span className={styles.sellerNotice}>
              Novos lojistas são cadastrados pelo painel administrativo.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}