import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import  HomePage  from '../pages/HomePage/HomePage.jsx';
import  CreatePage  from '../pages/CreatePage/CreatePage.jsx';
import  DetailsPage from '../pages/DetailsPage/DetailsPage.jsx';
import  ErrorPage from '../pages/ErrorPage/ErrorPage.jsx';

// Páginas futuras do e-commerce 
// import { CatalogPage } from '../pages/CatalogPage/CatalogPage.jsx';
// import { CartPage } from '../pages/CartPage/CartPage.jsx';
// import { CheckoutPage } from '../pages/CheckoutPage/CheckoutPage.jsx';
// import { DashboardPage } from '../pages/Admin/DashboardPage/DashboardPage.jsx';

const router = createBrowserRouter([
  // =========================================================================
  // 1. ROTAS PÚBLICAS DA LOJA
  // =========================================================================
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/produto/:id",
    element: <DetailsPage />,
    errorElement: <ErrorPage />,
  },
  
  // Rotas Dinâmicas de Catálogo (Menu & Subcategorias)
  {
    path: "/catalogo",
    element: <HomePage />, // Substituir por <CatalogPage />
  },
  {
    path: "/catalogo/:categoria", 
    // Ex: /catalogo/brasileiros | /catalogo/internacionais | /catalogo/selecoes
    element: <HomePage />, // Substituir por <CatalogPage />
  },
  {
    path: "/catalogo/:categoria/:subcategoria", 
    // Ex: /catalogo/brasileiros/rio-de-janeiro | /catalogo/internacionais/premier-league
    element: <HomePage />, // Substituir por <CatalogPage />
  },
  {
    path: "/catalogo/:categoria/:subcategoria/:time", 
    // Ex: /catalogo/brasileiros/rio-de-janeiro/flamengo
    element: <HomePage />, // Substituir por <CatalogPage />
  },

  // Fluxo de Compra e Autenticação
  {
    path: "/carrinho",
    element: <HomePage />, // Substituir por <CartPage />
  },
  {
    path: "/checkout",
    element: <HomePage />, // Substituir por <CheckoutPage />
  },
  {
    path: "/login",
    element: <HomePage />, 
  },

  // =========================================================================
  // 2. ROTAS ADMINISTRATIVAS (DASHBOARD DA LOJA)
  // =========================================================================
  {
    path: "/admin",
    element: <HomePage />, // Visão geral / Métricas de vendas (DashboardPage)
  },
  {
    path: "/admin/produtos",
    element: <HomePage />, // Tabela de listagem e gerenciamento de produtos
  },
  {
    path: "/admin/produtos/novo",
    element: <CreatePage />, // Cadastro de produto
  },
  {
    path: "/admin/produtos/editar/:id",
    element: <CreatePage />, // Edição de produto
  },
  {
    path: "/admin/pedidos",
    element: <HomePage />, // Gerenciamento de pedidos recebidos
  },

  {
    path: "*",
    element: <ErrorPage />,
  }
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}