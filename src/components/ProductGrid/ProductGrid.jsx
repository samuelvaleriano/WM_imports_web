import ProductCard from '../ProductCard/ProductCard.jsx';
import styles from './ProductGrid.module.css';

export default function ProductGrid({
  produtos = [],
  loading = false,
  emptyMessage = 'Nenhum produto encontrado.',
}) {
  if (loading) {
    return (
      <section className={styles.carregando} role="status" aria-live="polite">
        <span className={styles.srOnly}>Carregando produtos...</span>
        <div className={styles.grid} aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div className={styles.skeletonCard} key={index}>
              <div className={`${styles.skeleton} ${styles.skeletonImagem}`} />
              <div className={styles.skeletonConteudo}>
                <div className={`${styles.skeleton} ${styles.skeletonTime}`} />
                <div className={`${styles.skeleton} ${styles.skeletonNome}`} />
                <div className={`${styles.skeleton} ${styles.skeletonPreco}`} />
                <div className={`${styles.skeleton} ${styles.skeletonBotao}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!Array.isArray(produtos) || produtos.length === 0) {
    return (
      <p className={styles.estado} role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={styles.grid} aria-label="Lista de produtos">
      {produtos.map((produto) => (
        <ProductCard key={produto.id} produto={produto} />
      ))}
    </div>
  );
}