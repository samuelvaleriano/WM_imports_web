import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import ShirtMenu from "../ShirtMenu/ShirtMenu";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/useCart.js";
import CartDrawer from "../CartDrawer/CartDrawer.jsx";
import styles from "./Header.module.css";

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openCart } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/produtos?busca=${encodeURIComponent(query)}`);
    }
  };

  const getDisplayName = () => {
    const rawName = user?.nome || user?.name || user?.email;
    if (!rawName) return "Cliente";
    if (rawName.includes("@")) {
      const username = rawName.split("@")[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return rawName.split(" ")[0];
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.leftGroup}>
            <ShirtMenu />
            <Link to="/" className={styles.logo}>
              WM<span className={styles.logoHighlight}>_IMPORTS</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className={styles.searchBar}>
            <input
              type="text"
              placeholder="Buscar camisa, time..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <button
              type="submit"
              className={styles.searchButton}
              aria-label="Buscar"
            >
              <FiSearch size={16} />
            </button>
          </form>

          <div className={styles.rightGroup}>
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
              <Link to="/login" className={styles.userBtn} aria-label="Entrar">
                <FiUser size={22} />
              </Link>
            )}

            <button
              type="button"
              className={styles.cartBtn}
              onClick={openCart}
              aria-label={`Abrir carrinho (${totalItems} itens)`}
              aria-haspopup="dialog"
            >
              <FiShoppingBag size={22} />
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}

export default Header;
