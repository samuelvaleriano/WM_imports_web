import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./ShirtMenu.module.css";

const MENU_ESTRUTURA = [
  {
    titulo: "Brasileiros",
    slug: "brasileiros",
    subcategorias: [
      {
        nome: "Rio de Janeiro",
        slug: "rio-de-janeiro",
        escudo: "/escudo/rio-de-janeiro.png",
        times: [
          { nome: "Flamengo", slug: "flamengo", escudo: "/escudos/flamengo.png.png" },
          { nome: "Fluminense", slug: "fluminense", escudo: "/escudos/fluminense.png.png" },
          { nome: "Botafogo", slug: "botafogo", escudo: "/escudos/botafogo.png.png" },
          { nome: "Vasco", slug: "vasco", escudo: "/escudos/vasco.png.png" },
        ],
      },
      {
        nome: "Minas Gerais",
        slug: "minas-gerais",
        escudo: "/escudo/minas-gerais.png",
        times: [
          { nome: "Atlético MG", slug: "atletico-mg", escudo: "/escudos/atletico-mg.png.png" },
          { nome: "Cruzeiro", slug: "cruzeiro", escudo: "/escudos/cruzeiro.png.png" },
        ],
      },
      {
        nome: "Nordeste",
        slug: "nordeste",
        escudo: "/escudo/nordeste.png",
        times: [
          { nome: "Bahia", slug: "bahia", escudo: "/escudos/bahia.png.png" },
          { nome: "Fortaleza", slug: "fortaleza", escudo: "/escudos/fortaleza.png.png" },
        ],
      },
      {
        nome: "São Paulo",
        slug: "sao-paulo",
        escudo: "/escudo/sao-paulo.png",
        times: [
          { nome: "Corinthians", slug: "corinthians", escudo: "/escudos/corinthians.png.png" },
          { nome: "Palmeiras", slug: "palmeiras", escudo: "/escudos/palmeiras.png.png" },
          { nome: "São Paulo", slug: "sao-paulo-fc", escudo: "/escudos/sao-paulo-fc.png.png" },
          { nome: "Santos", slug: "santos", escudo: "/escudos/santos.png.png" },
        ],
      },
      {
        nome: "Rio Grande do Sul",
        slug: "rio-grande-do-sul",
        escudo: "/escudo/rio-grande-do-sul.png",
        times: [
          { nome: "Internacional", slug: "internacional", escudo: "/escudos/internacional.png.png" },
          { nome: "Grêmio", slug: "gremio", escudo: "/escudos/gremio.png.png" },
        ],
      },
    ],
  },
  {
    titulo: "Internacionais",
    slug: "internacionais",
    subcategorias: [
      {
        nome: "Bundesliga",
        slug: "bundesliga",
        escudo: "/escudos/bundesliga.png.png",
        times: [
          { nome: "Bayer Leverkusen", slug: "bayer-leverkusen", escudo: "/escudos/bayer-leverkusen.png.png" },
          { nome: "Bayern de Munique", slug: "bayern-de-munique", escudo: "/escudos/bayern_munich.png.png" },
          { nome: "Borussia Dortmund", slug: "borussia-dortmund", escudo: "/escudos/borussia-dortmund.png.png" },
          { nome: "RB Leipzig", slug: "rb-leipzig", escudo: "/escudos/rb-leipzig.png.png" },
        ],
      },
      {
        nome: "La Liga",
        slug: "la-liga",
        escudo: "/escudos/la-liga.png.png",
        times: [
          { nome: "Real Madrid", slug: "real-madrid", escudo: "/escudos/real-madrid.png.png" },
          { nome: "Barcelona", slug: "barcelona", escudo: "/escudos/barcelona.png.png" },
          { nome: "Atlético de Madrid", slug: "atletico-de-madrid", escudo: "/escudos/atletico-de-madrid.png.png" },
          { nome: "Real Sociedad", slug: "real-sociedad", escudo: "/escudos/real-sociedad.png.png" },
          { nome: "Athletic Bilbao", slug: "athletic-bilbao", escudo: "/escudos/athletic-bilbao.png.png" },
          { nome: "Sevilla", slug: "sevilla", escudo: "/escudos/sevilla.png.png" },
          { nome: "Valencia", slug: "valencia", escudo: "/escudos/valencia.png.png" },
          { nome: "Villarreal", slug: "villarreal", escudo: "/escudos/villarreal.png.png" },
        ],
      },
      {
        nome: "Ligue 1",
        slug: "ligue-1",
        escudo: "/escudos/ligue-1.png.png",
        times: [
          { nome: "Lyon", slug: "lyon", escudo: "/escudos/lyon.png.png" },
          { nome: "Mônaco", slug: "monaco", escudo: "/escudos/monaco.png.png" },
          { nome: "PSG", slug: "psg", escudo: "/escudos/psg.png.png" },
          { nome: "Marseille", slug: "marseille", escudo: "/escudos/marseille.png.png" },
        ],
      },
      {
        nome: "Premier League",
        slug: "premier-league",
        escudo: "/escudos/premier-league.png.png",
        times: [
          { nome: "Arsenal", slug: "arsenal", escudo: "/escudos/arsenal.png.png" },
          { nome: "Chelsea", slug: "chelsea", escudo: "/escudos/chelsea.png.png" },
          { nome: "Everton", slug: "everton", escudo: "/escudos/everton.png.png" },
          { nome: "Liverpool", slug: "liverpool", escudo: "/escudos/liverpool.png.png" },
          { nome: "Manchester City", slug: "manchester-city", escudo: "/escudos/manchester-city.png.png" },
          { nome: "Manchester United", slug: "manchester-united", escudo: "/escudos/manchester-united.png.png" },
          { nome: "Newcastle United", slug: "newcastle-united", escudo: "/escudos/newcastle-united.png.png" },
          { nome: "Tottenham", slug: "tottenham", escudo: "/escudos/tottenham.png.png" },
          { nome: "West Ham", slug: "west-ham", escudo: "/escudos/west-ham.png.png" },
          { nome: "Wolverhampton", slug: "wolverhampton", escudo: "/escudos/wolverhampton.png.png" },
          { nome: "Aston Villa", slug: "aston-villa", escudo: "/escudos/aston-villa.png.png" },
        ],
      },
      {
        nome: "Serie A",
        slug: "serie-a",
        escudo: "/escudos/serie-a.png.png",
        times: [
          { nome: "Inter de Milão", slug: "inter-de-milao", escudo: "/escudos/inter-de-milao.png.png" },
          { nome: "AC Milan", slug: "ac-milan", escudo: "/escudos/ac-milan.png.png" },
          { nome: "Juventus", slug: "juventus", escudo: "/escudos/juventus.png.png" },
          { nome: "Roma", slug: "roma", escudo: "/escudos/roma.png.png" },
          { nome: "Napoli", slug: "napoli", escudo: "/escudos/napoli.png.png" },
        ],
      },
      {
        nome: "Libertadores",
        slug: "libertadores",
        escudo: "/escudos/libertadores.png.png",
      },
      {
        nome: "UEFA Champions League",
        slug: "uefa-champions-league",
        escudo: "/escudos/uefa-champions-league.png.png",
      },
      {
        nome: "Resto do Mundo",
        slug: "resto-do-mundo",
        escudo: "/escudos/resto-do-mundo.png.png",
      },
    ],
  },
  {
    titulo: "Seleções",
    slug: "selecoes",
    subcategorias: [
      { nome: "África", slug: "africa", escudo: "/escudos/africa.png.png" },
      { nome: "América Sul/Norte", slug: "america-sul-norte", escudo: "/escudos/america-sul-norte.png.png" },
      { nome: "Ásia", slug: "asia", escudo: "/escudos/asia.png.png" },
      { nome: "Europa", slug: "europa", escudo: "/escudos/europa.png.png" },
    ],
  },
  {
    titulo: "Retrô",
    slug: "retro",
  },
  {
    titulo: "Femininas",
    slug: "femininas",
  },
];

