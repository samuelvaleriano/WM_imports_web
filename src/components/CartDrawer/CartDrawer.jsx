import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiLoader,
  FiShoppingBag,
  FiX,
} from 'react-icons/fi';
import { useCart } from '../../context/useCart.js';
import {
  FREE_SHIPPING_THRESHOLD,
  getShippingOptions,
  normalizeCep,
} from '../../services/shippingService.js';
import { buscarEnderecoPorCep } from '../../services/cepService.js';
import CartItem from '../CartItem/CartItem.jsx';
import styles from './CartDrawer.module.css';

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatCep(cep) {
  const normalizedCep = normalizeCep(cep);
  return normalizedCep.length > 5
    ? `${normalizedCep.slice(0, 5)}-${normalizedCep.slice(5)}`
    : normalizedCep;
}

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    cart,
    totalItems,
    subtotal,
    shippingCep,
    shippingAddress,
    selectedShipping,
    shippingCost,
    isFreeShipping,
    total,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    updateShippingCep,
    updateShippingAddress,
    selectShipping,
  } = useCart();
  const closeButtonRef = useRef(null);
  const [cepInput, setCepInput] = useState(formatCep(shippingCep));
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [lookupAttempt, setLookupAttempt] = useState(0);

  const shippingOptions = useMemo(
    () =>
      shippingCep.length === 8 &&
      normalizeCep(shippingAddress?.cep) === shippingCep &&
      shippingCep === normalizeCep(cepInput)
        ? getShippingOptions(shippingCep)
        : [],
    [cepInput, shippingAddress, shippingCep],
  );

  const lookupCep = useCallback(
    async (cep, signal) => {
      const normalizedCep = normalizeCep(cep);
      const address = await buscarEnderecoPorCep(normalizedCep, signal);
      updateShippingCep(normalizedCep);
      updateShippingAddress(address);
      setShippingError('');
    },
    [updateShippingAddress, updateShippingCep],
  );

  useEffect(() => {
    const normalizedCep = normalizeCep(cepInput);
    if (normalizedCep.length !== 8) {
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsCepLoading(true);
      try {
        await lookupCep(normalizedCep, controller.signal);
      } catch (error) {
        if (!controller.signal.aborted) {
          setShippingError(
            error.message || 'Não foi possível consultar o CEP.',
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCepLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [cepInput, lookupAttempt, lookupCep]);

  useEffect(() => {
    if (!isCartOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeCart();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleCepSubmit = (event) => {
    event.preventDefault();
    const cep = normalizeCep(cepInput);

    if (cep.length !== 8) {
      setShippingError('Digite um CEP válido com 8 números.');
      return;
    }

    setLookupAttempt((attempt) => attempt + 1);
  };

  return (
    <div className={styles.overlay} onMouseDown={closeCart}>
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>WM IMPORTS</p>
            <h2 className={styles.title} id="cart-drawer-title">
              Meu carrinho <span>({totalItems})</span>
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            type="button"
            onClick={closeCart}
            aria-label="Fechar carrinho"
          >
            <FiX size={21} />
          </button>
        </header>

        {cart.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiShoppingBag size={30} />
            </div>
            <h3>Seu carrinho está vazio</h3>
            <p>Escolha seu próximo manto e ele aparecerá aqui.</p>
            <button
              className={styles.continueButton}
              type="button"
              onClick={closeCart}
            >
              Continuar comprando
              <FiArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className={styles.items} aria-label="Itens do carrinho">
              {cart.map((item) => (
                <CartItem
                  key={item.itemId}
                  item={item}
                  onIncrement={() =>
                    updateQuantity(
                      item.produtoId,
                      item.tamanho,
                      item.quantidade + 1,
                    )
                  }
                  onDecrement={() =>
                    updateQuantity(
                      item.produtoId,
                      item.tamanho,
                      item.quantidade - 1,
                    )
                  }
                  onRemove={() =>
                    removeFromCart(item.produtoId, item.tamanho)
                  }
                />
              ))}
            </div>

            <section className={styles.shipping}>
              <div className={styles.shippingHeading}>
                <h3>Calcular entrega</h3>
                <span>Informe seu CEP</span>
              </div>
              <form className={styles.cepForm} onSubmit={handleCepSubmit}>
                <label className={styles.srOnly} htmlFor="cart-cep">
                  CEP de entrega
                </label>
                <input
                  id="cart-cep"
                  className={styles.cepInput}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={9}
                  placeholder="00000-000"
                  value={cepInput}
                  onChange={(event) => {
                    const cep = normalizeCep(event.target.value);
                    setCepInput(formatCep(cep));
                    setIsCepLoading(false);
                    setShippingError('');
                    updateShippingCep(cep);
                  }}
                  aria-invalid={Boolean(shippingError)}
                  aria-describedby={[
                    shippingError ? 'cart-cep-error' : null,
                    isCepLoading ? 'cart-cep-loading' : null,
                  ].filter(Boolean).join(' ') || undefined}
                />
                <button
                  className={styles.cepButton}
                  type="submit"
                  disabled={isCepLoading}
                >
                  {isCepLoading ? (
                    <>
                      <FiLoader className={styles.spinner} size={15} />
                      Buscando
                    </>
                  ) : (
                    'Consultar'
                  )}
                </button>
              </form>
              {isCepLoading && (
                <p className={styles.shippingLoading} id="cart-cep-loading" role="status">
                  Buscando endereço...
                </p>
              )}
              {shippingError && (
                <p className={styles.shippingError} id="cart-cep-error" role="alert">
                  {shippingError}
                </p>
              )}

              {shippingAddress &&
                normalizeCep(shippingAddress.cep) === normalizeCep(cepInput) && (
                <div className={styles.addressFields} aria-label="Endereço localizado">
                  <label className={styles.addressField}>
                    <span>Logradouro</span>
                    <input
                      value={shippingAddress.logradouro}
                      readOnly
                      placeholder="Não informado para este CEP"
                    />
                  </label>
                  <label className={styles.addressField}>
                    <span>Bairro</span>
                    <input
                      value={shippingAddress.bairro}
                      readOnly
                      placeholder="Não informado para este CEP"
                    />
                  </label>
                  <label className={styles.addressField}>
                    <span>Cidade</span>
                    <input value={shippingAddress.cidade} readOnly />
                  </label>
                  <label className={styles.addressField}>
                    <span>Estado</span>
                    <input value={shippingAddress.estado} readOnly />
                  </label>
                </div>
              )}

              {shippingOptions.length > 0 && (
                <fieldset className={styles.options}>
                  <legend className={styles.srOnly}>Opções de entrega</legend>
                  {shippingOptions.map((option) => {
                    const optionIsFree = isFreeShipping;
                    const isSelected = selectedShipping?.id === option.id;

                    return (
                      <label
                        className={`${styles.shippingOption} ${
                          isSelected ? styles.shippingOptionSelected : ''
                        }`}
                        key={option.id}
                      >
                        <input
                          type="radio"
                          name="shipping-option"
                          value={option.id}
                          checked={isSelected}
                          onChange={() => selectShipping(option)}
                        />
                        <span className={styles.radioMark} aria-hidden="true" />
                        <span className={styles.optionDetails}>
                          <strong>{option.name}</strong>
                          <small>
                            Entrega em até {option.deliveryDays} dias úteis
                          </small>
                        </span>
                        <span className={styles.optionPrice}>
                          {optionIsFree ? (
                            <>
                              <del>{formatCurrency(option.price)}</del>
                              <strong>Grátis</strong>
                            </>
                          ) : (
                            <strong>{formatCurrency(option.price)}</strong>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              )}

              <div className={styles.freeShipping}>
                <div className={styles.freeShippingText}>
                  <FiCheckCircle size={16} />
                  <span>
                    {isFreeShipping
                      ? 'Você ganhou frete grátis!'
                      : `Faltam ${formatCurrency(
                          Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
                        )} para ganhar frete grátis`}
                  </span>
                </div>
                <div
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-label="Progresso para frete grátis"
                  aria-valuemin={0}
                  aria-valuemax={FREE_SHIPPING_THRESHOLD}
                  aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
                >
                  <span
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(
                        (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </section>

            <footer className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Frete</span>
                <span className={styles.shippingValue}>
                  {selectedShipping
                    ? isFreeShipping
                      ? 'Grátis'
                      : formatCurrency(shippingCost)
                    : 'Selecione a entrega'}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                <span>{selectedShipping ? 'Total geral' : 'Total parcial'}</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <p className={styles.shippingNote}>
                {selectedShipping
                  ? `Entrega ${selectedShipping.name} para o CEP ${selectedShipping.cep}.`
                  : 'Informe seu CEP e selecione uma opção de entrega.'}
              </p>
              <button
                className={styles.checkoutButton}
                type="button"
                onClick={handleCheckout}
              >
                Finalizar compra
                <FiArrowRight size={18} />
              </button>
              <button
                className={styles.continueLink}
                type="button"
                onClick={closeCart}
              >
                Continuar comprando
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
