import { api } from "./api.js";

const ADMIN_STATS_PATH = "/admin/dashboard/stats";
const ADMIN_ORDERS_PATH = "/admin/orders";
const ADMIN_USERS_PATH = "/admin/users";
const PRODUCTS_PATH = "/produtos";
const HERO_BANNER_PATH = "/admin/hero-banner";

export async function getDashboardStats() {
  const response = await api.get(ADMIN_STATS_PATH);
  return response.data;
}

export async function updateOrder(orderId, data) {
  const response = await api.patch(`${ADMIN_ORDERS_PATH}/${orderId}`, data);
  return response.data;
}

export async function createLojista(data) {
  const response = await api.post(ADMIN_USERS_PATH, {
    ...data,
    role: "admin",
  });
  return response.data;
}

export async function updateProduct(productId, data) {
  const response = await api.patch(`${PRODUCTS_PATH}/${productId}`, data);
  return response.data;
}

export async function deleteProduct(productId) {
  await api.delete(`${PRODUCTS_PATH}/${productId}`);
}

export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append("arquivo", file);
  const response = await api.post("/admin/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.imagem_url || response.data.url;
}

export async function getHeroBanner() {
  const response = await api.get(HERO_BANNER_PATH);
  return response.data;
}

export async function updateHeroBanner(data) {
  const response = await api.patch(HERO_BANNER_PATH, data);
  return response.data;
}
