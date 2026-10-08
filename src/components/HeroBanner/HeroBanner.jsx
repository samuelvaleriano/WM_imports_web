import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeroBanner.module.css';

const SLIDES = [
  {
    id: 1,
    imagem: '/escudos/Hero.jpeg',
    badge: 'OFERTA EXCLUSIVA',
    titulo: 'MANTOS OFICIAIS COM ATÉ 40% OFF',
    subtitulo: 'Garanta as camisas das principais seleções e clubes com frete grátis.',
    link: '/produtos?ofertas=true',
    tagDesconto: '40% OFF',
  },
  {
    id: 2,
    imagem: '/escudos/manchester_city.png.png',
    badge: 'NOVA COLEÇÃO',
    titulo: 'LANÇAMENTOS DA TEMPORADA',
    subtitulo: 'Confira as novas camisas dos maiores times internacionais.',
    link: '/produtos?categoria=internacionais',
    tagDesconto: 'NOVO',
  },
  {
    id: 3,
    imagem: '/escudos/universitario.png.png',
    badge: 'SELEÇÕES',
    titulo: 'VISTA A SUA PAIXÃO NACIONAL',
    subtitulo: 'Mantos de seleções de todo o mundo com qualidade premium.',
    link: '/produtos?categoria=selecoes',
    tagDesconto: 'FRETE GRÁTIS',
  },
];

export default function HeroBanner() {
  const [indexAtual, setIndexAtual] = useState(0);
  const [isPausado, setIsPausado] = useState(false);
  const navigate = useNavigate();

  // Alterna o slide automaticamente (e reseta o timer quando indexAtual muda)
  useEffect(() => {
    if (isPausado) return;

    const intervalo = setInterval(() => {
      setIndexAtual((prevIndex) =>
        prevIndex === SLIDES.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(intervalo);
  }, [indexAtual, isPausado]);

  const handleSlideChange = (novoIndex) => {
    setIndexAtual(novoIndex);
  };

  const handleActionClick = (e, link) => {
    e.preventDefault();
    if (link.startsWith('/')) {
      navigate(link);
    } else {
      window.location.href = link;
    }
  };

  return (
    <section
      className={styles.carrossel}
      onMouseEnter={() => setIsPausado(true)}
      onMouseLeave={() => setIsPausado(false)}
    >
      {SLIDES.map((slide, index) => {
        const isAtivo = index === indexAtual;

        return (
          <div
            key={slide.id}
            className={`${styles.slide} ${isAtivo ? styles.ativo : ''}`}
            aria-hidden={!isAtivo}
          >
            <img
              src={slide.imagem}
              alt={slide.titulo}
              className={styles.imagem}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className={styles.overlay} />

            <div className={styles.conteudo}>
              <span className={styles.badge}>{slide.badge}</span>
              <h2 className={styles.titulo}>{slide.titulo}</h2>
              <p className={styles.subtitulo}>{slide.subtitulo}</p>
              <a
                href={slide.link}
                className={styles.botao}
                onClick={(e) => handleActionClick(e, slide.link)}
              >
                APROVEITAR AGORA
              </a>
            </div>

            <div className={styles.tagDesconto}>{slide.tagDesconto}</div>
          </div>
        );
      })}

      {/* INDICADORES (Navegação por Pílula) */}
      <div className={styles.indicadores}>
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.bolinha} ${
              index === indexAtual ? styles.bolinhaAtiva : ''
            }`}
            onClick={() => handleSlideChange(index)}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}