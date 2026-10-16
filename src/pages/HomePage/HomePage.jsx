import { useEffect, useState } from "react";
import { api } from "../../services/api.js";
import { TeamCategorySelector } from "../../components/TeamCategorySelector/TeamCategorySelector";
import HeroBanner from "../../components/HeroBanner/HeroBanner.jsx";
import { Header } from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer.jsx";
import ProductGrid from "../../components/ProductGrid/ProductGrid.jsx";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [produtos, setProdutos] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todas");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

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
            const precoAtual = Number(produto.preco);
            const precoOriginal = produto.preco_original
              ? Number(produto.preco_original)
              : precoAtual * 1.25;

            return {
              id: produto.id,
              nome: produto.nome,
              time: produto.time_nome || produto.categoria_slug?.toUpperCase(),
              imagemUrl:
                produto.imagem_capa || produto.imagem_url || produto.imagem,
              variacoes: produto.variacoes,
              precoOriginal,
              precoPromocional: precoAtual,
              desconto: produto.desconto,
            };
          })}
          emptyMessage="Nenhum produto encontrado para esta seleção."
        />
      </section>
      <Footer />
    </main>
  );
}