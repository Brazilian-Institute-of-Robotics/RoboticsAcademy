import React from 'react';
import { createRoot } from 'react-dom/client';
import PasswordResetConfirm from './components/PasswordResetConfirm';

createRoot(document.getElementById('password-reset-confirm-root')).render(
  <React.StrictMode>
    <PasswordResetConfirm />
  </React.StrictMode>
);