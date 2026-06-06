import React from 'react';
import logo from '../../assets/logo-sigma.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, MonitorSpeaker, BrainCircuit, History, X, Home, Settings, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { SystemType } from '../../types';

const modeItems: { mode: SystemType; label: string; subtitle: string; icon: React.ReactNode; color: string }[] = [
  { mode: 'portable', label: 'Portable Mode', subtitle: 'Mobile Monitoring', icon: <Smartphone className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
  { mode: 'panel', label: 'Panel Mode', subtitle: 'Land Monitoring', icon: <MonitorSpeaker className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { activePage, activeMode, setActiveMode, setActivePage } = useApp();
  const { profile, signOut } = useAuth();

  function navigate(page: 'home' | 'dashboard' | 'history' | 'ai-analysis' | 'settings') {
    setActivePage(page);
    onClose?.();
  }

  function navigateMode(mode: SystemType) {
    setActiveMode(mode);
    setActivePage('dashboard');
    onClose?.();
  }

  const navItems = [
    { id: 'home' as const, label: 'Beranda', icon: Home, color: 'from-emerald-500 to-teal-500' },
    { id: 'ai-analysis' as const, label: 'Analisis AI', icon: BrainCircuit, color: 'from-violet-500 to-fuchsia-500' },
    { id: 'history' as const, label: 'Riwayat', icon: History, color: 'from-amber-500 to-orange-500' },
    { id: 'settings' as const, label: 'Pengaturan', icon: Settings, color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
      </div>

      {/* Logo Section */}
      <motion.button
        onClick={() => navigate('home')}
        whileHover={{ scale: 1.02 }}
        className="relative px-6 py-6 border-b border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <img src={logo} alt="SIGMA Logo" className="w-7 h-7 object-contain" />
          </motion.div>
          <div>
            <h1 className="text-white font-black text-lg tracking-tighter leading-none">SIGMA</h1>
            <p className="text-white/40 text-[10px] mt-0.5 leading-tight font-medium">IoT Smart System</p>
          </div>
        </div>

        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="lg:hidden absolute right-4 top-6 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </motion.button>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {/* Mode Selector */}
        <div className="space-y-2 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-3 mb-3">Mode Monitoring</p>
          {modeItems.map((item) => (
            <motion.button
              key={item.mode}
              onClick={() => navigateMode(item.mode)}
              whileHover={{ x: 4 }}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                activeMode === item.mode ? 'ring-2 ring-white/30' : ''
              }`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} ${activeMode === item.mode ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'} transition-opacity duration-300`} />

              <div className="relative px-4 py-3 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}>
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-bold ${activeMode === item.mode ? 'text-white' : 'text-white/70'}`}>{item.label}</p>
                  <p className={`text-[10px] ${activeMode === item.mode ? 'text-white/60' : 'text-white/40'}`}>{item.subtitle}</p>
                </div>
                {activeMode === item.mode && (
                  <motion.div className="w-2 h-2 rounded-full bg-white" layoutId="activeIndicator" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0 my-4" />

        {/* Main Pages */}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 px-3 mb-3">Menu Utama</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full group relative overflow-hidden rounded-xl transition-all duration-300"
            >
              {/* Active Background */}
              {isActive && (
                <motion.div layoutId="sidebarActive" className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-15`} />
              )}

              {/* Hover Background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} ${isActive ? 'opacity-15' : 'opacity-0 group-hover:opacity-5'} transition-opacity duration-300`} />

              <div className="relative px-4 py-3 flex items-center gap-3">
                <motion.div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center transition-all ${isActive ? 'text-white shadow-lg shadow-current/50' : 'text-white/60 group-hover:text-white'}`}
                  whileHover={{ scale: 1.1, rotate: 6 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-bold transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                    {item.label}
                  </p>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0" />

      {/* User Profile Section */}
      <div className="relative px-3 py-4 space-y-3">
        {/* Profile Card */}
        <div className="rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {profile?.full_name?.[0]?.toUpperCase() || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Petani'}</p>
              <p className="text-[10px] text-white/50 truncate">{profile?.id ? profile.id.slice(0, 12) + '...' : 'User'}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => navigate('settings')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" />
            Setelan
          </motion.button>
          <motion.button
            onClick={signOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar
          </motion.button>
        </div>

        {/* Status Badge */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400">Status: Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full z-30 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200, duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-72 shadow-2xl z-50 lg:hidden"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
