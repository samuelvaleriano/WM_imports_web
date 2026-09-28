import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import styles from "./Login.module.css";

export function Login({ onSuccess, onNavigateToRegister }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

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
      await authService.login(formData.email, formData.senha);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/");
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
          <span>Ainda não tem conta?</span>
          <button
            type="button"
            onClick={handleGoToRegister}
            className={styles.linkBtn}
          >
            Cadastrar-se
          </button>
        </div>
      </div>
    </div>
  );
}