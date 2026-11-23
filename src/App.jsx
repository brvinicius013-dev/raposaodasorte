import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import BetSlip from './components/BetSlip.jsx';
import Sidebar from './components/Sidebar.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import Topbar from './components/Topbar.jsx';
import useIsMobile from './hooks/useIsMobile.js';
import MobileLayout from './mobile/MobileLayout.jsx';
import Admin from './pages/Admin.jsx';
import AoVivo from './pages/AoVivo.jsx';
import Campeonatos from './pages/Campeonatos.jsx';
import ConferirBilhete from './pages/ConferirBilhete.jsx';
import Conta from './pages/Conta.jsx';
import Deposito from './pages/Deposito.jsx';
import Jogos from './pages/Jogos.jsx';
import Partida from './pages/Partida.jsx';
import Regulamento from './pages/Regulamento.jsx';

const routes = (
  <Routes>
    <Route path="/" element={<Jogos home />} />
    <Route path="/jogos" element={<Jogos />} />
    <Route path="/campeonatos" element={<Campeonatos />} />
    <Route path="/ao-vivo" element={<AoVivo />} />
    <Route path="/partida/:id" element={<Partida />} />
    <Route path="/deposito" element={<Deposito />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/conferir-bilhete" element={<ConferirBilhete />} />
    <Route path="/regulamento" element={<Regulamento />} />
    <Route path="/conta" element={<Conta />} />
    <Route path="/login" element={<Conta />} />
    <Route path="*" element={<div className="semEventos">Página não encontrada.</div>} />
  </Routes>
);

export default function App() {
  const mobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  if (mobile) return <MobileLayout>{routes}</MobileLayout>;

  return (
    <div className="container">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="content">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <div className="contentInner">
          {routes}
          <SiteFooter />
        </div>
      </main>
      <BetSlip />
    </div>
  );
}
