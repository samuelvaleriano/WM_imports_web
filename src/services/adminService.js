import { api } from "./api.js";

const ADMIN_STATS_PATH = "/admin/dashboard/stats";
const ADMIN_ORDERS_PATH = "/admin/orders";
const ADMIN_USERS_PATH = "/admin/users";

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
