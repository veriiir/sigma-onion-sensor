import React, { createContext, useContext, useState } from 'react';
import { SystemType, LandId, ActivePage } from '../types';

interface AppContextType {
  activeMode: SystemType;
  setActiveMode: (mode: SystemType) => void;
  selectedLand: LandId;
  setSelectedLand: (land: LandId) => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeMode, setActiveMode] = useState<SystemType>('portable');
  const [selectedLand, setSelectedLand] = useState<LandId>('lahan1');
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AppContext.Provider value={{
      activeMode, setActiveMode,
      selectedLand, setSelectedLand,
      activePage, setActivePage,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within AppProvider');
  return context;
}
