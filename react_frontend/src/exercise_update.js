import React from 'react';
import { createRoot } from 'react-dom/client';
import ExerciseUpdate from './components/ExerciseUpdate';

createRoot(document.getElementById('exercise-update-root')).render(
  <React.StrictMode>
    <ExerciseUpdate />
  </React.StrictMode>
);