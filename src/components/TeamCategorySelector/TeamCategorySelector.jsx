import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TeamCategorySelector.module.css';

const TIMES_POR_CATEGORIA = {
  selecoes: [
    { id: 'alemanha', nome: 'ALEMANHA', escudoUrl: '/escudos/alemanha.png.png' },
    { id: 'algeria', nome: 'ARGÉLIA', escudoUrl: '/escudos/algeria.png.png' },
    { id: 'arabia-saudita', nome: 'ARÁBIA SAUDITA', escudoUrl: '/escudos/arabia_saudita.png.png' },
    { id: 'argentina', nome: 'ARGENTINA', escudoUrl: '/escudos/argentina.png.png' },
    { id: 'asia', nome: 'ÁSIA', escudoUrl: '/escudos/asia.png.png' },
    { id: 'australia', nome: 'AUSTRÁLIA', escudoUrl: '/escudos/australia.png.png' },
    { id: 'belgica', nome: 'BÉLGICA', escudoUrl: '/escudos/belgica.png.png' },
    { id: 'cabo-verde', nome: 'CABO VERDE', escudoUrl: '/escudos/cabo_verde.png.png' },
    { id: 'canada', nome: 'CANADÁ', escudoUrl: '/escudos/canada.png.png' },
    { id: 'catar', nome: 'CATAR', escudoUrl: '/escudos/catar.png.png' },
    { id: 'chile', nome: 'CHILE', escudoUrl: '/escudos/chile.png.png' },
    { id: 'colombia', nome: 'COLÔMBIA', escudoUrl: '/escudos/colombia.png.png' },
    { id: 'coreia-do-sul', nome: 'COREIA DO SUL', escudoUrl: '/escudos/coreia_do_sul.png.png' },
    { id: 'costa-rica', nome: 'COSTA RICA', escudoUrl: '/escudos/costa_rica.png.png' },
    { id: 'croacia', nome: 'CROÁCIA', escudoUrl: '/escudos/croacia.png.png' },
    { id: 'curacao', nome: 'CURAÇAO', escudoUrl: '/escudos/curacao.png.png' },
    { id: 'egypt', nome: 'EGITO', escudoUrl: '/escudos/egypt.png.png' },
    { id: 'espanha', nome: 'ESPANHA', escudoUrl: '/escudos/espanha.png.png' },
    { id: 'estados-unidos', nome: 'ESTADOS UNIDOS', escudoUrl: '/escudos/estados_unidos.png.png' },
    { id: 'franca', nome: 'FRANÇA', escudoUrl: '/escudos/franca.png.png' },
    { id: 'ghana', nome: 'GANA', escudoUrl: '/escudos/ghana.png.png' },
    { id: 'holanda', nome: 'HOLANDA', escudoUrl: '/escudos/holanda.png.png' },
    { id: 'inglaterra', nome: 'INGLATERRA', escudoUrl: '/escudos/inglaterra.png.png' },
    { id: 'italia', nome: 'ITÁLIA', escudoUrl: '/escudos/italia.png.png' },
    { id: 'jamaica', nome: 'JAMAICA', escudoUrl: '/escudos/jamaica.png.png' },
    { id: 'japao', nome: 'JAPÃO', escudoUrl: '/escudos/japao.png.png' },
    { id: 'mexico', nome: 'MÉXICO', escudoUrl: '/escudos/mexico.png.png' },
    { id: 'morocco', nome: 'MARROCOS', escudoUrl: '/escudos/morocco.png.png' },
    { id: 'nigeria', nome: 'NIGÉRIA', escudoUrl: '/escudos/nigeria.png.png' },
    { id: 'noruega', nome: 'NORUEGA', escudoUrl: '/escudos/noruega.png.png' },
    { id: 'paraguay', nome: 'PARAGUAI', escudoUrl: '/escudos/paraguay.png.png' },
    { id: 'peru', nome: 'PERU', escudoUrl: '/escudos/peru.png.png' },
    { id: 'portugal', nome: 'PORTUGAL', escudoUrl: '/escudos/portugal.png.png' },
    { id: 'senegal', nome: 'SENEGAL', escudoUrl: '/escudos/senegal.png.png' },
    { id: 'suecia', nome: 'SUÉCIA', escudoUrl: '/escudos/suecia.png.png' },
    { id: 'suica', nome: 'SUÍÇA', escudoUrl: '/escudos/suica.png.png' },
    { id: 'uniao-europeia', nome: 'UNIÃO EUROPEIA', escudoUrl: '/escudos/uniao_europeia.png.png' },
    { id: 'uruguay', nome: 'URUGUAI', escudoUrl: '/escudos/uruguay.png.png' },
    { id: 'venezuela', nome: 'VENEZUELA', escudoUrl: '/escudos/venezuela.png.png' },
  ],
  nacionais: [
    { id: 'atletico-mineiro', nome: 'ATLÉTICO MINEIRO', escudoUrl: '/escudos/atletico_mineiro.png.png' },
    { id: 'bahia', nome: 'BAHIA', escudoUrl: '/escudos/bahia.png.png' },
    { id: 'botafogo', nome: 'BOTAFOGO', escudoUrl: '/escudos/botafogo.png.png' },
    { id: 'campeonato-carioca', nome: 'CAMPEONATO CARIOCA', escudoUrl: '/escudos/campeonato_carioca.png.png' },
    { id: 'campeonato-cearense', nome: 'CAMPEONATO CEARENSE', escudoUrl: '/escudos/campeonato_cearense.png.png' },
    { id: 'campeonato-gaucho', nome: 'CAMPEONATO GAÚCHO', escudoUrl: '/escudos/campeonato_gaucho.png.png' },
    { id: 'campeonato-mineiro', nome: 'CAMPEONATO MINEIRO', escudoUrl: '/escudos/campeonato_mineiro.png.png' },
    { id: 'campeonato-paulista', nome: 'CAMPEONATO PAULISTA', escudoUrl: '/escudos/campeonato_paulista.png.png' },
    { id: 'corinthians', nome: 'CORINTHIANS', escudoUrl: '/escudos/corinthians.png.png' },
    { id: 'cruzeiro', nome: 'CRUZEIRO', escudoUrl: '/escudos/cruzeiro.png.png' },
    { id: 'flamengo', nome: 'FLAMENGO', escudoUrl: '/escudos/flamengo.png.png' },
    { id: 'fluminense', nome: 'FLUMINENSE', escudoUrl: '/escudos/fluminense.png.png' },
    { id: 'fortaleza', nome: 'FORTALEZA', escudoUrl: '/escudos/fortaleza.png.png' },
    { id: 'gremio', nome: 'GRÊMIO', escudoUrl: '/escudos/gremio.png.png' },
    { id: 'internacional', nome: 'INTERNACIONAL', escudoUrl: '/escudos/internacional.png.png' },
    { id: 'palmeiras', nome: 'PALMEIRAS', escudoUrl: '/escudos/palmeiras.png.png' },
    { id: 'vasco', nome: 'VASCO DA GAMA', escudoUrl: '/escudos/vasco.png.png' },
  ],
  internacionais: [
    { id: 'aston-villa', nome: 'ASTON VILLA', escudoUrl: '/escudos/aston_villa.png.png' },
    { id: 'athletic-bilbao', nome: 'ATHLETIC BILBAO', escudoUrl: '/escudos/athletic_bilbao.png.png' },
    { id: 'atletico-madrid', nome: 'ATLÉTICO DE MADRID', escudoUrl: '/escudos/atletico_madrid.png.png' },
    { id: 'barcelona', nome: 'BARCELONA', escudoUrl: '/escudos/barcelona.png.png' },
    { id: 'bayer-leverkusen', nome: 'BAYER LEVERKUSEN', escudoUrl: '/escudos/bayer_leverkusen.png.png' },
    { id: 'bayern-munich', nome: 'BAYERN DE MUNIQUE', escudoUrl: '/escudos/bayern_munich.png.png' },
    { id: 'boca-juniors', nome: 'BOCA JUNIORS', escudoUrl: '/escudos/boca_juniors.png.png' },
    { id: 'borussia-dortmund', nome: 'BORUSSIA DORTMUND', escudoUrl: '/escudos/borussia_dortmund.png.png' },
    { id: 'bundesliga', nome: 'BUNDESLIGA', escudoUrl: '/escudos/bundesliga.png.png' },
    { id: 'chelsea', nome: 'CHELSEA', escudoUrl: '/escudos/chelsea.png.png' },
    { id: 'inter-milan', nome: 'INTER DE MILÃO', escudoUrl: '/escudos/inter_milan.png.png' },
    { id: 'juventus', nome: 'JUVENTUS', escudoUrl: '/escudos/juventus.png.png' },
    { id: 'laliga', nome: 'LA LIGA', escudoUrl: '/escudos/laliga.png.png' },
    { id: 'manchester-city', nome: 'MANCHESTER CITY', escudoUrl: '/escudos/manchester_city.png.png' },
    { id: 'manchester-united', nome: 'MANCHESTER UNITED', escudoUrl: '/escudos/manchester_united.png.png' },
    { id: 'milan', nome: 'MILAN', escudoUrl: '/escudos/milan.png.png' },
    { id: 'napoli', nome: 'NÁPOLI', escudoUrl: '/escudos/napoli.png.png' },
    { id: 'premier-league', nome: 'PREMIER LEAGUE', escudoUrl: '/escudos/Premier-League.png_v=1755197528&width=80.png' },
    { id: 'psg', nome: 'PSG', escudoUrl: '/escudos/psg.png.png' },
    { id: 'real-madrid', nome: 'REAL MADRID', escudoUrl: '/escudos/real_madrid.png.png' },
    { id: 'river-plate', nome: 'RIVER PLATE', escudoUrl: '/escudos/river_plate.png.png' },
    { id: 'roma', nome: 'ROMA', escudoUrl: '/escudos/roma.png.png' },
    { id: 'tottenham', nome: 'TOTTENHAM', escudoUrl: '/escudos/tottenham.png.png' },
  ],
};

