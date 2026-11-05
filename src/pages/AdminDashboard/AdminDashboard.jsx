import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiBox,
  FiCheckCircle,
  FiDollarSign,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTruck,
  FiUserPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Header from "../../components/Header/Header.jsx";
import {
  createLojista,
  getDashboardStats,
  updateOrder,
} from "../../services/adminService.js";
import styles from "./AdminDashboard.module.css";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "packing", label: "Em Separação" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
];
const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((status) => [status.value, status.label]),
);
const EMPTY_STATS = {
  total_revenue: 0,
  total_sales: 0,
  average_ticket: 0,
  pending_orders: 0,
  orders: [],
};

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

function normalizeStats(data) {
  const stats = data?.stats || data || {};
  return {
    total_revenue: stats.total_revenue ?? stats.faturamento_total ?? 0,
    total_sales: stats.total_sales ?? stats.quantidade_vendas ?? 0,
    average_ticket: stats.average_ticket ?? stats.ticket_medio ?? 0,
    pending_orders: stats.pending_orders ?? stats.pedidos_pendentes ?? 0,
    orders: stats.orders ?? stats.pedidos ?? [],
  };
}

function normalizeStatus(status) {
  return STATUS_LABELS[status] ? status : "pending";
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <article className={`${styles.statCard} ${styles[tone]}`}>
      <div className={styles.statIcon} aria-hidden="true"><Icon size={22} /></div>
      <div><p>{label}</p><strong>{value}</strong></div>
    </article>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [error, setError] = useState("");
  const [lojistaForm, setLojistaForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });
  const [creatingLojista, setCreatingLojista] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStats(normalizeStats(await getDashboardStats()));
    } catch (requestError) {
      console.error("Erro ao carregar o dashboard administrativo:", requestError);
      setError("Não foi possível carregar os dados do painel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadDashboard, 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return stats.orders;
    return stats.orders.filter(
      (order) => normalizeStatus(order.status ?? order.estado) === statusFilter,
    );
  }, [stats.orders, statusFilter]);

  const handleOrderChange = async (order, field, value) => {
    const orderId = order.id ?? order.order_id;
    if (!orderId) {
      toast.error("Pedido sem identificador. Não foi possível salvar.");
      return;
    }
    setSavingOrderId(orderId);
    try {
      const updatedOrder = await updateOrder(orderId, { [field]: value });
      setStats((current) => ({
        ...current,
        orders: current.orders.map((currentOrder) =>
          (currentOrder.id ?? currentOrder.order_id) === orderId
            ? { ...currentOrder, ...updatedOrder }
            : currentOrder,
        ),
      }));
      toast.success("Pedido atualizado com sucesso.");
    } catch (requestError) {
      console.error("Erro ao atualizar pedido:", requestError);
      toast.error("Não foi possível salvar a alteração do pedido.");
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleLojistaChange = (event) => {
    const { name, value } = event.target;
    setLojistaForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateLojista = async (event) => {
    event.preventDefault();
    const nome = lojistaForm.nome.trim();
    const email = lojistaForm.email.trim();

    if (!nome || !email || !lojistaForm.senha) {
      toast.error("Preencha nome, e-mail e senha do lojista.");
      return;
    }

    if (lojistaForm.senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setCreatingLojista(true);
    try {
      await createLojista({ nome, email, senha: lojistaForm.senha });
      setLojistaForm({ nome: "", email: "", senha: "" });
      toast.success("Lojista cadastrado com sucesso.");
    } catch (requestError) {
      console.error("Erro ao cadastrar lojista:", requestError);
      const message =
        requestError.response?.data?.detail ||
        "Não foi possível cadastrar o lojista.";
      toast.error(message);
    } finally {
      setCreatingLojista(false);
    }
  };

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.content}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>PAINEL DO LOJISTA</p>
            <h1>Dashboard Administrativo</h1>
            <p className={styles.subtitle}>Acompanhe o desempenho da loja e gerencie seus pedidos.</p>
          </div>
          <button type="button" className={styles.refreshButton} onClick={loadDashboard} disabled={loading}>
            <FiRefreshCw size={17} className={loading ? styles.spin : ""} /> Atualizar dados
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <FiAlertCircle size={18} /><span>{error}</span>
            <button type="button" onClick={loadDashboard}>Tentar novamente</button>
          </div>
        )}

        <section className={styles.statsGrid} aria-label="Indicadores de desempenho">
          <StatCard icon={FiDollarSign} label="Faturamento Total" value={formatCurrency(stats.total_revenue)} tone="green" />
          <StatCard icon={FiShoppingBag} label="Quantidade de Vendas" value={stats.total_sales} tone="blue" />
          <StatCard icon={FiPackage} label="Ticket Médio" value={formatCurrency(stats.average_ticket)} tone="purple" />
          <StatCard icon={FiAlertCircle} label="Pedidos Pendentes" value={stats.pending_orders} tone="orange" />
        </section>

        <section className={styles.userSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Cadastrar lojista</h2>
              <p>Crie um novo acesso administrativo para a equipe da loja.</p>
            </div>
            <FiUserPlus className={styles.userSectionIcon} size={24} aria-hidden="true" />
          </div>
          <form className={styles.userForm} onSubmit={handleCreateLojista}>
            <label>
              Nome
              <input
                name="nome"
                value={lojistaForm.nome}
                onChange={handleLojistaChange}
                placeholder="Nome do lojista"
                autoComplete="name"
              />
            </label>
            <label>
              E-mail
              <input
                name="email"
                type="email"
                value={lojistaForm.email}
                onChange={handleLojistaChange}
                placeholder="lojista@exemplo.com"
                autoComplete="email"
              />
            </label>
            <label>
              Senha
              <input
                name="senha"
                type="password"
                value={lojistaForm.senha}
                onChange={handleLojistaChange}
                placeholder="Mínimo de 6 caracteres"
                autoComplete="new-password"
              />
            </label>
            <button type="submit" className={styles.createUserButton} disabled={creatingLojista}>
              {creatingLojista ? "Cadastrando..." : "Cadastrar lojista"}
            </button>
          </form>
        </section>

        <section className={styles.ordersSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Gestão de Pedidos</h2>
              <p>Altere o status e informe o rastreio diretamente na tabela.</p>
            </div>
            <label className={styles.filter}>
              <span>Filtrar por status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Todos os pedidos</option>
                {STATUS_OPTIONS.map((status) => <option value={status.value} key={status.value}>{status.label}</option>)}
              </select>
            </label>
          </div>

          {loading ? <div className={styles.state}>Carregando pedidos...</div> : filteredOrders.length === 0 ? (
            <div className={styles.state}><FiBox size={28} />Nenhum pedido encontrado para este filtro.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table>
                <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Rastreio Correios</th></tr></thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const orderId = order.id ?? order.order_id;
                    const status = normalizeStatus(order.status ?? order.estado);
                    const customer = order.customer_name ?? order.cliente_nome ?? "Cliente";
                    const currentTracking = order.tracking_code ?? order.codigo_rastreio ?? "";
                    return (
                      <tr key={orderId}>
                        <td className={styles.orderId}>#{orderId}</td>
                        <td>{customer}</td>
                        <td>{order.created_at ? new Date(order.created_at).toLocaleDateString("pt-BR") : "-"}</td>
                        <td>{formatCurrency(order.total ?? order.valor_total)}</td>
                        <td>
                          <select
                            className={`${styles.statusSelect} ${styles[`status_${status}`]}`}
                            value={status}
                            disabled={savingOrderId === orderId}
                            onChange={(event) => handleOrderChange(order, "status", event.target.value)}
                            aria-label={`Status do pedido ${orderId}`}
                          >
                            {STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                          </select>
                        </td>
                        <td>
                          <div className={styles.trackingField}>
                            <FiTruck size={16} aria-hidden="true" />
                            <input
                              type="text"
                              placeholder="Ex.: AA123456789BR"
                              defaultValue={currentTracking}
                              disabled={savingOrderId === orderId}
                              onBlur={(event) => {
                                const value = event.target.value.trim();
                                if (value !== currentTracking) handleOrderChange(order, "tracking_code", value);
                              }}
                              aria-label={`Código de rastreio do pedido ${orderId}`}
                            />
                            {savingOrderId === orderId && <FiCheckCircle className={styles.savingIcon} size={16} />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
