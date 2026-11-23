import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBetSlip } from '../context/BetSlipContext.jsx';

export default function Login() {
  const { setUser } = useBetSlip();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="contentPages">
      <form
        className="login"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 3) return setError('Informe um usuário com ao menos 3 caracteres.');
          if (password.length < 4) return setError('A senha precisa ter ao menos 4 caracteres.');
          setUser({ name: name.trim() });
          navigate('/');
        }}
      >
        <h1 className="pageTitle">Login</h1>
        <label>
          Usuário
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="username" />
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <div className="formError">{error}</div>}
        <button type="submit" className="btn">
          Entrar
        </button>
        <p className="muted">Login de demonstração: qualquer usuário e senha funcionam.</p>
      </form>
    </div>
  );
}
