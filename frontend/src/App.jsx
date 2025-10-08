// frontend/src/App.jsx (Updated with Intro Page)
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import AnalysisPage from './pages/AnalysisPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HistoryPage from './pages/HistoryPage';
import IntroPage from './pages/IntroPage'; // Import the new Intro Page
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const showHeader = location.pathname !== '/'; // Don't show header on the intro page

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showHeader && <Header />}
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<IntroPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/coach" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
export default App;