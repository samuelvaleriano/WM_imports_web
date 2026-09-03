import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        <div className={styles.grid}>
          
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logo}>
              WM_<span className={styles.logoHighlight}>IMPORTS</span>
            </Link>
            <p className={styles.description}>
              Sua loja especializada em mantos e artigos esportivos de alta qualidade com frete para todo o Brasil.
            </p>
            <div className={styles.socials}>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className={styles.socialIcon}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/5500000000000" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp"
                className={styles.socialIcon}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Navegação</h3>
            <ul className={styles.linkList}>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/produtos">Coleções</Link></li>
              <li><Link to="/promocoes">Lançamentos</Link></li>
              <li><Link to="/sobre">Sobre Nós</Link></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Atendimento</h3>
            <ul className={styles.linkList}>
              <li><Link to="/entregas">Sobre Entregas & Prazos</Link></li>
              <li><Link to="/trocas">Trocas e Devoluções</Link></li>
              <li><Link to="/privacidade">Política de Privacidade</Link></li>
              <li><Link to="/termos">Termos de Uso</Link></li>
              <li><Link to="/rastreio">Rastrear Pedido</Link></li>
            </ul>
          </div>

          <div className={styles.linksCol}>
            <h3 className={styles.colTitle}>Fale Conosco</h3>
            <div className={styles.contactInfo}>
              <p>
                <strong>WhatsApp:</strong> (00) 90000-0000
              </p>
              <p>
                <strong>E-mail:</strong> contato@wmimports.com.br
              </p>
              <p>
                <strong>Atendimento:</strong> Seg. a Sex. das 09h às 18h
              </p>
            </div>
          </div>

        </div>

        <hr className={styles.divider} />

        <div className={styles.paymentSecurityRow}>
          
          <div className={styles.paymentSection}>
            <span className={styles.sectionLabel}>Formas de Pagamento</span>
            <div className={styles.badgeGroup}>
              <div className={styles.paymentBadge} title="PIX">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                  <path d="M12 2L6.5 7.5L12 13L17.5 7.5L12 2ZM12 22L17.5 16.5L12 11L6.5 16.5L12 22Z" />
                </svg>
                <span>PIX</span>
              </div>

              <div className={styles.paymentBadge} title="Cartões de Crédito">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <span>Cartão</span>
              </div>

              <div className={styles.paymentBadge} title="Boleto Bancário">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 5v14M8 5v14M11 5v14M13 5v14M17 5v14M20 5v14" />
                </svg>
                <span>Boleto</span>
              </div>
            </div>
          </div>

          <div className={styles.securitySection}>
            <span className={styles.sectionLabel}>Segurança</span>
            <div className={styles.badgeGroup}>
              <div className={styles.securityBadge}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#00e5a3" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Site Seguro SSL</span>
              </div>
            </div>
          </div>

        </div>

        <div className={styles.copyrightRow}>
          <p>© {new Date().getFullYear()} WM_IMPORTS. Todos os direitos reservados.</p>
        </div>

      </div>
    </footer>
  );
}