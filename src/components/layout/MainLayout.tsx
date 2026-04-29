import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    /* REVISI: Mengubah bg-gray-50 (abu-abu standard) menjadi warna Krem Hangat #FBF9F4 
       untuk memberikan kesan organik 'Vivid Earth' sesuai gambar referensi Anda */
    <div className="min-h-screen bg-[#FBF9F4]">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header />
        {/* REVISI: Main container juga memastikan latar belakangnya serasi dengan body */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-auto bg-[#FBF9F4]">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}