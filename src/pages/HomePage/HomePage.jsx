import {useEffect, useState} from "react";
import {api} from "../../services/api.js";
import styles from "./HomePage.module.css";


export default function HomePage() {
  const [produtos, setProdutos] = useState([]);
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

if (loading) return <div className={styles.loading}>Carregando produtos...</div>;

  if (erro) {
    return <div className={styles.error}>{erro}</div>;
  }

  return (
    <main className={styles.container}>
      
      <h1 className={styles.title}>Lançamentos e Destaques</h1>

      <div className={styles.grid}>
        {produtos.map((produto) => (
          <div key={produto.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <img 
                src={produto.imagem_capa} 
                alt={produto.nome} 
                className={styles.image} 
              />
            </div>

            <div className={styles.content}>
              <h2 className={styles.productName}>{produto.nome}</h2>
              <p className={styles.description}>{produto.descricao}</p>

              <div className={styles.footer}>
                <span className={styles.price}>
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </span>
                <button className={styles.button}>Ver Detalhes</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}