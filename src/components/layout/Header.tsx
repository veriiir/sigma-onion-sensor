import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronRight, Bell, Smartphone, MonitorSpeaker, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { ActivePage, SystemType } from '../../types';

const pageLabels: Record<ActivePage, string> = {
  'dashboard': 'Dasbor',
  'ai-analysis': 'Analisis AI',
  'history': 'Riwayat',
  'settings': 'Pengaturan',
};

export default function Header() {
  const { activePage, activeMode, setActiveMode, setSidebarOpen, setActivePage } = useApp();
  const { user, signOut } = useAuth();
  const { notifications } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20 shadow-sm">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-sm text-gray-500 flex-1 min-w-0">
        <span className="text-teal-600 font-medium hidden sm:block">SIGMA</span>
        <ChevronRight className="w-4 h-4 hidden sm:block" />
        <span className="text-gray-800 font-semibold truncate">{pageLabels[activePage]}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveMode('portable')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeMode === 'portable'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portable</span>
          </button>
          <button
            onClick={() => setActiveMode('panel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeMode === 'panel'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MonitorSpeaker className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panel</span>
          </button>
        </div>

        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[9px] font-bold leading-none px-0.5">{notifications.length}</span>
            </span>
          )}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-bold">{user?.email?.[0]?.toUpperCase() ?? 'U'}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Pengguna SIGMA</p>
              </div>
              <button
                onClick={() => { setActivePage('settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Profil
              </button>
              <button
                onClick={() => { setActivePage('settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Pengaturan
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
