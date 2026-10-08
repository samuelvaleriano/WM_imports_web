import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '../pages/HomePage/HomePage.jsx';
import CreatePage from '../pages/CreatePage/CreatePage.jsx';
import DetailsPage from '../pages/DetailsPage/DetailsPage.jsx';
import ErrorPage from '../pages/ErrorPage/ErrorPage.jsx';
import CatalogPage from '../pages/CatalogPage/CatalogPage.jsx';
import { Login } from '../pages/Login/Login.jsx';
import { Register } from '../pages/Register/Register.jsx';


import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute.jsx';

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
  
  // Rotas Dinâmicas de Catálogo
  {
    path: "/catalogo",
    element: <CatalogPage />,
  },
  {
    path: "/catalogo/:categoria", 
    element: <CatalogPage />,
  },
  {
    path: "/catalogo/:categoria/:subcategoria", 
    element: <CatalogPage />,
  },
  {
    path: "/catalogo/:categoria/:subcategoria/:time", 
    element: <CatalogPage />,
  },

  // Fluxo de Compra e Autenticação
  {
    path: "/carrinho",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <Login />, 
  },
  {
    path: "/cadastro",
    element: <Register />, 
  },

  // =========================================================================
  // 2. ROTAS PROTEGIDAS DO CLIENTE (Exige estar logado)
  // =========================================================================
  {
    path: "/checkout",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },

  // =========================================================================
  // 3. ROTAS ADMINISTRATIVAS (Exige estar logado e perfil 'admin')
  // =========================================================================
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/admin",
        element: <HomePage />,
      },
      {
        path: "/admin/produtos",
        element: <HomePage />,
      },
      {
        path: "/admin/produtos/novo",
        element: <CreatePage />,
      },
      {
        path: "/admin/produtos/editar/:id",
        element: <CreatePage />,
      },
      {
        path: "/admin/pedidos",
        element: <HomePage />,
      },
    ],
  },

  // Rota de Erro 404
  {
    path: "*",
    element: <ErrorPage />,
  }
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}