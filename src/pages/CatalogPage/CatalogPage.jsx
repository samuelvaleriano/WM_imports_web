import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../../components/Footer/Footer.jsx';
import { Header } from '../../components/Header/Header.jsx';
import ProductGrid from '../../components/ProductGrid/ProductGrid.jsx';
import { api } from '../../services/api.js';
import styles from './CatalogPage.module.css';

function formatSlug(slug) {
  if (!slug) return '';

  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CatalogPage() {
  const { categoria, subcategoria, time } = useParams();
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const filtros = {};

    if (time) {
      filtros.time = time;
    } else {
      if (categoria) filtros.categoria = categoria;
      if (subcategoria) filtros.subcategoria = subcategoria;
    }

    async function carregarProdutos() {
      setLoading(true);
      setErro(null);

      try {
        const response = await api.get('/produtos/', {
          params: filtros,
          signal: controller.signal,
        });
        setProdutos(response.data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Erro ao carregar produtos do catálogo:', error);
          setErro('Não foi possível carregar os produtos. Tente novamente.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    carregarProdutos();

    return () => controller.abort();
  }, [categoria, subcategoria, time, tentativa]);

  const paginaAtual = time
    ? formatSlug(time)
    : subcategoria
      ? formatSlug(subcategoria)
      : categoria
        ? formatSlug(categoria)
        : 'Catálogo Geral';

  return (
    <>
      <Header />
      <main className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
          <Link to="/">Início</Link>
          <span aria-hidden="true"> / </span>
          <Link to="/catalogo">Catálogo</Link>
          {categoria && (
            <>
              <span aria-hidden="true"> / </span>
              <span>{formatSlug(categoria)}</span>
            </>
          )}
          {subcategoria && (
            <>
              <span aria-hidden="true"> / </span>
              <span>{formatSlug(subcategoria)}</span>
            </>
          )}
          {time && (
            <>
              <span aria-hidden="true"> / </span>
              <span>{formatSlug(time)}</span>
            </>
          )}
        </nav>

        <section className={styles.catalogo} aria-labelledby="catalogo-titulo">
          <div className={styles.cabecalho}>
            <span className={styles.badge}>WM Imports</span>
            <h1 className={styles.title} id="catalogo-titulo">
              {paginaAtual}
            </h1>
          </div>

          {erro ? (
            <div className={styles.erro} role="alert">
              <p>{erro}</p>
              <button
                className={styles.botaoTentarNovamente}
                onClick={() => setTentativa((atual) => atual + 1)}
                type="button"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <ProductGrid
              produtos={produtos}
              loading={loading}
              emptyMessage="Nenhum produto encontrado nesta categoria."
            />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
