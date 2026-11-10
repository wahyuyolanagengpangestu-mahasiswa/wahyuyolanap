import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Database, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  const { notifications, isNotificationDrawerOpen, setIsNotificationDrawerOpen, setIsNewTicketModalOpen } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: HH:mm:ss WIB | DD MMMM YYYY
      const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
      const dateStr = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      setCurrentTime(`${timeStr} WIB | ${dateStr}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => n.type === 'critical').length;

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-md border-b border-surface-container z-40 px-6 flex items-center justify-between shadow-xs">
      {/* Left: Co-Branding Pemkot + Teknokrat */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          {/* Logo Pemkot Bandar Lampung Emblem */}
          <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center text-white shadow-xs" title="Pemerintah Kota Bandar Lampung">
            <span className="material-symbols-outlined text-[24px] text-teal-container">apartment</span>
          </div>

          <span className="text-gray-400 font-bold text-lg select-none">+</span>

          {/* Logo Universitas Teknokrat Indonesia (UTI) Emblem */}
          <div className="w-10 h-10 rounded-lg bg-red-700 flex items-center justify-center text-white shadow-xs" title="Universitas Teknokrat Indonesia">
            <span className="material-symbols-outlined text-[24px] text-yellow-300">school</span>
          </div>
        </div>

        <div className="border-l border-gray-200 pl-3.5">
          <div className="flex items-center space-x-2">
            <span className="font-headline font-extrabold text-[16px] tracking-wide text-navy uppercase">
              SLA Tracker Smart City
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider bg-teal-50 text-teal border border-teal-200">
              KOTA BANDAR LAMPUNG
            </span>
          </div>
          <p className="text-[11px] text-brandText-secondary font-medium">
            Pusat Komando & Pemantauan Pengaduan Fasilitas Umum Terpadu
          </p>
        </div>
      </div>

      {/* Middle & Right: System Telemetry, WIB Clock, Notif, Profile */}
      <div className="flex items-center space-x-5">
        {/* Telemetry Status Badges */}
        <div className="hidden xl:flex items-center space-x-3 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>Rust Axum Async: <strong>ONLINE</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>PostGIS: <strong>CONNECTED (15m ST_DWithin)</strong></span>
          </div>
        </div>

        {/* Real-time WIB Clock */}
        <div className="hidden md:flex flex-col items-end px-3 py-1 bg-surface-low rounded-lg border border-surface-container">
          <span className="text-[10px] font-medium text-brandText-muted uppercase tracking-wider">
            Waktu Operasional Server
          </span>
          <span className="font-mono text-[12px] font-semibold text-navy tracking-tight">
            {currentTime || '16:00:00 WIB | 10 November 2026'}
          </span>
        </div>

        {/* Tombol Buat Aduan Cepat */}
        <button
          onClick={() => setIsNewTicketModalOpen(true)}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-navy text-white text-[13px] font-semibold hover:bg-navy-container transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span className="hidden sm:inline">Input Aduan Baru</span>
        </button>

        {/* Notification Bell Button */}
        <button
          onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
          className="relative p-2 rounded-lg text-brandText-secondary hover:text-navy hover:bg-surface-low transition-colors"
          title="Notifikasi & Peringatan Eskalasi"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Operator Profile */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-navy-container text-white flex items-center justify-center font-bold text-xs">
            WH
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-[12px] font-semibold text-brandText-main leading-none">
              Wahyu Yolan Ageng Pangestu
            </div>
            <div className="text-[10px] font-mono text-brandText-muted mt-1">
              Lead Dispatcher • UTI & Pemkot
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
