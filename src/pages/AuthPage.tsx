import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Eye, EyeOff, Smartphone, MonitorSpeaker, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SystemType } from '../types';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [systemType, setSystemType] = useState<SystemType>('portable');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Format email tidak valid.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Kata sandi tidak cocok.');
      return;
    }
    if (mode === 'register' && !fullName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    setLoading(true);
    if (mode === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) setError('Email atau kata sandi salah. Silakan coba lagi.');
    } else {
      const { error: err } = await signUp(email, password, fullName, systemType);
      if (err) {
        if (err.includes('already registered')) setError('Email ini sudah terdaftar. Silakan masuk.');
        else setError(err);
      } else {
        setSuccess('Akun berhasil dibuat! Silakan masuk.');
        setMode('login');
        setPassword('');
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900" />
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-teal-400"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
              opacity: Math.random() * 0.3 + 0.05,
              filter: 'blur(60px)',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-teal-400/20 border-2 border-teal-400/50 rounded-2xl flex items-center justify-center mb-4">
                <Leaf className="w-8 h-8 text-teal-300" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide">SIGMA</h1>
              <p className="text-teal-200/80 text-sm mt-1 text-center">Smart IoT for Growth Monitoring in Agriculture</p>
            </div>

            <div className="flex bg-white/10 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'login' ? 'bg-teal-500 text-white shadow-lg' : 'text-white/70 hover:text-white'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'register' ? 'bg-teal-500 text-white shadow-lg' : 'text-white/70 hover:text-white'
                }`}
              >
                Daftar
              </button>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 mb-4"
                >
                  <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-green-500/20 border border-green-400/40 rounded-xl px-4 py-3 mb-4"
                >
                  <CheckCircle className="w-4 h-4 text-green-300 shrink-0" />
                  <p className="text-green-200 text-sm">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 focus:bg-white/15 transition-all text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 focus:bg-white/15 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 focus:bg-white/15 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">Konfirmasi Kata Sandi</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/60 focus:bg-white/15 transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Tipe Perangkat</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSystemType('portable')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                          systemType === 'portable'
                            ? 'bg-teal-500/30 border-teal-400/60 text-white'
                            : 'bg-white/5 border-white/15 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        <Smartphone className="w-6 h-6" />
                        <div className="text-center">
                          <p className="text-xs font-semibold">Portable</p>
                          <p className="text-xs opacity-70 mt-0.5">Sensor Genggam</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSystemType('panel')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                          systemType === 'panel'
                            ? 'bg-teal-500/30 border-teal-400/60 text-white'
                            : 'bg-white/5 border-white/15 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        <MonitorSpeaker className="w-6 h-6" />
                        <div className="text-center">
                          <p className="text-xs font-semibold">Panel Tetap</p>
                          <p className="text-xs opacity-70 mt-0.5">Stasiun Lapangan</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-teal-600/50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-teal-500/25 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    mode === 'login' ? 'Masuk ke SIGMA' : 'Buat Akun'
                  )}
                </button>
              </motion.form>
            </AnimatePresence>
          </div>

          <div className="px-8 pb-6 text-center">
            <p className="text-white/40 text-xs">© 2025 SIGMA — Smart Agriculture Platform</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
