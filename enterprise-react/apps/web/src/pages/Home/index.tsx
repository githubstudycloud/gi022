import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@enterprise/ui';

const HomePage: React.FC = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-6">
    <h1 className="text-4xl font-bold text-gray-900">Enterprise Web</h1>
    <p className="text-lg text-gray-500">
      A production-ready React Monorepo template
    </p>
    <div className="flex gap-4">
      <Button asChild>
        <Link to="/dashboard">Go to Dashboard</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link to="/login">Login</Link>
      </Button>
    </div>
  </main>
);

export default HomePage;
