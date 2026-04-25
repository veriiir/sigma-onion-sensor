import React from 'react';
import { MapPin, ChevronDown, Plus, Info, Check, X, Loader2 } from 'lucide-react';
import { LandId, SystemType, Land } from '../../types';
import { supabase } from '../../lib/supabase';

// Data awal statis
const INITIAL_LANDS: Land[] = [
  { id: 'lahan1', label: 'Lahan 1', area: '0.5 Ha', crop: 'Bawang Merah', system_type: 'panel', user_id: '' },
  { id: 'lahan2', label: 'Lahan 2', area: '0.8 Ha', crop: 'Bawang Putih', system_type: 'panel', user_id: '' },
];

interface LandSelectorProps {
  selectedLand: LandId;
  onSelect: (land: LandId) => void;
  systemType: SystemType;
}

export default function LandSelector({ selectedLand, onSelect, systemType }: LandSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false); // State Loading
  const [errorMsg, setErrorMsg] = React.useState(''); // State Error (Pengganti Alert)

  // Storage agar data tetap ada saat pindah mode
  const [lands, setLands] = React.useState<Land[]>(() => {
    const saved = localStorage.getItem('sigma_lands_data');
    return saved ? JSON.parse(saved) : INITIAL_LANDS;
  });

  React.useEffect(() => {
    async function fetchLands() {
      const { data } = await supabase.from('lands').select('*');
      if (data) setLands([...INITIAL_LANDS, ...data]);
    }
    fetchLands();
  }, []);
  
  const ref = React.useRef<HTMLDivElement>(null);
  const isPortable = systemType === 'portable';

  // --- FILTER & PILIH DATA ---
  const currentViewLands = lands.filter(l => l.system_type === systemType);
  const selected = currentViewLands.find(l => l.id === selectedLand) || currentViewLands[0] || lands[0];

  // --- Logic Modal ---
  const [newLocName, setNewLocName] = React.useState('');
  const [onionType, setOnionType] = React.useState('Bawang Merah');
  const [coords, setCoords] = React.useState({ lat: '', lng: '' });

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAddLocation = async () => {
    if (!newLocName) {
      setErrorMsg("Nama tidak boleh kosong!");
      return;
    }

    setErrorMsg(''); // Reset error
    setIsSaving(true); // Tampilkan loading

    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;

      const newEntry = {
        label: newLocName,
        crop: onionType,
        system_type: systemType,
        latitude: coords.lat ? parseFloat(coords.lat) : null,
        longitude: coords.lng ? parseFloat(coords.lng) : null,
        user_id: userId
      };

      // PROSES SIMPAN KE DATABASE
      const { data, error } = await supabase
        .from('lands')
        .insert([newEntry])
        .select()
        .single();

      if (error) throw error;

      // Update State Lokal
      setLands(prev => [...prev, data]);
      onSelect(data.id);
      
      // Tutup Modal & Reset
      setShowAddModal(false);
      setNewLocName('');
      setCoords({ lat: '', lng: '' });
      
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan data ke database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        // REVISI: teal-400 -> primary (Hijau)
        className="flex items-center gap-2.5 bg-white border border-gray-200 hover:border-primary rounded-xl px-4 py-2.5 transition-all duration-200 shadow-sm"
      >
        {/* REVISI: teal-100 -> primary/10, teal-600 -> primary */}
        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-primary" />
        </div>
        <div className="text-left shrink-0">
          <p className="text-xs text-gray-400 leading-none">{isPortable ? 'Lokasi Portable' : 'Pilih Lahan'}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate max-w-[130px]">
            {selected.label} {!isPortable && `— ${selected.crop}`}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-black/5 py-3 z-50 animate-in slide-in-from-top-2 origin-top-right">
          <div className="px-4 py-2 border-b border-gray-100 mb-1 flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{isPortable ? 'Daftar Lokasi' : 'Daftar Lahan'}</p>
            {/* REVISI: teal-50 -> primary/10, teal-100 -> primary/20, teal-600 -> primary */}
            <button onClick={() => { setShowAddModal(true); setOpen(false); }} className="p-1 hover:bg-primary/10 rounded-lg text-primary transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {currentViewLands.map(land => (
              <button
                key={land.id}
                onClick={() => { onSelect(land.id); setOpen(false); }}
                // REVISI: teal-50 -> primary/10
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${selectedLand === land.id ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
              >
                {/* REVISI: teal-500 -> primary */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedLand === land.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  {/* REVISI: teal-700 -> primary */}
                  <p className={`text-sm font-bold ${selectedLand === land.id ? 'text-primary' : 'text-gray-700'}`}>{land.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{isPortable ? 'Portable' : `${land.crop} • ${land.area}`}</p>
                </div>
                {/* REVISI: teal-500 -> primary */}
                {selectedLand === land.id && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-full transition-all z-10 shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 pb-4">
                <h3 className="text-xl font-bold text-gray-800 uppercase">Tambah {isPortable ? 'Lokasi' : 'Lahan'}</h3>
                <p className="text-sm text-gray-400 font-medium">Input Data Koordinat G-Maps</p>
            </div>

            <div className="px-8 py-4 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest leading-none">NAMA {isPortable ? 'LOKASI' : 'LAHAN'}</label>
                <input 
                  type="text" value={newLocName} 
                  onChange={(e) => {setNewLocName(e.target.value); setErrorMsg('');}}
                  placeholder="Misal: Lahan Kos Tika"
                  // REVISI: teal-500 -> primary (Hijau), blue -> secondary (Biru)
                  className={`w-full px-5 py-4 bg-secondary/10 border border-gray-100 rounded-2xl focus:border-secondary outline-none transition-all font-bold ${errorMsg ? 'border-red-400' : ''}`}
                />
                {errorMsg && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest italic flex items-center gap-1 animate-bounce">⚠️ {errorMsg}</p>}
              </div>

              {!isPortable && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">VARIETAS BAWANG</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Bawang Merah', 'Bawang Putih'].map((type) => (
                      <button 
                        key={type} onClick={() => setOnionType(type)}
                        // REVISI: teal-500 -> primary, teal-50 -> primary/10, teal-700 -> primary
                        className={`py-3.5 rounded-2xl border-2 font-bold transition-all text-xs ${onionType === type ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/10' : 'border-gray-100 text-gray-400'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">TEMPEL KORDINAT (ONE-STEP)</label>
                <input 
                  type="text" placeholder="PASTE HASIL COPY DISINI..."
                  // REVISI: bg-blue -> bg-secondary/10, border-blue -> border-secondary/20, text-blue -> text-secondary
                  className="w-full px-5 py-4 bg-secondary/10 border-2 border-secondary/20 rounded-2xl focus:border-secondary outline-none transition-all font-black text-secondary placeholder:opacity-50 text-sm"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes(',')) {
                      const [lat, lng] = val.split(',').map(s => s.trim());
                      setCoords({ lat, lng });
                    }
                  }}
                />

                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 font-mono text-[10px] text-center uppercase tracking-widest font-black">
                   <div className="border-r border-gray-100 pr-2">
                     <p className="text-gray-300 mb-1">Lat</p>
                     {/* REVISI: text-teal -> text-secondary */}
                     <p className="text-secondary truncate">{coords.lat || '-'}</p>
                   </div>
                   <div className="pl-2 text-left">
                     <p className="text-gray-300 mb-1">Long</p>
                     {/* REVISI: text-teal -> text-secondary */}
                     <p className="text-secondary truncate">{coords.lng || '-'}</p>
                   </div>
                </div>

                {/* REVISI: bg-amber -> bg-tertiary/10, border-amber -> border-tertiary/20 */}
                <div className="bg-tertiary/10 rounded-[1.5rem] p-5 border border-tertiary/20 mt-2">
                   <div className="flex items-center gap-3 mb-4 text-tertiary font-bold text-xs uppercase tracking-tight">
                      {/* REVISI: bg-amber -> bg-tertiary/20, text-amber -> text-tertiary */}
                      <div className="w-8 h-8 bg-tertiary/20 rounded-lg flex items-center justify-center shrink-0 shadow-sm"><Info className="w-5 h-5 text-tertiary" /></div>
                      <span>CARA COPY KOORDINAT:</span>
                   </div>
                   {/* REVISI: text-amber -> text-tertiary */}
                   <ul className="text-[10px] text-tertiary/80 leading-relaxed font-bold opacity-80 list-none space-y-1">
                     <li>• Cari titik di Google Maps.</li>
                     <li>• Klik Kanan (PC) / Tahan (HP).</li>
                     <li>• Klik angka kordinat untuk Copy.</li>
                   </ul>
                   <a 
                     href="https://www.google.com/maps" target="_blank" rel="noreferrer"
                     // REVISI: border-amber -> border-tertiary/30, text-amber -> text-tertiary, hover:bg-amber -> hover:bg-tertiary
                     className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 bg-white border-2 border-tertiary/30 text-tertiary rounded-xl text-[11px] font-black hover:bg-tertiary hover:text-white transition-all shadow-md active:scale-95 uppercase"
                   >
                     BUKA MAPS SEKARANG →
                   </a>
                </div>
              </div>
            </div>

            <div className="p-8 flex gap-4 mt-2 bg-white rounded-b-[2rem]">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-4 text-gray-400 font-bold hover:bg-gray-50 rounded-2xl"
              >
                BATAL
              </button>
              <button 
                onClick={handleAddLocation}
                disabled={isSaving}
                // REVISI: bg-teal-600 -> bg-primary, shadow-teal -> shadow-primary/30, hover:bg-teal-700 -> opacity-90
                className="flex-[2] py-4.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center gap-2 uppercase text-[13px] disabled:opacity-50 active:scale-95"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "SIMPAN"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}