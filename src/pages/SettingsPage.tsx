import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Smartphone, MonitorSpeaker, Bell, Shield, Info, Save, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { SystemType } from '../types';

export default function SettingsPage() {
  const { profile, user, updateProfile } = useAuth();
  const { activeMode, setActiveMode, notifEnabled, setNotifEnabled, autoSync, setAutoSync } = useApp();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateProfile({ full_name: fullName, system_type: activeMode });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function SettingRow({ icon, label, desc, children }: { icon: React.ReactNode; label: string; desc?: string; children?: React.ReactNode }) {
    return (
      <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{label}</p>
            {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
          </div>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    );
  }

  function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!on)}
        className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${on ? 'bg-primary shadow-primary/20' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tighter">Pengaturan</h2>
          <p className="text-sm text-neutral-muted font-medium">Kelola akun dan preferensi sistem</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Profil Pengguna
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-teal-400 transition-colors"
              placeholder="Nama lengkap Anda"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          Tipe Perangkat Utama
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(['portable', 'panel'] as SystemType[]).map(type => (
            <button
              key={type}
              onClick={() => setActiveMode(type)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                activeMode === type
                  ? 'border-primary bg-primary/5 text-primary scale-105 shadow-primary/10'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {type === 'portable' ? <Smartphone className="w-5 h-5" /> : <MonitorSpeaker className="w-5 h-5" />}
              <div className="text-left">
                <p className="text-sm font-semibold">{type === 'portable' ? 'Portable' : 'Panel Tetap'}</p>
                <p className="text-xs opacity-70 mt-0.5">{type === 'portable' ? 'Sensor Genggam' : 'Stasiun Tetap'}</p>
              </div>
              {activeMode === type && <Check className="w-4 h-4 text-primary ml-auto" />}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Notifikasi & Sinkronisasi
        </h3>
        <SettingRow icon={<Bell className="w-4 h-4 text-gray-500" />} label="Notifikasi Peringatan" desc="Dapatkan notifikasi saat sensor di luar rentang">
          <Toggle on={notifEnabled} onChange={setNotifEnabled} />
        </SettingRow>
        <SettingRow icon={<Shield className="w-4 h-4 text-gray-500" />} label="Sinkronisasi Otomatis" desc="Perbarui data setiap 10 menit secara otomatis">
          <Toggle on={autoSync} onChange={setAutoSync} />
        </SettingRow>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          Tentang Aplikasi
        </h3>
        {[
          { label: 'Versi', value: 'v1.0.0' },
          { label: 'Model AI', value: 'penyakit-bawang/1' },
          { label: 'Sumber AI', value: 'Roboflow Universe' },
          { label: 'Database', value: 'Supabase' },
          { label: 'Framework', value: 'React + Tailwind CSS' },
        ].map(item => (
          <div key={item.label} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{item.label}</span>
            <span className="text-sm font-medium text-gray-700">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all duration-700 shadow-sm shadow-primary/20"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}
