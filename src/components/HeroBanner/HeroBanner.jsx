import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHeroBanner } from '../../services/adminService.js';
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
  const [slides, setSlides] = useState(SLIDES);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getHeroBanner()
      .then((config) => {
        if (!active || !config) return;
        const remoteSlides = config.campanhas || config.campaigns || config.slides;
        if (Array.isArray(remoteSlides) && remoteSlides.length) {
          setSlides((current) =>
            remoteSlides.map((remoteSlide, index) => ({
              ...(current[index] || current[0]),
              ...remoteSlide,
              id: remoteSlide.id || index + 1,
              imagem:
                remoteSlide.imagem_url ||
                remoteSlide.imagem ||
                remoteSlide.imagemUrl ||
                current[index]?.imagem ||
                current[0].imagem,
              tagDesconto:
                remoteSlide.frase_promocional ||
                remoteSlide.tag_desconto ||
                remoteSlide.frasePromocional ||
                current[index]?.tagDesconto ||
                '',
              badge: remoteSlide.badge || remoteSlide.selo || current[index]?.badge,
              titulo:
                remoteSlide.titulo ||
                remoteSlide.titulo_principal ||
                current[index]?.titulo,
              subtitulo:
                remoteSlide.subtitulo ||
                remoteSlide.descricao ||
                current[index]?.subtitulo,
              link:
                remoteSlide.link ||
                remoteSlide.url ||
                current[index]?.link,
              textoBotao:
                remoteSlide.texto_botao ||
                remoteSlide.botao ||
                current[index]?.textoBotao ||
                'APROVEITAR AGORA',
            })),
          );
          return;
        }
        setSlides((current) =>
          current.map((slide, index) =>
            index === 0
              ? {
                  ...slide,
                  imagem: config.imagem_url || config.imagem || slide.imagem,
                  tagDesconto:
                    config.frase_promocional ||
                    config.tag_desconto ||
                    slide.tagDesconto,
                  badge: config.badge || config.selo || slide.badge,
                  titulo: config.titulo || config.titulo_principal || slide.titulo,
                  subtitulo: config.subtitulo || config.descricao || slide.subtitulo,
                  link: config.link || config.url || slide.link,
                  textoBotao:
                    config.texto_botao || config.botao || slide.textoBotao,
                }
              : slide,
          ),
        );
      })
      .catch((error) => {
        if (error.response?.status !== 404) {
          console.error('Erro ao carregar configuração do banner:', error);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Alterna o slide automaticamente (e reseta o timer quando indexAtual muda)
  useEffect(() => {
    if (isPausado) return;

    const intervalo = setInterval(() => {
      setIndexAtual((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(intervalo);
  }, [indexAtual, isPausado, slides.length]);

  const handleSlideChange = (novoIndex) => {
    setIndexAtual(novoIndex);
  };

  const handleActionClick = (e, link) => {
    e.preventDefault();
    if (link.startsWith('/')) {
      navigate(link);
    } else {
      window.open(link, '_self');
    }
  };

  return (
    <section
      className={styles.carrossel}
      onMouseEnter={() => setIsPausado(true)}
      onMouseLeave={() => setIsPausado(false)}
    >
      {slides.map((slide, index) => {
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
                {slide.textoBotao || 'APROVEITAR AGORA'}
              </a>
            </div>

            <div className={styles.tagDesconto}>{slide.tagDesconto}</div>
          </div>
        );
      })}

      {/* INDICADORES (Navegação por Pílula) */}
      <div className={styles.indicadores}>
        {slides.map((_, index) => (
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