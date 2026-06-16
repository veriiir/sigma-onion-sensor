import React from 'react';
import { MapPin, ChevronDown, Plus, Check } from 'lucide-react';
import { LandId, SystemType, Land } from '../../types';
import { useLands } from '../../hooks/useLands';
import LandAddModal from './LandAddModal';

interface LandSelectorProps {
  selectedLand: LandId;
  onSelect: (land: LandId) => void;
  systemType: SystemType;
}

export default function LandSelector({ selectedLand, onSelect, systemType }: LandSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const { lands, refetch } = useLands();
  
  const ref = React.useRef<HTMLDivElement>(null);
  const isPortable = systemType === 'portable';

  // --- FILTER & PILIH DATA ---
  const currentViewLands = lands.filter(l => l.system_type === systemType);
  const selected = currentViewLands.find(l => l.id === selectedLand) || currentViewLands[0];

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 bg-white border border-gray-200 hover:border-primary rounded-xl px-4 py-2.5 transition-all duration-200 shadow-sm"
      >
        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-primary" />
        </div>
        <div className="text-left shrink-0">
          <p className="text-xs text-gray-400 leading-none">{isPortable ? 'Pilih Lokasi' : 'Pilih Lahan'}</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate max-w-[130px]">
            {selected ? selected.label : (isPortable ? 'Tidak ada lokasi' : 'Tidak ada lahan')}
          </p>
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-400 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-black/5 py-3 z-50 animate-in slide-in-from-top-2 origin-top-right">
          <div className="px-4 py-2 border-b border-gray-100 mb-1 flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{isPortable ? 'Daftar Lokasi' : 'Daftar Lahan'}</p>
            <button onClick={() => { setShowAddModal(true); setOpen(false); }} className="p-1 hover:bg-primary/10 rounded-lg text-primary transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {currentViewLands.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Belum ada {isPortable ? 'lokasi' : 'lahan'} tersimpan</p>
            ) : (
              currentViewLands.map(land => (
                <button
                  key={land.id}
                  onClick={() => { onSelect(land.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${selectedLand === land.id ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${selectedLand === land.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-bold ${selectedLand === land.id ? 'text-primary' : 'text-gray-700'}`}>{land.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{isPortable ? 'Portable' : `${land.crop} ${land.area ? `• ${land.area}` : ''}`}</p>
                  </div>
                  {selectedLand === land.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <LandAddModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={(newLand) => {
          refetch();
          onSelect(newLand.id);
        }} 
        systemType={systemType} 
      />
    </div>
  );
}

