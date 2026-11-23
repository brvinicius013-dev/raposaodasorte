import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import MobileBetBar from './MobileBetBar.jsx';
import MobileBetSlip from './MobileBetSlip.jsx';
import MobileMenu from './MobileMenu.jsx';

// Layout mobile: cabeçalho fixo, barra do cupom logo abaixo, menu e cupom em tela cheia.
export default function MobileLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return (
    <div className="m-app">
      {booting && (
        <div className="m-loader" onAnimationEnd={(e) => e.target === e.currentTarget && setBooting(false)}>
          <Logo />
          <div className="m-loader-box">
            <span className="spinner light" />
          </div>
        </div>
      )}
      <header className="m-header">
        <span className="m-header-brand" onClick={() => setMenuOpen(false)}>
          <Logo />
        </span>
        <button type="button" className="m-header-menu" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>
      <MobileBetBar />
      <main className="m-content">
        {children}
        <SiteFooter />
      </main>
      {menuOpen && <MobileMenu />}
      <MobileBetSlip />
    </div>
  );
}
