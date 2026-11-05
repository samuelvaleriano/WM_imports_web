import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { TeamCategorySelector } from "../../components/TeamCategorySelector/TeamCategorySelector";
import HeroBanner from "../../components/HeroBanner/HeroBanner.jsx";
import { Header } from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer.jsx";
import ProductGrid from "../../components/ProductGrid/ProductGrid.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { deleteProduct, updateProduct, uploadProductImage } from "../../services/adminService.js";
import { toast } from "react-toastify";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await api.get("http://127.0.0.1:8000/api/v1/produtos/");
        setProdutos(response.data);
      } catch (err) {
        console.error('Erro ao conectar com a API:', err);
        setErro('Não foi possível carregar os produtos.');
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();
  }, []);

  const handleUpdateProduct = async (productId, data) => {
    try {
      const updated = await updateProduct(productId, data);
      setProdutos((current) =>
        current.map((product) =>
          product.id === productId ? { ...product, ...updated } : product,
        ),
      );
      toast.success("Produto atualizado com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast.error(error.response?.data?.detail || "Não foi possível atualizar o produto.");
      throw error;
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      setProdutos((current) => current.filter((product) => product.id !== productId));
      toast.success("Produto excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast.error(error.response?.data?.detail || "Não foi possível excluir o produto.");
    }
  };


  const produtosFiltrados = produtos.filter((produto) => {
    if (categoriaAtiva === "todas" || categoriaAtiva === "nacionais") return true;
    return produto.categoria_slug === categoriaAtiva;
  });

  if (erro) {
    return <div className={styles.error}>{erro}</div>;
  }

  return (
    <main className={styles.container}>
      <Header />
      <HeroBanner />

      <TeamCategorySelector 
        categoriaAtiva={categoriaAtiva} 
        onSelectCategoria={setCategoriaAtiva} 
      />

      <section className={styles.sectionProdutos}>
        <h1 className={styles.title}>Lançamentos e Destaques</h1>
        <ProductGrid
          loading={loading}
          produtos={produtosFiltrados.map((produto) => {
            const desconto = Number(
              produto.desconto_percentual ??
                produto.desconto ??
                produto.percentual_desconto ??
                0,
            );
            const precoOriginal = Number(produto.preco) || 0;
            const precoAtual =
              desconto > 0 && desconto < 100
                ? precoOriginal * (1 - desconto / 100)
                : precoOriginal;

            return {
              id: produto.id,
              nome: produto.nome,
              time: produto.time_nome || produto.categoria_slug?.toUpperCase(),
              imagemUrl:
                produto.imagem_capa || produto.imagem_url || produto.imagem,
              variacoes: produto.variacoes,
              precoOriginal,
              precoPromocional: precoAtual,
              desconto,
              desconto_percentual: desconto,
              preco: precoAtual,
              preco_original: precoOriginal,
              imagem_url: produto.imagem_url,
              imagem_capa: produto.imagem_capa,
            };
          })}
          isAdmin={isAdmin}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onUploadProductImage={uploadProductImage}
          emptyMessage="Nenhum produto encontrado para esta seleção."
        />
      </section>
      <Footer />
    </main>
  );
}