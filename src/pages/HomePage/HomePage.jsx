import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { TeamCategorySelector } from "../../components/TeamCategorySelector/TeamCategorySelector";
import HeroBanner from "../../components/HeroBanner/HeroBanner.jsx";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await api.get('/api/v1/produtos/');
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


  const produtosFiltrados = produtos.filter((produto) => {
    if (categoriaAtiva === "todas" || categoriaAtiva === "nacionais") return true;
    return produto.categoria_slug === categoriaAtiva;
  });

  if (loading) {
    return <div className={styles.loading}>Carregando produtos...</div>;
  }

  if (erro) {
    return <div className={styles.error}>{erro}</div>;
  }

  return (
    <main className={styles.container}>
      <Header cartCount={0} />
      <HeroBanner />

      <TeamCategorySelector 
        categoriaAtiva={categoriaAtiva} 
        onSelectCategoria={setCategoriaAtiva} 
      />

      <section className={styles.sectionProdutos}>
        <h1 className={styles.title}>Lançamentos e Destaques</h1>

        <div className={styles.grid}>
          {produtosFiltrados.length > 0 ? (
            produtosFiltrados.map((produto) => {
              const precoAtual = Number(produto.preco);
              const precoDe = produto.preco_original 
                ? Number(produto.preco_original) 
                : precoAtual * 1.25; 
              return (
                <ProductCard
                  key={produto.id}
                  produto={{
                    id: produto.id,
                    nome: produto.nome,
                    time: produto.time_nome || produto.categoria_slug?.toUpperCase(),
                    imagemUrl: produto.imagem_capa || produto.imagem,
                    precoOriginal: precoDe,
                    precoPromocional: precoAtual,
                    desconto: produto.desconto
                  }}
                />
              );
            })
          ) : (
            <p className={styles.emptyState}>Nenhum produto encontrado para esta seleção.</p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}