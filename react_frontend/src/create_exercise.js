import React from 'react';
import { createRoot } from 'react-dom/client';
import CreateExercise from './components/CreateExercise';
//import './styles/login.css';

createRoot(document.getElementById('create-exercise-root')).render(
  <React.StrictMode>
    <CreateExercise />
  </React.StrictMode>
);