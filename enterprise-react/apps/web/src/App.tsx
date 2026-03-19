import React from 'react';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
