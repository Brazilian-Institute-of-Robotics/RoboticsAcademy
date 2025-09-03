import React from 'react';
import { createRoot } from 'react-dom/client';
import PasswordResetRequest from './components/PasswordResetRequest';

createRoot(document.getElementById('password-reset-request-root')).render(
  <React.StrictMode>
    <PasswordResetRequest />
  </React.StrictMode>
);