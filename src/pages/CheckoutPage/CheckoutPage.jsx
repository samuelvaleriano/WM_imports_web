import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCopy,
  FiLock,
  FiLoader,
  FiShield,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/useCart.js';
import { api } from '../../services/api.js';
import styles from './CheckoutPage.module.css';

const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
const CardPayment = lazy(async () => {
  const sdk = await import('@mercadopago/sdk-react');
  if (publicKey) sdk.initMercadoPago(publicKey, { locale: 'pt-BR' });
  return { default: sdk.CardPayment };
});

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatCpf(value) {
  return value
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function isValidCpf(value) {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return (
    calculateDigit(9) === Number(cpf[9]) &&
    calculateDigit(10) === Number(cpf[10])
  );
}

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(' ');
  }
  return fallback;
}

function getPaymentDetails(data) {
  const payment = data?.payment || data?.pagamento || data || {};
  const transaction =
    payment.point_of_interaction?.transaction_data ||
    payment.transaction_data ||
    {};

  return {
    id: payment.payment_id ?? payment.id_pagamento ?? payment.id,
    status: payment.status || payment.payment_status || 'pending',
    qrCode:
      payment.pix_qr_code ||
      payment.qr_code ||
      payment.codigo_pix ||
      transaction.qr_code ||
      '',
    qrCodeBase64:
      payment.pix_qr_code_base64 ||
      payment.qr_code_base64 ||
      payment.qrCodeBase64 ||
      transaction.qr_code_base64 ||
      '',
  };
}

function isApproved(status) {
  return ['approved', 'aprovado'].includes(String(status).toLowerCase());
}

function isTerminalFailure(status) {
  return [
    'rejected',
    'rejected_by_issuer',
    'cancelled',
    'canceled',
    'refunded',
    'recusado',
    'cancelado',
  ].includes(String(status).toLowerCase());
}

function clearPendingPayment() {
  try {
    sessionStorage.removeItem('wm_imports_pending_payment');
  } catch (error) {
    console.error('Não foi possível limpar o pagamento pendente salvo:', error);
  }
}