export default function ShirtMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [subcategoriaAtiva, setSubcategoriaAtiva] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
    setCategoriaAtiva(null);
    setSubcategoriaAtiva(null);
  };

  const fecharMenu = () => {
    setIsOpen(false);
    setCategoriaAtiva(null);
    setSubcategoriaAtiva(null);
  };

  const handleToggleSubmenu = (index, e) => {
    e.stopPropagation();
    setCategoriaAtiva((prev) => (prev === index ? null : index));
  };

  const handleNavegar = (path) => {
    fecharMenu();
    navigate(path);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        fecharMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button
        type="button"
        className={`${styles.hamburgerBtn} ${isOpen ? styles.activeBtn : ""}`}
        onClick={toggleMenu}
        aria-label="Alternar Menu"
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>

      {isOpen && <div className={styles.backdrop} onClick={fecharMenu} />}

      <div className={`${styles.menuWrapper} ${isOpen ? styles.active : ""}`}>
        <nav className={styles.menuDropdown}>
          <div className={styles.navContent}>
            {subcategoriaAtiva ? (
              <div className={styles.teamViewContainer}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setSubcategoriaAtiva(null)}
                >
                  ‹ Voltar
                </button>

                <div className={styles.teamHeaderRow}>
                  {subcategoriaAtiva.sub.escudo && (
                    <img
                      src={subcategoriaAtiva.sub.escudo}
                      alt=""
                      className={styles.headerIcon}
                    />
                  )}
                  <span>{subcategoriaAtiva.sub.nome}</span>
                </div>

                <div className={styles.teamList}>
                  {subcategoriaAtiva.sub.times.map((time) => (
                    <button
                      key={time.slug}
                      type="button"
                      className={styles.teamItemBtn}
                      onClick={() =>
                        handleNavegar(
                          `/catalogo/${subcategoriaAtiva.catSlug}/${subcategoriaAtiva.sub.slug}/${time.slug}`
                        )
                      }
                    >
                      <img
                        src={time.escudo}
                        alt={time.nome}
                        className={styles.teamIcon}
                      />
                      <span>{time.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <Link to="/" onClick={fecharMenu} className={styles.homeLink}>
                  INÍCIO
                </Link>

                {MENU_ESTRUTURA.map((item, index) => {
                  const temSub = item.subcategorias && item.subcategorias.length > 0;
                  const estaAberto = categoriaAtiva === index;

                  return (
                    <div key={item.slug} className={styles.menuGroup}>
                      <div className={styles.categoryHeader}>
                        <button
                          type="button"
                          className={styles.mainCategoryBtn}
                          onClick={(e) => {
                            if (temSub) {
                              handleToggleSubmenu(index, e);
                            } else {
                              handleNavegar(`/catalogo/${item.slug}`);
                            }
                          }}
                        >
                          {item.titulo}
                        </button>

                        {temSub && (
                          <button
                            type="button"
                            className={`${styles.arrowBtn} ${estaAberto ? styles.arrowOpen : ""}`}
                            onClick={(e) => handleToggleSubmenu(index, e)}
                            aria-label={`Ver subcategorias de ${item.titulo}`}
                          >
                            ›
                          </button>
                        )}
                      </div>

                      {temSub && (
                        <div
                          className={`${styles.submenu} ${estaAberto ? styles.submenuVisible : ""}`}
                        >
                          {item.subcategorias.map((sub) => (
                            <button
                              key={sub.slug}
                              type="button"
                              className={styles.subItemBtn}
                              onClick={() => {
                                if (sub.times && sub.times.length > 0) {
                                  setSubcategoriaAtiva({
                                    catSlug: item.slug,
                                    sub,
                                  });
                                } else {
                                  handleNavegar(`/catalogo/${item.slug}/${sub.slug}`);
                                }
                              }}
                            >
                              <span>{sub.nome}</span>
                              {sub.times && sub.times.length > 0 && (
                                <span className={styles.subArrow}>›</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}