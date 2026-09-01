import React from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './CatalogPage.module.css';

export default function CatalogPage() {
  const { categoria, subcategoria, time } = useParams();

  const formatSlug = (slug) => {
    if (!slug) return '';
    return slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const paginaAtual = time 
    ? formatSlug(time) 
    : subcategoria 
    ? formatSlug(subcategoria) 
    : categoria 
    ? formatSlug(categoria) 
    : 'Catálogo Geral';

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Página em Construção</span>
        <h1 className={styles.title}>{paginaAtual}</h1>

        <nav className={styles.breadcrumb}>
          <Link to="/">Início</Link>
          {categoria && <span> / {formatSlug(categoria)}</span>}
          {subcategoria && <span> / {formatSlug(subcategoria)}</span>}
          {time && <span> / {formatSlug(time)}</span>}
        </nav>

        <div className={styles.infoBox}>
          <p>Rota Ativa:</p>
          <code>
            /catalogo
            {categoria ? `/${categoria}` : ''}
            {subcategoria ? `/${subcategoria}` : ''}
            {time ? `/${time}` : ''}
          </code>
        </div>
      </div>
    </main>
  );
}