import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import styles from './CartItem.module.css';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function CartItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) {
  return (
    <article className={styles.item}>
      <div className={styles.imagemContainer}>
        {item.imagemUrl ? (
          <img
            className={styles.imagem}
            src={item.imagemUrl}
            alt={item.nome}
          />
        ) : (
          <span className={styles.imagemAusente}>Sem imagem</span>
        )}
      </div>

      <div className={styles.detalhes}>
        <div className={styles.nomeLinha}>
          <h3 className={styles.nome}>{item.nome}</h3>
          <button
            className={styles.remover}
            type="button"
            onClick={onRemove}
            aria-label={`Remover ${item.nome} do carrinho`}
            title="Remover item"
          >
            <FiTrash2 size={17} />
          </button>
        </div>

        <p className={styles.tamanho}>Tamanho: {item.tamanho}</p>
        <p className={styles.preco}>{formatCurrency(item.preco)}</p>

        <div className={styles.controles}>
          <button
            type="button"
            className={styles.controleQuantidade}
            onClick={onDecrement}
            disabled={item.quantidade <= 1}
            aria-label={`Diminuir quantidade de ${item.nome}`}
          >
            <FiMinus size={14} />
          </button>
          <span className={styles.quantidade} aria-live="polite">
            {item.quantidade}
          </span>
          <button
            type="button"
            className={styles.controleQuantidade}
            onClick={onIncrement}
            aria-label={`Aumentar quantidade de ${item.nome}`}
          >
            <FiPlus size={14} />
          </button>
          <span className={styles.totalItem}>
            {formatCurrency(item.preco * item.quantidade)}
          </span>
        </div>
      </div>
    </article>
  );
}
