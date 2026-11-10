import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-6 border-t border-surface-container bg-white text-center select-none text-[12px] text-brandText-secondary">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-[11px] font-mono text-brandText-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SLA Tracker Bandar Lampung v1.0 • UTS Edition</span>
        </div>

        <div className="font-medium text-navy text-center">
          Copyright © 2026 by Wahyu Yolan Ageng Pangestu dan Dr. Erliyan Redy Susanto, M.Kom
        </div>

        <div className="text-[11px] text-brandText-muted">
          Informatika • Universitas Teknokrat Indonesia
        </div>
      </div>
    </footer>
  );
};

