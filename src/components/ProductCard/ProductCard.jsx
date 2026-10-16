import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/useCart.js';
import styles from './ProductCard.module.css';

export default function ProductCard({ produto }) {
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [isFavorito, setIsFavorito] = useState(false);

  if (!produto) return null;

  const id = produto.id;
  const nome = produto.nome || 'Camisa de futebol';
  const time = produto.time || produto.time_nome;
  const imagemUrl =
    produto.imagemUrl ||
    produto.imagem_url ||
    produto.imagem_capa ||
    produto.imagem;
  const precoAtual = Number(
    produto.precoPromocional ?? produto.preco ?? 0,
  );
  const precoOriginal = Number(
    produto.precoOriginal ?? produto.preco_original,
  );
  const descontoInformado = Number(produto.desconto) || 0;
  const parcelas = Number(produto.parcelas) || 3;

  const formatarPreco = (valor) => {
    if (!Number.isFinite(valor)) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const temDesconto =
    Number.isFinite(precoOriginal) &&
    precoOriginal > 0 &&
    precoOriginal > precoAtual;

  const porcentagemDesconto =
    descontoInformado ||
    (temDesconto
      ? Math.round(((precoOriginal - precoAtual) / precoOriginal) * 100)
      : 0);

  const valorParcela = precoAtual > 0 ? precoAtual / parcelas : 0;

  const handleCardClick = () => {
    navigate(`/produto/${id}`);
  };

  const handleFavoritoClick = (e) => {
    e.stopPropagation();
    setIsFavorito((prev) => !prev);
  };

  const handleBuyClick = (event) => {
    event.stopPropagation();

    const variacoes = Array.isArray(produto.variacoes) ? produto.variacoes : [];
    const variacaoDisponivel = variacoes.find(
      (variacao) =>
        variacao.estoque === undefined || Number(variacao.estoque) > 0,
    );

    if (variacoes.length > 0 && !variacaoDisponivel) {
      toast.error('Este produto está sem estoque no momento.');
      return;
    }

    try {
      addToCart(
        {
          ...produto,
          imagemUrl,
          preco: precoAtual,
        },
        variacaoDisponivel?.tamanho || produto.tamanho || 'Único',
      );
      openCart();
    } catch (error) {
      console.error('Não foi possível adicionar o produto ao carrinho:', error);
      toast.error(error.message || 'Não foi possível adicionar ao carrinho.');
    }
  };

  return (
    <article className={styles.card} onClick={handleCardClick}>
      {porcentagemDesconto > 0 && (
        <span className={styles.badgeDesconto}>
          -{porcentagemDesconto}% OFF
        </span>
      )}

      <button
        type="button"
        className={`${styles.btnFavorito} ${isFavorito ? styles.favoritado : ''}`}
        onClick={handleFavoritoClick}
        aria-label={isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        aria-pressed={isFavorito}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill={isFavorito ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      <div className={styles.imagemContainer}>
        {imagemUrl ? (
          <img
            src={imagemUrl}
            alt={nome}
            className={styles.imagem}
            loading="lazy"
          />
        ) : (
          <span className={styles.imagemAusente}>Imagem indisponível</span>
        )}
      </div>

      <div className={styles.infoContainer}>
        {time && <span className={styles.nomeTime}>{time}</span>}

        <h3 className={styles.tituloProduto} title={nome}>
          {nome}
        </h3>

        <div className={styles.precoContainer}>
          {temDesconto && (
            <span className={styles.precoOriginal}>
              {formatarPreco(precoOriginal)}
            </span>
          )}
          <span className={styles.precoPromocional}>
            {formatarPreco(precoAtual)}
          </span>
        </div>

        {valorParcela > 0 && (
          <span className={styles.parcelamento}>
            ou {parcelas}x de <strong>{formatarPreco(valorParcela)}</strong> sem juros
          </span>
        )}

        <button
          type="button"
          className={styles.btnComprar}
          onClick={handleBuyClick}
        >
          COMPRAR
        </button>
      </div>
    </article>
  );
}