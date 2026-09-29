import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
// IMPORTANTE: Ajuste o caminho de importação da sua pasta de ícones/assets se necessário
import ShirtMenu from "../ShirtMenu/ShirtMenu";
import styles from "./Header.module.css";

export function Header({ cartCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/produtos?busca=${encodeURIComponent(searchTerm.trim())}`);
    }
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
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}