import React from 'react';
import logo from '../../assets/logo-sigma.png'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, MonitorSpeaker, BrainCircuit, History, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { SystemType } from '../../types';

const modeItems: { mode: SystemType; label: string; subtitle: string; icon: React.ReactNode }[] = [
  { mode: 'portable', label: 'Portable Mode', subtitle: 'Monitoring per lokasi', icon: <Smartphone className="w-5 h-5" /> },
  { mode: 'panel', label: 'Panel Mode', subtitle: 'Monitoring per lahan', icon: <MonitorSpeaker className="w-5 h-5" /> },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { activePage, activeMode, setActiveMode, setActivePage } = useApp();

  function navigate(page: 'dashboard' | 'history' | 'ai-analysis') {
    setActivePage(page);
    onClose?.();
  }

  function navigateMode(mode: SystemType) {
    setActiveMode(mode);
    setActivePage('dashboard');
    onClose?.();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SIGMA Logo" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-white font-extrabold text-xl tracking-tighter leading-none">SIGMA</h1>
              <p className="text-white/50 text-xs mt-0.5">Smart IoT for Growth Monitoring in Agriculture</p>
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {modeItems.map(item => (
          <button
            key={item.mode}
            onClick={() => navigateMode(item.mode)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activePage === 'dashboard' && activeMode === item.mode
                ? 'bg-primary text-white shadow-lg'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="shrink-0">{item.icon}</div>
            <div className="flex-1 text-left">
              <p>{item.label}</p>
              <p className={`text-[11px] ${activePage === 'dashboard' && activeMode === item.mode ? 'text-white/85' : 'text-white/40'}`}>{item.subtitle}</p>
            </div>
            {activePage === 'dashboard' && activeMode === item.mode && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
          </button>
        ))}

        <button
          onClick={() => navigate('history')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activePage === 'history'
              ? 'bg-primary text-white shadow-lg'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <History className="w-5 h-5" />
          Riwayat Lengkap
          {activePage === 'history' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
        </button>
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => navigate('ai-analysis')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
            activePage === 'ai-analysis'
              ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-lg shadow-primary/30'
              : 'bg-white/10 text-white hover:bg-white/15'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Analisis Foto AI
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-[#14261D] shadow-xl fixed left-0 top-0 h-full z-30">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-[#14261D] shadow-2xl z-50 lg:hidden"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