function loadPendingPayment() {
  try {
    const savedPayment = sessionStorage.getItem('wm_imports_pending_payment');
    const payment = savedPayment ? JSON.parse(savedPayment) : null;
    return payment && typeof payment.id !== 'undefined' ? payment : null;
  } catch (error) {
    console.error('Não foi possível restaurar o pagamento pendente:', error);
    clearPendingPayment();
    return null;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    subtotal,
    shippingCost,
    selectedShipping,
    total,
    clearCart,
  } = useCart();
  const [cpf, setCpf] = useState('');
  const [payment, setPayment] = useState(loadPendingPayment);
  const [method, setMethod] = useState(() =>
    payment?.method === 'cartao' ? 'cartao' : 'pix',
  );
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusError, setStatusError] = useState('');

  const buyerName = user?.nome || user?.name || '';
  const buyerEmail = user?.email || '';
  const visibleStatusError = statusError || payment?.pollingError || '';
  const cpfDigits = cpf.replace(/\D/g, '');
  const hasVariationIds = cart.every(
    (item) =>
      Number.isInteger(Number(item.variacaoId)) && Number(item.variacaoId) > 0,
  );
  const checkoutItems = cart.map((item) => ({
    variacao_id: Number(item.variacaoId),
    quantidade: item.quantidade,
  }));
  const shippingSelected = Boolean(selectedShipping);
  const canPay = shippingSelected && shippingCost === 0;
  const buyerCpfValid = isValidCpf(cpfDigits);

  const showSuccess = useCallback(
    (paymentId) => {
      clearPendingPayment();
      clearCart();
      navigate('/checkout/sucesso', {
        replace: true,
        state: { paymentId },
      });
    },
    [clearCart, navigate],
  );

  useEffect(() => {
    if (
      !payment?.id ||
      payment.pollingStopped ||
      isApproved(payment.status) ||
      isTerminalFailure(payment.status)
    ) {
      return undefined;
    }

    let active = true;
    let isPolling = false;
    let intervalId;
    const paymentId = payment.id;
    const checkStatus = async () => {
      if (!active || isPolling) return;
      isPolling = true;
      try {
        const { data } = await api.get(
          `/pagamentos/${encodeURIComponent(paymentId)}/status`,
        );
        if (!active) return;
        const details = getPaymentDetails(data);
        setPayment((current) => ({
          ...current,
          ...details,
          id: details.id ?? current.id,
        }));
        setStatusError('');

        if (isApproved(details.status)) {
          showSuccess(paymentId);
        } else if (isTerminalFailure(details.status)) {
          setStatusError('O pagamento não foi aprovado. Você pode tentar novamente.');
        }
      } catch (error) {
        if (!active) return;
        console.error('Erro ao consultar status do pagamento:', error);
        const statusCode = error.response?.status;
        if ([401, 403, 404].includes(statusCode)) {
          window.clearInterval(intervalId);
          const message =
            statusCode === 404
              ? 'O pedido não foi encontrado para esta conta. A consulta foi pausada; confirme se você está usando a mesma conta que iniciou o pagamento.'
              : getErrorMessage(
                  error,
                  'Não foi possível autenticar a consulta do pagamento.',
                );
          setStatusError(message);
          setPayment((current) =>
            current?.id === paymentId
              ? { ...current, pollingStopped: true, pollingError: message }
              : current,
          );
        } else {
          setStatusError(
            getErrorMessage(error, 'Não foi possível consultar o pagamento agora.'),
          );
        }
      } finally {
        isPolling = false;
      }
    };

    intervalId = window.setInterval(checkStatus, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [
    payment?.id,
    payment?.pollingStopped,
    payment?.status,
    showSuccess,
  ]);

  useEffect(() => {
    if (
      !payment?.id ||
      isApproved(payment.status) ||
      isTerminalFailure(payment.status)
    ) {
      clearPendingPayment();
      return;
    }
    try {
      sessionStorage.setItem('wm_imports_pending_payment', JSON.stringify(payment));
    } catch (error) {
      console.error('Não foi possível salvar o pagamento pendente:', error);
    }
  }, [payment]);

  const createPixPayment = async () => {
    if (!buyerCpfValid) {
      toast.error('Informe um CPF válido para gerar o PIX.');
      return;
    }
    if (!canPay) {
      toast.error(
        shippingSelected
          ? 'O backend ainda não inclui frete pago no valor do pedido. Selecione frete grátis para pagar.'
          : 'Selecione uma opção de frete no carrinho antes de pagar.',
      );
      return;
    }
    if (!hasVariationIds) {
      toast.error('Remova e adicione novamente os itens antigos do carrinho.');
      return;
    }

    setSubmitting(true);
    setStatusError('');
    try {
      const { data } = await api.post('/pagamentos/pix', {
        itens: checkoutItems,
        cpf: cpfDigits,
        nome: buyerName,
        email: buyerEmail,
      });
      const details = getPaymentDetails(data);
      if (!details.id) {
        throw new Error('A API não retornou o identificador do pagamento PIX.');
      }
      setPayment({ ...details, method: 'pix' });
      if (isApproved(details.status)) showSuccess(details.id);
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      toast.error(
        getErrorMessage(error, error.message || 'Não foi possível gerar o PIX.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitCardPayment = async (formData) => {
    if (!buyerCpfValid || !canPay || !hasVariationIds) {
      toast.error('Confira o CPF, o frete e os itens do pedido antes de pagar.');
      return;
    }

    setSubmitting(true);
    setStatusError('');
    try {
      const payload = {
        itens: checkoutItems,
        cpf: cpfDigits,
        token: formData.token,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
      };
      const { data } = await api.post('/pagamentos/cartao', payload);
      const details = getPaymentDetails(data);
      if (!details.id) {
        throw new Error('A API não retornou o identificador do pagamento.');
      }
      setPayment({ ...details, method: 'cartao' });
      if (isApproved(details.status)) showSuccess(details.id);
    } catch (error) {
      console.error('Erro ao criar pagamento com cartão:', error);
      toast.error(
        getErrorMessage(
          error,
          error.message || 'Não foi possível processar o cartão.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyPixCode = async () => {
    if (!payment?.qrCode) return;
    try {
      await navigator.clipboard.writeText(payment.qrCode);
      setCopied(true);
      toast.success('Código PIX copiado.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Não foi possível copiar o código PIX:', error);
      toast.error('Não foi possível copiar. Selecione e copie o código manualmente.');
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo} aria-label="Voltar para a loja WM Imports">
          WM<span>_IMPORTS</span>
        </Link>
        <div className={styles.secureLabel}>
          <FiLock size={15} />
          Checkout seguro
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.heading}>
          <Link to="/" className={styles.backLink}>
            <FiArrowLeft size={16} />
            Continuar comprando
          </Link>
          <p className={styles.eyebrow}>FINALIZAÇÃO DO PEDIDO</p>
          <h1>Pagamento</h1>
          <p>Revise seu pedido e escolha como deseja pagar.</p>
        </div>

        {cart.length === 0 ? (
          <section className={styles.emptyState}>
            <FiCheckCircle size={34} />
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione produtos para continuar com o pagamento.</p>
            <Link to="/" className={styles.primaryButton}>Voltar à loja</Link>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={styles.paymentPanel} aria-labelledby="payment-title">
              <div className={styles.panelHeading}>
                <span className={styles.step}>01</span>
                <div>
                  <h2 id="payment-title">Dados do comprador</h2>
                  <p>Confira seus dados e informe o CPF do titular.</p>
                </div>
              </div>

              <div className={styles.buyerFields}>
                <label>
                  Nome
                  <input value={buyerName} readOnly placeholder="Nome da conta" />
                </label>
                <label>
                  E-mail
                  <input value={buyerEmail} readOnly placeholder="E-mail da conta" />
                </label>
                <label className={styles.cpfField}>
                  CPF <span>obrigatório</span>
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={formatCpf(cpfDigits)}
                    disabled={Boolean(payment)}
                    onChange={(event) => {
                      setCpf(event.target.value.replace(/\D/g, '').slice(0, 11));
                      setStatusError('');
                    }}
                    aria-invalid={cpfDigits.length === 11 && !buyerCpfValid}
                  />
                  {cpfDigits.length === 11 && !buyerCpfValid && (
                    <small className={styles.fieldError}>Digite um CPF válido.</small>
                  )}
                </label>
              </div>

              <div className={styles.panelHeading}>
                <span className={styles.step}>02</span>
                <div>
                  <h2>Forma de pagamento</h2>
                  <p>Escolha PIX ou cartão de crédito.</p>
                </div>
              </div>

              <div className={styles.methodTabs} role="tablist" aria-label="Forma de pagamento">
                <button
                  type="button"
                  className={method === 'pix' ? styles.activeTab : ''}
                  onClick={() => setMethod('pix')}
                  disabled={Boolean(payment)}
                  role="tab"
                  aria-selected={method === 'pix'}
                >
                  PIX
                  <span>Aprovação rápida</span>
                </button>
                <button
                  type="button"
                  className={method === 'cartao' ? styles.activeTab : ''}
                  onClick={() => setMethod('cartao')}
                  disabled={Boolean(payment)}
                  role="tab"
                  aria-selected={method === 'cartao'}
                >
                  Cartão
                  <span>Crédito</span>
                </button>
              </div>

              {!shippingSelected && (
                <p className={styles.notice} role="alert">
                  Selecione uma opção de frete no carrinho antes de finalizar a compra.
                </p>
              )}
              {shippingSelected && shippingCost > 0 && (
                <p className={styles.notice} role="alert">
                  A API atual não inclui o custo do frete no pagamento. Para evitar
                  divergência no valor cobrado, o pagamento fica indisponível enquanto
                  o frete tiver custo; pedidos com frete grátis podem prosseguir.
                </p>
              )}
              {!hasVariationIds && (
                <p className={styles.notice} role="alert">
                  Um ou mais itens foram adicionados antes da integração do checkout.
                  Remova-os e adicione-os novamente para atualizar a variação.
                </p>
              )}

              {payment?.method === 'pix' && (
                <section className={styles.pixResult} aria-live="polite">
                  <h3>PIX gerado</h3>
                  {payment.qrCodeBase64 && (
                    <img
                      className={styles.qrCode}
                      src={`data:image/jpeg;base64,${payment.qrCodeBase64}`}
                      alt="QR Code para pagamento PIX"
                    />
                  )}
                  {payment.qrCode && (
                    <>
                      <label className={styles.pixCodeLabel} htmlFor="pix-code">
                        Código PIX copia e cola
                      </label>
                      <textarea
                        id="pix-code"
                        value={payment.qrCode}
                        readOnly
                        rows={4}
                      />
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={copyPixCode}
                      >
                        <FiCopy size={16} />
                        {copied ? 'Copiado' : 'Copiar código PIX'}
                      </button>
                    </>
                  )}
                  {!payment.qrCode && !payment.qrCodeBase64 && (
                    <p className={styles.statusError} role="alert">
                      A API não retornou os dados do QR Code PIX. Consulte o status ou tente
                      novamente com outro método.
                    </p>
                  )}
                  <p className={styles.pendingMessage}>
                    {payment.pollingStopped
                      ? 'A consulta automática foi pausada. Verifique a conta usada para iniciar o pagamento.'
                      : 'O pagamento será confirmado automaticamente. Esta página consulta o status a cada 5 segundos.'}
                  </p>
                </section>
              )}

              {method === 'pix' && !payment && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={createPixPayment}
                  disabled={
                    submitting ||
                    !buyerCpfValid ||
                    !canPay ||
                    !hasVariationIds
                  }
                >
                  {submitting ? <FiLoader className={styles.spinner} /> : null}
                  {submitting ? 'Gerando PIX...' : 'Gerar QR Code PIX'}
                </button>
              )}

              {method === 'cartao' && (
                <div className={styles.cardPayment}>
                  {payment?.method === 'cartao' ? (
                    <p className={styles.pendingMessage} aria-live="polite">
                      Pagamento{' '}
                      {payment.status === 'pending'
                        ? 'em análise'
                        : payment.status}
                      .
                      A confirmação será consultada automaticamente.
                    </p>
                  ) : !publicKey ? (
                    <p className={styles.notice} role="alert">
                      Configure <code>VITE_MP_PUBLIC_KEY</code> no arquivo de ambiente
                      do frontend para habilitar o pagamento com cartão.
                    </p>
                  ) : !shippingSelected ? (
                    <p className={styles.hint}>
                      Selecione uma opção de frete no carrinho para continuar.
                    </p>
                  ) : shippingCost > 0 ? (
                    <p className={styles.hint}>
                      O pagamento com frete pago ficará disponível quando a API aceitar
                      esse custo no pedido.
                    </p>
                  ) : !buyerCpfValid ? (
                    <p className={styles.hint}>
                      Informe um CPF válido acima para carregar o formulário seguro.
                    </p>
                  ) : (
                    <Suspense fallback={<p className={styles.hint}>Carregando pagamento seguro...</p>}>
                      <CardPayment
                        initialization={{
                          amount: total,
                          payer: {
                            email: buyerEmail,
                            identification: { type: 'CPF', number: cpfDigits },
                          },
                        }}
                        customization={{
                          visual: { style: { theme: 'dark' } },
                        }}
                        locale="pt-BR"
                        onSubmit={submitCardPayment}
                        onError={(error) => {
                          console.error('Erro no formulário do Mercado Pago:', error);
                          toast.error('O formulário de cartão não pôde ser carregado.');
                        }}
                      />
                    </Suspense>
                  )}
                </div>
              )}

              {visibleStatusError && (
                <div className={styles.statusError} role="alert">
                  <p>{visibleStatusError}</p>
                  {payment && isTerminalFailure(payment.status) && (
                    <button
                      type="button"
                      className={styles.retryButton}
                      onClick={() => {
                        setPayment(null);
                        setStatusError('');
                      }}
                    >
                      Tentar novamente
                    </button>
                  )}
                </div>
              )}
            </section>

            <aside className={styles.orderPanel} aria-labelledby="order-title">
              <h2 id="order-title">Resumo do pedido</h2>
              <div className={styles.orderItems}>
                {cart.map((item) => (
                  <div className={styles.orderItem} key={item.itemId}>
                    <div className={styles.productImage}>
                      {item.imagemUrl ? (
                        <img src={item.imagemUrl} alt="" />
                      ) : (
                        <span>WM</span>
                      )}
                    </div>
                    <div className={styles.productDetails}>
                      <strong>{item.nome}</strong>
                      <span>Tamanho {item.tamanho} · Qtd. {item.quantidade}</span>
                    </div>
                    <strong>{formatCurrency(item.preco * item.quantidade)}</strong>
                  </div>
                ))}
              </div>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Frete {selectedShipping ? `· ${selectedShipping.name}` : ''}</span>
                <strong>
                  {selectedShipping
                    ? shippingCost === 0
                      ? 'Grátis'
                      : formatCurrency(shippingCost)
                    : 'Não selecionado'}
                </strong>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <p className={styles.deliveryNote}>
                {selectedShipping
                  ? `Entrega para o CEP ${selectedShipping.cep}.`
                  : 'Volte ao carrinho para informar seu CEP e escolher o frete.'}
              </p>
              <div className={styles.securityNote}>
                <FiShield size={17} />
                <span>Seus dados de cartão são protegidos pelo Mercado Pago.</span>
              </div>
              <Link to="/" className={styles.backToStore}>Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export function CheckoutSuccessPage() {
  const location = useLocation();

  if (!location.state?.paymentId) {
    return <Navigate to="/checkout" replace />;
  }

  return (
    <main className={styles.successPage}>
      <section className={styles.successCard}>
        <FiCheckCircle size={54} />
        <p className={styles.eyebrow}>PEDIDO CONFIRMADO</p>
        <h1>Pagamento aprovado!</h1>
        <p>Obrigado pela compra. Seu pedido foi confirmado.</p>
        <Link to="/" className={styles.primaryButton}>Voltar à loja</Link>
      </section>
    </main>
  );
}
