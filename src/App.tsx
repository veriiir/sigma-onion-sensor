import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';

function PageContent() {
  const { activePage } = useApp();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePage}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'ai-analysis' && <AIAnalysisPage />}
        {activePage === 'history' && <HistoryPage />}
        {activePage === 'settings' && <SettingsPage />}
      </motion.div>
    </AnimatePresence>
  );
}

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 to-emerald-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <p className="text-teal-200 text-sm font-medium">Memuat SIGMA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <MainLayout>
        <PageContent />
      </MainLayout>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
