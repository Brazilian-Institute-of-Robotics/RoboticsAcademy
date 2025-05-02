import React from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from './components/LoginPage';
//import './styles/login.css';

createRoot(document.getElementById('login-root')).render(
  <React.StrictMode>
    <LoginPage />
  </React.StrictMode>
);