import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { LandId } from '../../types';

const LANDS: { id: LandId; label: string; area: string; crop: string }[] = [
  { id: 'lahan1', label: 'Lahan 1', area: '0.5 Ha', crop: 'Bawang Merah' },
  { id: 'lahan2', label: 'Lahan 2', area: '0.8 Ha', crop: 'Bawang Merah' },
  { id: 'lahan3', label: 'Lahan 3', area: '1.2 Ha', crop: 'Bawang Putih' },
];

interface LandSelectorProps {
  selectedLand: LandId;
  onSelect: (land: LandId) => void;
}

export default function LandSelector({ selectedLand, onSelect }: LandSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = LANDS.find(l => l.id === selectedLand) ?? LANDS[0];

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
        className="flex items-center gap-2.5 bg-white border border-gray-200 hover:border-teal-400 rounded-xl px-4 py-2.5 transition-all duration-200 shadow-sm"
      >
        <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-teal-600" />
        </div>
        <div className="text-left">
          <p className="text-xs text-gray-400 leading-none">Pilih Lahan</p>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">{selected.label} — {selected.crop}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pilih Lahan Aktif</p>
          </div>
          {LANDS.map(land => (
            <button
              key={land.id}
              onClick={() => { onSelect(land.id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                selectedLand === land.id ? 'bg-teal-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                selectedLand === land.id ? 'bg-teal-500' : 'bg-gray-100'
              }`}>
                <MapPin className={`w-4 h-4 ${selectedLand === land.id ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${selectedLand === land.id ? 'text-teal-700' : 'text-gray-700'}`}>
                  {land.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{land.crop} • {land.area}</p>
              </div>
              {selectedLand === land.id && (
                <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
