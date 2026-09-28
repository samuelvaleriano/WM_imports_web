import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import styles from "./Register.module.css";

export function Register({ onSuccess, onNavigateToLogin }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nome.trim()) newErrors.nome = "O nome é obrigatório.";
    if (!formData.email.trim()) {
      newErrors.email = "O e-mail é obrigatório.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Formato de e-mail inválido.";
    }

    if (!formData.senha) {
      newErrors.senha = "A senha é obrigatória.";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Mínimo de 6 caracteres.";
    }

    if (formData.confirmarSenha !== formData.senha) {
      newErrors.confirmarSenha = "As senhas não coincidem.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await authService.register(formData.nome, formData.email, formData.senha);
      await authService.login(formData.email, formData.senha);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Erro ao realizar cadastro.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brandHeader}>
          <h1 className={styles.brandLogo}>
            WM<span className={styles.brandGreen}>_IMPORTS</span>
          </h1>
          <p className={styles.subtitle}>Crie sua conta para fazer seus pedidos</p>
        </div>

        {apiError && <div className={styles.alertError}>{apiError}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <TextField
            fullWidth
            id="nome"
            label="Nome Completo"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            error={Boolean(errors.nome)}
            helperText={errors.nome}
            className={styles.muiInput}
          />

          <TextField
            fullWidth
            id="email"
            label="E-mail"
            name="email"
            type="email"
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
            value={formData.senha}
            onChange={handleChange}
            error={Boolean(errors.senha)}
            helperText={errors.senha}
            className={styles.muiInput}
          />

          <TextField
            fullWidth
            name="confirmarSenha"
            label="Confirmar Senha"
            type="password"
            id="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            error={Boolean(errors.confirmarSenha)}
            helperText={errors.confirmarSenha}
            className={styles.muiInput}
          />

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? <span className={styles.spinner} /> : "CADASTRAR"}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Já possui uma conta?</span>
          <button
            type="button"
            onClick={handleGoToLogin}
            className={styles.linkBtn}
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}