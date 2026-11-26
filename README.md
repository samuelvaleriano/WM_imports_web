# ⚽ WM_Imports - E-Commerce de Camisas de Time (Frontend)

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=for-the-badge&logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento_(Sprint_2)-yellow?style=for-the-badge)

Interface Frontend moderna, responsiva e intuitiva desenvolvida para a **WM_Imports**, plataforma de e-commerce especializada na venda de camisas de futebol (Seleções, Clubes Nacionais e Internacionais). Projeto de extensão universitária com entrega final prevista para **07/12/2026**.

---

## 📌 Visão Geral do Projeto

A **WM_Imports** busca democratizar e automatizar o acesso à compra de vestuário esportivo, substituindo o atendimento manual por canais de mensagem por uma experiência web fluida, prática e segura. A aplicação conta com vitrine interativa, carrinho em gaveta lateral (Drawer), filtros dinâmicos por time, simulação de frete e um painel de gestão exclusivo para o lojista.

---

## 🚀 Funcionalidades Principais (Frontend)

* **🎨 UI/UX "Dark Mode" Esportivo:** Interface responsiva adaptada primariamente para dispositivos móveis (*Mobile First*).
* **👕 Menu Hambúrguer Temático (`MobileShirtMenu`):** Menu lateral mobile com textura e estampa visual de camisa de time no plano de fundo.
* **🏆 Seletor Dinâmico por Categoria de Times (`TeamCategorySelector`):** Filtro em tempo real para Seleções, Nacionais e Internacionais com navegação por brasões.
* **🛒 Carrinho de Compras Lateral (`CartDrawer`):** Abertura sem redirecionamento de tela, controle de quantidades, inserção de cupom e simulação de frete via API do ViaCEP.
* **💳 Checkout Mercado Pago:** Pagamento por PIX com QR Code e consulta automática de status, ou cartão por Payment Brick seguro.
* **📊 Dashboard Administrativo:** Painel restrito para o lojista acompanhar métricas de vendas, gerenciar estoque por tamanho (P, M, G, GG) e alterar banners da loja.

### Checkout Mercado Pago

1. Instale as dependências com `npm install`.
2. Crie um `.env.local` na raiz do frontend com `VITE_API_URL=http://127.0.0.1:8000/api/v1` e `VITE_MP_PUBLIC_KEY=TEST-...` (use a chave pública de teste do Mercado Pago).
3. Inicie o frontend e a API. O checkout exige login, um frete selecionado no carrinho e itens com variação cadastrada.

O frontend envia os itens como `variacao_id` e `quantidade`, usa `/pagamentos/pix` e `/pagamentos/cartao`, e consulta `/pagamentos/{payment_id}/status` a cada 5 segundos enquanto o pagamento estiver pendente. Os dados brutos do cartão permanecem no Payment Brick; somente o token gerado é enviado à API. Configure as credenciais privadas do Mercado Pago apenas no backend.

As rotas atuais da API não recebem o custo do frete. Para evitar que o checkout exiba um total diferente do valor calculado pelo backend, o frontend bloqueia o pagamento quando o frete selecionado tem custo; pagamentos com frete grátis continuam disponíveis.


---

## 🛠️ Tecnologias Utilizadas

* **Biblioteca Principal:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Roteamento:** `react-router-dom`
* **Estilização:** CSS Modules
* **Gerenciamento de Estado:** Context API / Zustand (com persistência em `localStorage`)
* **Consumo de API:** Axios
* **Ícones:** Lucide React / React Icons

---

## 📂 Estrutura de Pastas

```text
src/
├── assets/         # Imagens, logotipos, brasões e texturas
├── components/     # Componentes reutilizáveis
│   ├── CartDrawer/             # Drawer lateral do carrinho
│   ├── Header/                 # Cabeçalho da aplicação
│   ├── MobileShirtMenu/        # Menu hambúrguer com textura de camisa
│   ├── ProductCard/            # Cards de exibição das camisas
│   └── TeamCategorySelector/   # Abas e filtros por times
├── context/        # Gerenciamento de estado global (Carrinho, Auth)
├── pages/          # Páginas da aplicação (Home, Catálogo, Login, AdminDashboard)
├── services/       # Serviços e chamadas HTTP (Axios, API ViaCEP)
├── styles/         # Arquivos de estilização e temas do CSS
├── App.jsx         # Definição e proteção das rotas
└── main.jsx        # Ponto de entrada do React