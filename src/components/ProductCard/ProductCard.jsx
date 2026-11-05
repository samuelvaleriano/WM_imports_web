import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCart } from '../../context/useCart.js';
import styles from './ProductCard.module.css';

export default function ProductCard({
  produto,
  isAdmin = false,
  onUpdateProduct,
  onDeleteProduct,
  onUploadProductImage,
}) {
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const [isFavorito, setIsFavorito] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    nome: "",
    precoOriginal: "",
    desconto: 0,
  });

  if (!produto) return null;

  const id = produto.id;
  const nome = produto.nome || 'Camisa de futebol';
  const time = produto.time || produto.time_nome;
  const imagemUrl =
    produto.imagemUrl ||
    produto.imagem_url ||
    produto.imagem_capa ||
    produto.imagem;
  const precoOriginal = Number(
    produto.precoOriginal ??
      produto.preco_original ??
      produto.preco ??
      0,
  );
  const descontoInformado = Number(
    produto.desconto_percentual ??
      produto.desconto ??
      produto.percentual_desconto ??
      0,
  ) || 0;
  const precoAtual =
    Number(produto.precoPromocional ?? produto.preco_promocional) ||
    (descontoInformado > 0 && descontoInformado < 100
      ? precoOriginal * (1 - descontoInformado / 100)
      : precoOriginal);
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

  const porcentagemCalculada = temDesconto
    ? Math.round(((precoOriginal - precoAtual) / precoOriginal) * 100)
    : 0;
  const porcentagemDesconto =
    temDesconto && descontoInformado > 0
      ? descontoInformado
      : porcentagemCalculada;

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

  const handleDelete = async (event) => {
    event.stopPropagation();
    if (!window.confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    await onDeleteProduct(id);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const data = new FormData(event.currentTarget);
    const image = data.get("imagem");
    const precoOriginalEditado = Number(editData.precoOriginal);
    const descontoEditado = Number(editData.desconto) || 0;
    const payload = {
      nome: editData.nome.trim(),
      preco: Number(precoOriginalEditado.toFixed(2)),
      desconto_percentual: descontoEditado,
    };
    if (
      !payload.nome ||
      !Number.isFinite(precoOriginalEditado) ||
      precoOriginalEditado <= 0 ||
      descontoEditado < 0 ||
      descontoEditado > 100
    ) {
      toast.error("Informe nome, preço original e oferta válidos.");
      return;
    }
    setSaving(true);
    try {
      if (image?.size > 0) {
        const validImage = ["image/png", "image/webp"].includes(image.type);
        if (!validImage || image.size > 5 * 1024 * 1024) {
          toast.error("A imagem deve ser PNG ou WEBP e ter até 5 MB.");
          return;
        }
        payload.imagem_url = await onUploadProductImage(image);
        payload.imagem_capa = payload.imagem_url;
      }
      await onUpdateProduct(id, payload);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar edição do produto:", error);
    } finally {
      setSaving(false);
    }
  };

  const abrirEdicao = (event) => {
    event.stopPropagation();
    setEditData({
      nome,
      precoOriginal: precoOriginal > 0 ? precoOriginal : precoAtual,
      desconto: descontoInformado,
    });
    setIsEditing(true);
  };

  return (
    <article className={styles.card} onClick={handleCardClick}>
      {temDesconto && porcentagemDesconto > 0 && (
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

      {isAdmin && (
        <div className={styles.adminActions}>
          <button type="button" onClick={abrirEdicao} aria-label={`Editar ${nome}`} title="Editar produto">
            <FiEdit2 size={15} />
          </button>
          <button type="button" onClick={handleDelete} aria-label={`Excluir ${nome}`} title="Excluir produto">
            <FiTrash2 size={15} />
          </button>
        </div>
      )}

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

      {isEditing && createPortal(
        <div className={styles.editOverlay} onClick={() => setIsEditing(false)}>
          <form
            className={styles.editForm}
            onSubmit={handleEditSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Editar produto</h3>
            <label>Nome<input name="nome" value={editData.nome} onChange={(event) => setEditData((current) => ({ ...current, nome: event.target.value }))} /></label>
            <label>Preço original<input name="preco_original" type="number" min="0.01" step="0.01" value={editData.precoOriginal} onChange={(event) => setEditData((current) => ({ ...current, precoOriginal: event.target.value }))} /></label>
            <label>Oferta (%)<input name="desconto" type="number" min="0" max="100" step="1" value={editData.desconto} onChange={(event) => setEditData((current) => ({ ...current, desconto: event.target.value }))} /></label>
            <p className={styles.editCalculatedPrice}>
              Preço final: {formatarPreco(
                Number(editData.precoOriginal) *
                  (1 - Number(editData.desconto || 0) / 100),
              )}
            </p>
            <label>Nova imagem<input name="imagem" type="file" accept="image/png,image/webp" /></label>
            <div className={styles.editButtons}>
              <button type="button" onClick={() => setIsEditing(false)}>Cancelar</button>
              <button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </form>
        </div>,
        document.body,
      )}
    </article>
  );
}