import React from 'react';
import { MapPin, ChevronDown, Plus, ExternalLink, Info, Check } from 'lucide-react';
import { LandId, SystemType, Land } from '../../types';

// Data default untuk awal (sebelum koneksi DB selesai)
const INITIAL_LANDS: Land[] = [
  { id: 'lahan1', label: 'Lahan 1', area: '0.5 Ha', crop: 'Bawang Merah', system_type: 'panel', user_id: '' },
  { id: 'lahan2', label: 'Lahan 2', area: '0.8 Ha', crop: 'Bawang Merah', system_type: 'panel', user_id: '' },
];

interface LandSelectorProps {
  selectedLand: LandId;
  onSelect: (land: LandId) => void;
  systemType: SystemType;
}

export default function LandSelector({ selectedLand, onSelect, systemType }: LandSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);

  const [lands, setLands] = React.useState<Land[]>(() => {
    const saved = localStorage.getItem('sigma_lands_data');
    return saved ? JSON.parse(saved) : INITIAL_LANDS;
  });

  React.useEffect(() => {
    localStorage.setItem('sigma_lands_data', JSON.stringify(lands));
  }, [lands]);
  
  const ref = React.useRef<HTMLDivElement>(null);
  
  // Ambil data yang terpilih
  const selected = lands.find(l => l.id === selectedLand) ?? lands[0];
  const isPortable = systemType === 'portable';

  // --- Logic Modal Tambah ---
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

  const handleAddLocation = () => {
    if (!newLocName) return alert("Mohon isi nama lahan/lokasi!");

    const newId = `custom-${Date.now()}`;
    const newEntry: Land = {
      id: newId,
      label: newLocName,
      crop: onionType,
      system_type: systemType,
      latitude: coords.lat ? parseFloat(coords.lat) : undefined,
      longitude: coords.lng ? parseFloat(coords.lng) : undefined,
      user_id: ''
    };

    // UPDATE LIST LANDS SECARA LOKAL
    setLands(prev => [...prev, newEntry]);
    
    // OTOMATIS PILIH YANG BARU DIBUAT
    onSelect(newId);
    
    // CLOSE MODAL & RESET
    setShowAddModal(false);
    setNewLocName('');
    setCoords({ lat: '', lng: '' });
  };

  return (
    <div className="relative" ref={ref}>
      {/* TOMBOL UTAMA */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-white border border-gray-200 hover:border-teal-400 rounded-xl px-4 py-2.5 transition-all duration-200 shadow-sm"
      >
        <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-teal-600" />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-400 leading-none">{isPortable ? 'Lokasi Portable' : 'Pilih Lahan'}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            {selected.label} {isPortable ? '' : `— ${selected.crop}`}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN MENU */}
      {open && (
        <div className="absolute top-full right-0 sm:left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-100 mb-1 flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {isPortable ? 'Daftar Lokasi' : 'Daftar Lahan'}
            </p>
            <button 
              onClick={() => { setShowAddModal(true); setOpen(false); }}
              className="p-1 hover:bg-teal-50 rounded-lg text-teal-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {lands.filter(l => l.system_type === systemType).map(land => (
              <button
                key={land.id}
                onClick={() => { onSelect(land.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${selectedLand === land.id ? 'bg-teal-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedLand === land.id ? 'bg-teal-500' : 'bg-gray-100'}`}>
                  <MapPin className={`w-4 h-4 ${selectedLand === land.id ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-semibold ${selectedLand === land.id ? 'text-teal-700' : 'text-gray-700'}`}>{land.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{isPortable ? 'Portable' : `${land.crop} • ${land.area}`}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL TAMBAH (Compact, Rapi, Smart Paste) --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] relative animate-in fade-in zoom-in duration-300">
            
            {/* Tombol Close (Silang) */}
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>

            {/* Modal Header */}
            <div className="p-8 pb-4">
              <div className="flex items-center gap-4 mb-1">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0 text-teal-600">
                  <Plus className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Tambah {isPortable ? 'Lokasi' : 'Lahan'}</h3>
                  <p className="text-sm text-gray-400 font-medium">Lengkapi data sistem pertanian</p>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable Area) */}
            <div className="px-8 py-2 overflow-y-auto space-y-5 flex-1">
              {/* Field: Nama */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 tracking-tight">NAMA {isPortable ? 'LOKASI' : 'LAHAN'}</label>
                <input 
                  type="text" value={newLocName} onChange={(e) => setNewLocName(e.target.value)}
                  placeholder="Misal: Lahan Barat Daya"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                />
              </div>

              {isPortable ? (
                /* --- KHUSUS PORTABLE (Smart Coords) --- */
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">TEMPEL KOORDINAT GOOGLE MAPS</label>
                    <input 
                      type="text" placeholder="Paste koordinat utuh di sini..."
                      className="w-full px-5 py-4 bg-teal-50 border-2 border-teal-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium text-teal-900"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.includes(',')) {
                          const [lat, lng] = val.split(',').map(s => s.trim());
                          setCoords({ lat, lng });
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">LATITUDE</p>
                      <p className="text-sm font-mono font-bold text-gray-600 truncate">{coords.lat || '-'}</p>
                    </div>
                    <div className="border-l border-gray-200 pl-4 text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">LONGITUDE</p>
                      <p className="text-sm font-mono font-bold text-gray-600 truncate">{coords.lng || '-'}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-[1.5rem] p-5 border border-amber-100">
                    <div className="flex items-center gap-2 mb-3 text-amber-700">
                      <Info className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase">Cara Copy Koordinat:</span>
                    </div>
                    <ul className="text-[11px] text-amber-900/70 space-y-2 list-none font-semibold leading-relaxed">
                      <li>1. Buka <strong>Google Maps</strong>, cari lokasi Anda.</li>
                      <li>2. <strong>Klik Kanan</strong> atau <strong>Tahan Lama</strong> di peta.</li>
                      <li>3. Angka akan muncul, <strong>Klik pada angka</strong> untuk copy.</li>
                      <li>4. <strong>Paste</strong> pada kotak biru di atas (Cukup sekali paste).</li>
                    </ul>
                    <a 
                      href="https://www.google.com/maps" target="_blank" rel="noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-white border border-amber-400 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-all"
                    >
                      Buka Google Maps <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              ) : (
                /* --- KHUSUS PANEL --- */
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase">Jenis Tanaman</label>
                  <input 
                    type="text" placeholder="Contoh: Bawang Merah"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all font-medium"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer (Sticky Bottom) */}
            <div className="p-8 flex gap-4 mt-4 bg-white rounded-b-[2.5rem] shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                onClick={handleAddLocation}
                className="flex-1 px-6 py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 shadow-xl shadow-teal-500/20 transition-all active:scale-95 flex items-center justify-center"
              >
                Simpan Lokasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}