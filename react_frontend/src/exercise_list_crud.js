import React from 'react';
import { createRoot } from 'react-dom/client';
import ExerciseListCrud from './components/ExerciseListCrud';

createRoot(document.getElementById('exercise-list-crud-root')).render(
  <React.StrictMode>
    <ExerciseListCrud />
  </React.StrictMode>
);