import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
// IMPORTANTE: Ajuste o caminho de importação da sua pasta de ícones/assets se necessário
import ShirtMenu from "../ShirtMenu/ShirtMenu";
import styles from "./Header.module.css";

export function Header({ cartCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
import ShirtMenu from "../ShirtMenu/ShirtMenu";
import { useAuth } from "../../context/AuthContext";
import styles from "./Header.module.css";

export default function Header({ cartCount = 0 }) {
  const [busca, setBusca] = useState("");
  const navigate = useNavigate(); 
  
 
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout(); 
    navigate("/", { replace: true }); 
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/produtos?busca=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getDisplayName = () => {
    const rawName = user?.nome || user?.name || user?.email;
    if (!rawName) return "Cliente";
    if (rawName.includes("@")) {
      const handle = rawName.split("@")[0];
      return handle.charAt(0).toUpperCase() + handle.slice(1);
    }
    return rawName.split(" ")[0];
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* LADO ESQUERDO: Menu Mobile com Ícone Personalizado e Logo */}
        <div className={styles.leftGroup}>
          <button className={styles.menuBtn} aria-label="Abrir Menu">
            <ShirtMenu />
          </button>

          <Link to="/" className={styles.logo}>
            WM<span className={styles.logoHighlight}>_IMPORTS</span>
          </Link>
        </div>

        {/* CENTRO: Barra de Pesquisa */}
        <form onSubmit={handleSearch} className={styles.searchBar}>
          <input
            type="text"
            placeholder="Buscar camisa, time..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton} aria-label="Buscar">
            <FiSearch size={16} />
          </button>
        </form>

        {/* LADO DIREITO: Minha Conta e Carrinho */}
        <div className={styles.rightGroup}>
          <Link to="/login" className={styles.userBtn} aria-label="Minha Conta">
            <FiUser size={22} />
          </Link>

          <Link to="/carrinho" className={styles.cartBtn} aria-label="Carrinho de Compras">
            <FiShoppingBag size={22} />
          {isAuthenticated ? (
            <div className={styles.userArea}>
              <span className={styles.userName}>
                Olá, <strong>{getDisplayName()}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutBtn}
                title="Sair da conta"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>
              Entrar
            </Link>
          )}

          <Link to="/carrinho" className={styles.cartBtn} aria-label="Carrinho de compras">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}