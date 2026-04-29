import React from 'react';
import logo from '../../assets/logo-sigma.png'; 
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BrainCircuit, History, Settings, X, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { ActivePage } from '../../types';

const navItems: { page: ActivePage; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dasbor', icon: <LayoutDashboard className="w-5 h-5" /> },
  { page: 'ai-analysis', label: 'Analisis AI', icon: <BrainCircuit className="w-5 h-5" /> },
  { page: 'history', label: 'Riwayat', icon: <History className="w-5 h-5" /> },
  { page: 'settings', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { activePage, setActivePage } = useApp();
  const { signOut, user } = useAuth();

  function navigate(page: ActivePage) {
    setActivePage(page);
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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => navigate(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activePage === item.page
                ? 'bg-primary text-white shadow-lg'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
            {activePage === item.page && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-3">
          <div className="w-8 h-8 bg-tertiary rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold uppercase tracking-tighter">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email}</p>
            <p className="text-white/40 text-xs">Petani</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Keluar
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