const CATEGORIAS = [
  { id: 'selecoes', label: 'Seleções' },
  { id: 'nacionais', label: 'Nacionais' },
  { id: 'internacionais', label: 'Internacionais' },
];

export function TeamCategorySelector() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('selecoes');
  const [isSwitching, setIsSwitching] = useState(false);
  const navigate = useNavigate();

  const trackRef = useRef(null);
  const positionRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const hasMovedRef = useRef(false);

  const timesAtuais = TIMES_POR_CATEGORIA[categoriaAtiva] || [];
  const timesDuplicados = [...timesAtuais, ...timesAtuais];

  // Função para trocar de categoria suavemente
  const handleCategoryChange = (novaCategoria) => {
    if (novaCategoria === categoriaAtiva || isSwitching) return;
    
    setIsSwitching(true);

    setTimeout(() => {
      setCategoriaAtiva(novaCategoria);
      positionRef.current = 0;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(0px)`;
      }
      setIsSwitching(false);
    }, 150);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track || timesAtuais.length === 0) return;

    let animationId;
    const speed = 0.4;

    const animate = () => {
      if (!isHoveredRef.current && !isDraggingRef.current && !isSwitching) {
        positionRef.current -= speed;
        const halfWidth = track.scrollWidth / 2;

        if (Math.abs(positionRef.current) >= halfWidth) {
          positionRef.current += halfWidth;
        }

        track.style.transform = `translateX(${positionRef.current}px)`;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [categoriaAtiva, timesAtuais.length, isSwitching]);

  const handlePointerDown = (e) => {
    if (isSwitching) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    startPosRef.current = positionRef.current;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || isSwitching) return;

    const deltaX = e.clientX - startXRef.current;

    if (Math.abs(deltaX) > 8) {
      hasMovedRef.current = true;
    }

    let newPos = startPosRef.current + deltaX;
    const track = trackRef.current;

    if (track) {
      const halfWidth = track.scrollWidth / 2;

      while (newPos <= -halfWidth) {
        newPos += halfWidth;
        startXRef.current += halfWidth;
      }
      while (newPos > 0) {
        newPos -= halfWidth;
        startXRef.current -= halfWidth;
      }

      positionRef.current = newPos;
      track.style.transform = `translateX(${newPos}px)`;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleTimeClick = (timeId) => {
    if (hasMovedRef.current || isSwitching) return;
    navigate(`/produtos?time=${timeId}`);
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.sectionTitle}>SELECIONE POR TIME</h2>

      {/* TABS DE CATEGORIAS */}
      <div className={styles.tabsContainer}>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.tabButton} ${categoriaAtiva === cat.id ? styles.activeTab : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* CARROSSEL INFINITO COM DRAG E TRANSITION SMOOTH */}
      <div className={`${styles.carouselContainer} ${isSwitching ? styles.switching : ''}`}>
        <div
          className={styles.carouselTrack}
          ref={trackRef}
          onMouseEnter={() => (isHoveredRef.current = true)}
          onMouseLeave={() => {
            isHoveredRef.current = false;
            isDraggingRef.current = false;
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {timesDuplicados.map((time, index) => (
            <div
              key={`${time.id}-${index}`}
              role="button"
              tabIndex={0}
              className={styles.teamCard}
              onClick={() => handleTimeClick(time.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleTimeClick(time.id);
                }
              }}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={time.escudoUrl}
                  alt={time.nome}
                  className={styles.crestImage}
                  draggable={false}
                />
              </div>
              <span className={styles.teamName}>{time.nome}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}