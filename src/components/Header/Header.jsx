import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import  ShirtMenu  from "../ShirtMenu/ShirtMenu";
import styles from "./Header.module.css";

export default function Header({ cartCount = 0 }) {
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (busca.trim()) {
      navigate(`/produtos?busca=${encodeURIComponent(busca.trim())}`);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftGroup}>
          <ShirtMenu />
          <Link to="/" className={styles.logo}>
            WM_<span className={styles.logoHighlight}>IMPORTS</span>
          </Link>
        </div>

        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Buscar camisa, time..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton} aria-label="Buscar">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <div className={styles.rightGroup}>
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