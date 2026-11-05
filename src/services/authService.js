import { api } from "./api";

const TOKEN_KEY = "@WMImports:token";

export const authService = {
  async login(email, senha) {
    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      senha,
    });
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
    }
    return response.data;
  },

  async register(nome, email, senha) {
    const response = await api.post("/auth/register", {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
    });
    return response.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("wm_imports_token");
    localStorage.removeItem("wm_imports_user");
  },

  async getProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};