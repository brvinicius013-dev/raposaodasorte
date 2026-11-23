import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const BetSlipContext = createContext(null);
const SLIP_KEY = 'arena.slip';
const TICKETS_KEY = 'arena.tickets';
const USER_KEY = 'arena.user';
const BALANCE_KEY = 'arena.balance';
export const MAX_SELECTIONS = 20;
export const MIN_STAKE = 1;
export const MAX_STAKE = 1000;

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* armazenamento indisponível */
  }
}

function newCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function BetSlipProvider({ children }) {
  const [selections, setSelections] = useState(() => load(SLIP_KEY, {}).selections || []);
  const [stake, setStake] = useState(() => load(SLIP_KEY, {}).stake || '');

  // Mantém o cupom ao recarregar a página
  useEffect(() => {
    save(SLIP_KEY, { selections, stake });
  }, [selections, stake]);
  const [user, setUserState] = useState(() => load(USER_KEY, null));
  const [slipOpen, setSlipOpen] = useState(false);

  // Saldo FICTÍCIO (demonstração). Nenhum valor aqui é dinheiro de verdade.
  const [balance, setBalance] = useState(() => Number(load(BALANCE_KEY, 0)) || 0);
  useEffect(() => {
    save(BALANCE_KEY, balance);
  }, [balance]);

  // Depósito simulado: credita o saldo fictício, sem PIX real.
  const deposit = useCallback((amount) => {
    const value = Math.max(0, Number(amount) || 0);
    setBalance((b) => Math.round((b + value) * 100) / 100);
    return value;
  }, []);

  // selection: { matchId, match, marketId, marketName, pickId, pickLabel, odd }
  const toggle = useCallback((sel) => {
    setSelections((prev) => {
      const same = prev.find((s) => s.matchId === sel.matchId);
      if (same && same.marketId === sel.marketId && same.pickId === sel.pickId) {
        return prev.filter((s) => s.matchId !== sel.matchId);
      }
      const others = prev.filter((s) => s.matchId !== sel.matchId);
      if (!same && others.length >= MAX_SELECTIONS) return prev;
      return [...others, sel];
    });
  }, []);

  const remove = useCallback((matchId) => setSelections((p) => p.filter((s) => s.matchId !== matchId)), []);
  const clear = useCallback(() => {
    setSelections([]);
    setStake('');
  }, []);

  const isSelected = useCallback(
    (matchId, marketId, pickId) =>
      selections.some((s) => s.matchId === matchId && s.marketId === marketId && s.pickId === pickId),
    [selections],
  );

  const totalOdd = useMemo(
    () => (selections.length ? selections.reduce((acc, s) => acc * s.odd, 1) : 0),
    [selections],
  );
  const stakeValue = Number(stake) || 0;
  const possibleReturn = totalOdd * stakeValue;

  const finalize = useCallback(() => {
    if (stakeValue > balance) return null; // saldo fictício insuficiente
    setBalance((b) => Math.round((b - stakeValue) * 100) / 100);
    const ticket = {
      code: newCode(),
      createdAt: new Date().toISOString(),
      user: user?.name || 'Visitante',
      stake: stakeValue,
      totalOdd: Math.round(totalOdd * 100) / 100,
      possibleReturn: Math.round(possibleReturn * 100) / 100,
      status: 'Aberto',
      selections: selections.map((s) => ({
        match: `${s.match.home} x ${s.match.away}`,
        league: s.match.leagueName,
        start: s.match.start,
        market: s.marketName,
        pick: s.pickLabel,
        odd: s.odd,
        live: Boolean(s.match.live),
      })),
    };
    const tickets = load(TICKETS_KEY, {});
    tickets[ticket.code] = ticket;
    save(TICKETS_KEY, tickets);
    clear();
    return ticket;
  }, [selections, stakeValue, totalOdd, possibleReturn, user, clear, balance]);

  const findTicket = useCallback((code) => load(TICKETS_KEY, {})[code.trim().toUpperCase()] || null, []);

  const setUser = useCallback((u) => {
    setUserState(u);
    if (u) save(USER_KEY, u);
    else {
      try {
        localStorage.removeItem(USER_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const value = {
    selections, toggle, remove, clear, isSelected,
    stake, setStake, stakeValue, totalOdd, possibleReturn, finalize, findTicket,
    user, setUser, slipOpen, setSlipOpen,
    balance, deposit,
  };
  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>;
}

export const useBetSlip = () => useContext(BetSlipContext);
