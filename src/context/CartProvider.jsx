import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import CartContext from './CartContext.jsx';
import { FREE_SHIPPING_THRESHOLD } from '../services/shippingService.js';

const CART_STORAGE_KEY = 'wm_imports_cart';
const SHIPPING_STORAGE_KEY = 'wm_imports_shipping';

function loadCart() {
  const savedItems = localStorage.getItem(CART_STORAGE_KEY);
  if (!savedItems) return [];

  try {
    const items = JSON.parse(savedItems);
    if (!Array.isArray(items) || items.some((item) => !isValidCartItem(item))) {
      throw new TypeError('Os dados salvos do carrinho não são uma lista.');
    }
    return items;
  } catch (error) {
    console.error('Não foi possível restaurar o carrinho salvo:', error);
    return [];
  }
}

function isValidCartItem(item) {
  return (
    item &&
    (typeof item.produtoId === 'string' || typeof item.produtoId === 'number') &&
    typeof item.tamanho === 'string' &&
    typeof item.nome === 'string' &&
    Number.isFinite(Number(item.preco)) &&
    Number(item.preco) >= 0 &&
    Number.isInteger(item.quantidade) &&
    item.quantidade > 0
  );
}

function sameCartItem(item, produtoId, tamanho) {
  return (
    String(item.produtoId) === String(produtoId) &&
    item.tamanho === tamanho
  );
}

function loadShipping() {
  const savedShipping = localStorage.getItem(SHIPPING_STORAGE_KEY);
  if (!savedShipping) return { cep: '', option: null, address: null };

  try {
    const shipping = JSON.parse(savedShipping);
    if (
      !shipping ||
      typeof shipping.cep !== 'string' ||
      (shipping.address !== null &&
        shipping.address !== undefined &&
        (typeof shipping.address !== 'object' ||
          typeof shipping.address.cep !== 'string')) ||
      (shipping.option !== null &&
        (!shipping.option ||
          typeof shipping.option.id !== 'string' ||
          !Number.isFinite(Number(shipping.option.price))))
    ) {
      throw new TypeError('Os dados salvos do frete são inválidos.');
    }
    return shipping;
  } catch (error) {
    console.error('Não foi possível restaurar o frete salvo:', error);
    return { cep: '', option: null, address: null };
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shipping, setShipping] = useState(loadShipping);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
  }, [shipping]);

  const addToCart = useCallback((produto, tamanho = 'Único') => {
    if (!produto?.id) {
      throw new Error('O produto precisa ter um identificador para ser adicionado ao carrinho.');
    }

    const tamanhoSelecionado = String(tamanho || 'Único');
    const preco = Number(produto.preco ?? produto.precoPromocional);
    if (!Number.isFinite(preco) || preco < 0) {
      throw new Error('O produto precisa ter um preço válido para ser adicionado ao carrinho.');
    }

    const itemId = `${produto.id}:${tamanhoSelecionado}`;
    const imagemUrl =
      produto.imagemUrl ||
      produto.imagem_url ||
      produto.imagem_capa ||
      produto.imagem;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) =>
        sameCartItem(item, produto.id, tamanhoSelecionado),
      );
      if (existingItem) {
        return currentCart.map((item) =>
          sameCartItem(item, produto.id, tamanhoSelecionado)
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          itemId,
          produtoId: produto.id,
          nome: produto.nome || 'Camisa de futebol',
          imagemUrl,
          tamanho: tamanhoSelecionado,
          preco,
          quantidade: 1,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((produtoId, tamanho) => {
    const tamanhoSelecionado = String(tamanho || 'Único');
    setCart((currentCart) =>
      currentCart.filter(
        (item) => !sameCartItem(item, produtoId, tamanhoSelecionado),
      ),
    );
  }, []);

  const updateQuantity = useCallback((produtoId, tamanho, quantidade) => {
    const tamanhoSelecionado = String(tamanho || 'Único');
    const novaQuantidade = Math.max(1, Math.floor(Number(quantidade) || 1));
    setCart((currentCart) =>
      currentCart.map((item) =>
        sameCartItem(item, produtoId, tamanhoSelecionado)
          ? { ...item, quantidade: novaQuantidade }
          : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const updateShippingCep = useCallback((cep) => {
    setShipping((currentShipping) => ({
      cep,
      address: currentShipping.cep === cep ? currentShipping.address : null,
      option:
        currentShipping.cep === cep ? currentShipping.option : null,
    }));
  }, []);

  const updateShippingAddress = useCallback((address) => {
    setShipping((currentShipping) => ({
      ...currentShipping,
      cep: address.cep.replace(/\D/g, ''),
      address,
    }));
  }, []);

  const selectShipping = useCallback((option) => {
    setShipping((currentShipping) => ({
      ...currentShipping,
      option: { ...option },
    }));
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const totalItems = cart.reduce((total, item) => total + item.quantidade, 0);
  const subtotal = cart.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0,
  );
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = shipping.option
    ? isFreeShipping
      ? 0
      : Number(shipping.option.price)
    : 0;
  const total = subtotal + shippingCost;

  const value = useMemo(
    () => ({
      cart,
      totalItems,
      subtotal,
      shippingCep: shipping.cep,
      shippingAddress: shipping.address,
      selectedShipping: shipping.option,
      shippingCost,
      isFreeShipping,
      total,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      updateShippingCep,
      updateShippingAddress,
      selectShipping,
      openCart,
      closeCart,
    }),
    [
      cart,
      totalItems,
      subtotal,
      shipping,
      shippingCost,
      isFreeShipping,
      total,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      updateShippingCep,
      updateShippingAddress,
      selectShipping,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
