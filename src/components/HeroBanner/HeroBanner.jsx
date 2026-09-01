import styles from './HeroBanner.module.css';
import { useState, useEffect } from 'react'; 

const slides = [
  {
    id: 1,
    imagem: "/escudos/Hero.jpeg",
    badge: "OFERTA EXCLUSIVA",
    titulo: "MANTOS OFICIAIS COM ATÉ 40% OFF",
    subtitulo: "Garanta as camisas das principais seleções e clubes com frete grátis.",
    link: "#ofertas",
    tagDesconto: "40% OFF"
  },
  {
    id: 2,
    imagem: "/escudos/manchester_city.png.png",
    badge: "NOVA COLEÇÃO",
    titulo: "LANÇAMENTOS DA TEMPORADA",
    subtitulo: "Confira as novas camisas dos maiores times internacionais.",
    link: "#internacionais",
    tagDesconto: "NOVO"
  },
  {
    id: 3,
    imagem: "/escudos/universitario.png.png",
    badge: "SELEÇÕES",
    titulo: "VISTA A SUA PAIXÃO NACIONAL",
    subtitulo: "Mantos de seleções de todo o mundo com qualidade premium.",
    link: "#selecoes",
    tagDesconto: "FRETE GRÁTIS"
  }
];

export default function HeroBanner() {
  const [indexAtual, setIndexAtual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndexAtual((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); 

    return () => clearInterval(intervalo); 
  }, []);

  return (
    <div className={styles.carrossel}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.slide} ${index === indexAtual ? styles.ativo : ''}`}
        >
          <img
            src={slide.imagem}
            alt={slide.titulo}
            className={styles.imagem}
          />
          <div className={styles.overlay} />
          
          <div className={styles.conteudo}>
            <span className={styles.badge}>{slide.badge}</span>
            <h2 className={styles.titulo}>{slide.titulo}</h2>
            <p className={styles.subtitulo}>{slide.subtitulo}</p>
            <a href={slide.link} className={styles.botao}>
              APROVEITAR AGORA
            </a>
          </div>

          <div className={styles.tagDesconto}>{slide.tagDesconto}</div>
        </div>
      ))}

      <div className={styles.indicadores}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.bolinha} ${index === indexAtual ? styles.bolinhaAtiva : ''}`}
            onClick={() => setIndexAtual(index)}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}