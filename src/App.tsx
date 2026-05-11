/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SeepDirector from './pages/SeepDirector';
import Characters from './pages/Characters';
import Environments from './pages/Environments';
import Objects from './pages/Objects';
import Marketplace from './pages/Marketplace';
import Learning from './pages/Learning';
import Pricing from './pages/Pricing';
import Exports from './pages/Exports';
import Workflows from './pages/Workflows';
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/studio" element={<ProtectedRoute><SeepDirector /></ProtectedRoute>} />
        <Route path="/characters" element={<ProtectedRoute><Characters /></ProtectedRoute>} />
        <Route path="/environments" element={<ProtectedRoute><Environments /></ProtectedRoute>} />
        <Route path="/objects" element={<ProtectedRoute><Objects /></ProtectedRoute>} />
        <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
        <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        <Route path="/exports" element={<ProtectedRoute><Exports /></ProtectedRoute>} />
        
        {/* Legacy redirects */}
        <Route path="/prompts" element={<Navigate to="/dashboard" replace />} />
        <Route path="/scripts" element={<Navigate to="/studio" replace />} />
      </Routes>
    </Router>
  );
}

