import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const BetSlipContext = createContext(null);
const SLIP_KEY = 'arena.slip';
const TICKETS_KEY = 'arena.tickets';
const BALANCE_KEY = 'arena.balance';
const SESSION_KEY = 'arena.session';
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

function drop(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function newCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const round2 = (n) => Math.round(n * 100) / 100;

export function BetSlipProvider({ children }) {
  const [selections, setSelections] = useState(() => load(SLIP_KEY, {}).selections || []);
  const [stake, setStake] = useState(() => load(SLIP_KEY, {}).stake || '');
  const [slipOpen, setSlipOpen] = useState(false);

  // Mantém o cupom ao recarregar a página
  useEffect(() => {
    save(SLIP_KEY, { selections, stake });
  }, [selections, stake]);

  // --- Sessão do apostador (conta no banco). Saldo e PIX são FICTÍCIOS. ---
  const [token, setToken] = useState(() => load(SESSION_KEY, ''));
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  const [account, setAccount] = useState(null); // { username, pixKey } quando logado
  const [serverBalance, setServerBalance] = useState(0);
  // Saldo local (visitante, sem conta). Em conta, o saldo vem do servidor.
  const [localBalance, setLocalBalance] = useState(() => Number(load(BALANCE_KEY, 0)) || 0);
  useEffect(() => {
    save(BALANCE_KEY, localBalance);
  }, [localBalance]);

  const balance = account ? serverBalance : localBalance;

  const apiFetch = useCallback((url, { method = 'GET', body } = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (tokenRef.current) headers['x-user-token'] = tokenRef.current;
    return fetch(url, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  }, []);

  const applySession = useCallback((tk, user) => {
    setToken(tk);
    tokenRef.current = tk;
    save(SESSION_KEY, tk);
    setAccount({ username: user.username, pixKey: user.pixKey || '' });
    setServerBalance(Number(user.balance) || 0);
  }, []);

  const clearSession = useCallback(() => {
    setToken('');
    tokenRef.current = '';
    drop(SESSION_KEY);
    setAccount(null);
    setServerBalance(0);
  }, []);

  // Restaura a sessão ao abrir o app
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await apiFetch('/api/auth');
        if (r.ok) {
          const u = await r.json();
          setAccount({ username: u.username, pixKey: u.pixKey || '' });
          setServerBalance(Number(u.balance) || 0);
        } else if (r.status === 401) {
          clearSession();
        }
      } catch {
        /* sem backend: segue como visitante */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = useCallback(
    async (username, password) => {
      try {
        const r = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', username, password }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return { error: j.error || `falha (${r.status})` };
        applySession(j.token, j.user);
        return { ok: true };
      } catch {
        return { error: 'Backend indisponível (no deploy da Vercel funciona).' };
      }
    },
    [applySession],
  );

  const login = useCallback(
    async (username, password) => {
      try {
        const r = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', username, password }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return { error: j.error || `falha (${r.status})` };
        applySession(j.token, j.user);
        return { ok: true };
      } catch {
        return { error: 'Backend indisponível (no deploy da Vercel funciona).' };
      }
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth', { method: 'POST', body: { action: 'logout' } });
    } catch {
      /* ignore */
    }
    clearSession();
  }, [apiFetch, clearSession]);

  const setPix = useCallback(
    async (pixKey) => {
      if (!account) return { error: 'entre na conta' };
      const r = await apiFetch('/api/wallet', { method: 'POST', body: { action: 'setpix', pixKey } });
      const u = await r.json().catch(() => ({}));
      if (!r.ok) return { error: u.error || 'falha' };
      setAccount((a) => ({ ...a, pixKey: u.pixKey || '' }));
      return { ok: true };
    },
    [account, apiFetch],
  );

  const withdraw = useCallback(
    async (amount) => {
      if (!account) return { error: 'entre na conta' };
      const r = await apiFetch('/api/wallet', { method: 'POST', body: { action: 'withdraw', amount } });
      const u = await r.json().catch(() => ({}));
      if (!r.ok) return { error: u.error || 'falha' };
      setServerBalance(Number(u.balance) || 0);
      return { ok: true, balance: Number(u.balance) || 0 };
    },
    [account, apiFetch],
  );

  // Depósito SIMULADO: credita saldo fictício (servidor se logado, senão local).
  const deposit = useCallback(
    async (amount) => {
      const value = Math.max(0, Number(amount) || 0);
      if (account) {
        const r = await apiFetch('/api/wallet', { method: 'POST', body: { action: 'deposit', amount: value } });
        const u = await r.json().catch(() => ({}));
        if (r.ok) setServerBalance(Number(u.balance) || 0);
        return value;
      }
      setLocalBalance((b) => round2(b + value));
      return value;
    },
    [account, apiFetch],
  );

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

  const finalize = useCallback(async () => {
    if (stakeValue > balance) return null; // saldo fictício insuficiente
    const ticket = {
      code: newCode(),
      createdAt: new Date().toISOString(),
      user: account?.username || 'Visitante',
      stake: stakeValue,
      totalOdd: round2(totalOdd),
      possibleReturn: round2(possibleReturn),
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

    const saveLocal = () => {
      const tickets = load(TICKETS_KEY, {});
      tickets[ticket.code] = ticket;
      save(TICKETS_KEY, tickets);
    };

    if (account) {
      // Conta: o servidor desconta o saldo fictício. Só confirma se o servidor aceitar.
      try {
        const r = await apiFetch('/api/bets', {
          method: 'POST',
          body: { ...ticket, player: ticket.user, live: ticket.selections.some((s) => s.live) },
        });
        if (!r.ok) return null;
        const data = await r.json().catch(() => ({}));
        if (typeof data.balance === 'number') setServerBalance(data.balance);
        saveLocal();
        clear();
        return ticket;
      } catch {
        return null; // sem backend não dá para apostar logado
      }
    }

    // Visitante: saldo local, envio ao banco é best-effort.
    setLocalBalance((b) => round2(b - stakeValue));
    saveLocal();
    fetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ticket, player: ticket.user, live: ticket.selections.some((s) => s.live) }),
    }).catch(() => {});
    clear();
    return ticket;
  }, [selections, stakeValue, totalOdd, possibleReturn, account, apiFetch, clear, balance]);

  const findTicket = useCallback((code) => load(TICKETS_KEY, {})[code.trim().toUpperCase()] || null, []);

  // Histórico do apostador logado (vem do servidor).
  const myBets = useCallback(async () => {
    if (!account) return [];
    try {
      const r = await apiFetch('/api/bets');
      if (r.ok) return await r.json();
    } catch {
      /* sem backend */
    }
    return [];
  }, [account, apiFetch]);

  const value = {
    selections, toggle, remove, clear, isSelected,
    stake, setStake, stakeValue, totalOdd, possibleReturn, finalize, findTicket,
    slipOpen, setSlipOpen,
    balance, deposit,
    account, login, register, logout, setPix, withdraw, myBets,
  };
  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>;
}

export const useBetSlip = () => useContext(BetSlipContext);
