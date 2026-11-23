import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Porta 5180 para não conflitar com outros projetos na 5173.
// host: true expõe na rede local, para abrir pelo celular (http://IP-do-PC:5180).
export default defineConfig({
  plugins: [react()],
  server: { port: 5180, host: true },
  preview: { port: 5181, host: true },
});
