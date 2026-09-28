import { api } from "./api";

const TOKEN_KEY = "@WMImports:token";

export const authService = {
  async login(email, senha) {
    const response = await api.post("/auth/login", { email, senha });
    if (response.data.access_token) {
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
    }
    return response.data;
  },

  async register(nome, email, senha) {
    const response = await api.post("/auth/register", { nome, email, senha });
    return response.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async getProfile() {
    // O interceptor do api.js já anexa o token Authorization automaticamente
    const response = await api.get("/auth/me");
    return response.data;
  },
};