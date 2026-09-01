import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';

export default function ProductCard({ produto }) {
  const navigate = useNavigate();
  const [isFavorito, setIsFavorito] = useState(false);

  const {
    id,
    nome,
    time,
    imagemUrl,
    precoOriginal,
    precoPromocional,
    desconto,
    parcelas = 3
  } = produto;

  const formatarPreco = (valor) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };


  const porcentagemDesconto = desconto || (precoOriginal && precoPromocional
    ? Math.round(((precoOriginal - precoPromocional) / precoOriginal) * 100)
    : 0);

  const valorParcela = precoPromocional ? (precoPromocional / parcelas) : 0;

  const handleCardClick = () => {
    navigate(`/produto/${id}`);
  };

  const handleFavoritoClick = (e) => {
    e.stopPropagation();
    setIsFavorito(!isFavorito);
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {porcentagemDesconto > 0 && (
        <span className={styles.badgeDesconto}>
          -{porcentagemDesconto}% OFF
        </span>
      )}

      <button
        type="button"
        className={`${styles.btnFavorito} ${isFavorito ? styles.favoritado : ''}`}
        onClick={handleFavoritoClick}
        aria-label="Adicionar aos favoritos"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill={isFavorito ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>

      <div className={styles.imagemContainer}>
        <img src={imagemUrl} alt={nome} className={styles.imagem} loading="lazy" />
      </div>

      <div className={styles.infoContainer}>
        {time && <span className={styles.nomeTime}>{time}</span>}
        <h3 className={styles.tituloProduto} title={nome}>{nome}</h3>

        <div className={styles.precoContainer}>
          {precoOriginal && (
            <span className={styles.precoOriginal}>
              {formatarPreco(precoOriginal)}
            </span>
          )}
          <span className={styles.precoPromocional}>
            {formatarPreco(precoPromocional)}
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
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/produto/${id}`);
          }}
        >
          COMPRAR
        </button>
      </div>
    </div>
  );
}