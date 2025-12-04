import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// AFTER (in main.jsx):
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
