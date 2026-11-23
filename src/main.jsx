import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { BetSlipProvider } from './context/BetSlipContext.jsx';
import './styles.css';
import './mobile.css';
import './deposit.css';
import './footer.css';
import './admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BetSlipProvider>
        <App />
      </BetSlipProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
