import React from 'react';
import { createRoot } from 'react-dom/client';
import ExerciseCreation from './components/ExerciseCreation';
import { Container, Typography } from '@mui/material';

createRoot(document.getElementById('exercise-create-root')).render(
  <React.StrictMode>
    <ExerciseCreation />
  </React.StrictMode>
);