import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import maskot from './assets/maskot-sigma.png'; 
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';
import ToastContainer from './components/notifications/ToastContainer';

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
      <div className="min-h-screen bg-[#FBF9F4] flex items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center max-w-sm w-full text-center">
          
          {/* MASKOT DENGAN ANIMASI MENGAPUNG (Floating Animation) */}
          <motion.img
            src={maskot}
            alt="SIGMA Mascot"
            className="w-48 h-48 md:w-56 md:h-56 object-contain mb-8 drop-shadow-2xl"
            /* Efek animasi mascot bergerak naik turun perlahan */
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* TEKS LOADING PROFESIONAL GAYA REFERENSI */}
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-primary tracking-tighter uppercase italic">
              Mohon tunggu sebentar
            </h3>
            <p className="text-neutral-muted font-bold text-xs md:text-sm tracking-widest italic opacity-60 px-4 leading-relaxed">
              SIGMA sedang menyiapkan data lahan <br className="hidden md:block"/> paling akurat untuk anda! 🌿💤
            </p>
          </div>

          {/* INDICATOR PROGRESS BAR MINIMALIS */}
          <div className="w-32 h-1 bg-black/5 rounded-full overflow-hidden mt-10">
             <motion.div
               className="h-full bg-primary"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             />
          </div>

          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-6 italic opacity-50">
            Secure Infrastructure Loading
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <NotificationProvider>
      <AppProvider>
        <MainLayout>
          <PageContent />
        </MainLayout>
        <ToastContainer />
      </AppProvider>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
