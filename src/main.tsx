import React from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './lib/providers';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <Providers>
      <App />
    </Providers>
  );
}
