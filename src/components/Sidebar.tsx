import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  MapPin, 
  Activity, 
  Building2, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, tickets } = useApp();

  const totalActive = tickets.filter(t => t.status !== 'SELESAI').length;
  const criticalP0 = tickets.filter(t => t.priority === 'P0' && t.status !== 'SELESAI').length;
  const escalatedCount = tickets.filter(t => t.status === 'ESKALASI_KADIS').length;
  const completedCount = tickets.filter(t => t.status === 'SELESAI').length;

  // Calculate current SLA Health
  const totalTickets = tickets.length;
  const compliantTickets = tickets.filter(t => !t.isEscalated).length;
  const complianceRate = totalTickets > 0 ? Math.round((compliantTickets / totalTickets) * 100) : 92;

  interface NavItem {
    id: 'dashboard' | 'gis' | 'stream' | 'opd' | 'audit';
    label: string;
    icon: React.ElementType;
    badge: string | null;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Eksekutif',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'gis',
      label: 'Peta Spasial PostGIS',
      icon: MapPin,
      badge: `${totalActive} Insiden`
    },
    {
      id: 'stream',
      label: 'Stream Tiket & SLA',
      icon: Activity,
      badge: criticalP0 > 0 ? `${criticalP0} P0` : null,
      badgeColor: 'bg-error text-white'
    },
    {
      id: 'opd',
      label: 'Kinerja OPD',
      icon: Building2,
      badge: '4 Dinas'
    },
    {
      id: 'audit',
      label: 'Laporan & Audit',
      icon: FileText,
      badge: null
    }
  ];

  return (
    <aside className="fixed top-20 left-0 bottom-0 w-64 bg-white border-r border-surface-container z-30 flex flex-col justify-between select-none">
      {/* Navigation Links */}
      <div className="p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-brandText-muted uppercase">
          Menu Operasional
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-brandText-secondary hover:bg-surface-low hover:text-navy'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-container' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    item.badgeColor
                      ? item.badgeColor
                      : isActive
                      ? 'bg-navy-container text-white'
                      : 'bg-surface-container text-brandText-secondary'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Status Alerts Summary Box */}
        <div className="mt-6 pt-5 border-t border-surface-container">
          <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-brandText-muted uppercase">
            Ringkasan Status Tiket
          </div>

          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-low text-[12px]">
              <span className="flex items-center text-error font-medium">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Eskalasi Kadis
              </span>
              <span className="font-mono font-bold text-error bg-error-container px-2 py-0.5 rounded text-[11px]">
                {escalatedCount} Tiket
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-low text-[12px]">
              <span className="flex items-center text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Tiket Selesai
              </span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                {completedCount} Selesai
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Health Bar: SLA System Health */}
      <div className="p-4 border-t border-surface-container bg-surface-low/60">
        <div className="flex items-center justify-between mb-1.5 text-[12px]">
          <span className="font-semibold text-navy flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-teal" />
            SLA System Health
          </span>
          <span className={`font-mono font-bold text-[12px] ${complianceRate >= 90 ? 'text-teal' : 'text-amber-700'}`}>
            {complianceRate}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              complianceRate >= 90 ? 'bg-teal' : 'bg-amber-500'
            }`}
            style={{ width: `${complianceRate}%` }}
          ></div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-brandText-muted font-mono">
          <span>Target: &gt;= 90%</span>
          <span>Status: {complianceRate >= 90 ? 'OPTIMAL' : 'PERHATIAN'}</span>
        </div>
      </div>
    </aside>
  );
};
