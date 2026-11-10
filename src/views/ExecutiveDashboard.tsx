import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Zap, 
  ArrowUpRight,
  PlusCircle,
  Truck
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { tickets, opdPerformance, setActiveTab, setIsNewTicketModalOpen, setSelectedTicket } = useApp();

  const totalActive = tickets.filter(t => t.status !== 'SELESAI').length;
  const criticalP0 = tickets.filter(t => t.priority === 'P0' && t.status !== 'SELESAI').length;
  const escalatedTickets = tickets.filter(t => t.isEscalated && t.status !== 'SELESAI');
  
  // Calculate average MTTA and MTTR from OPD performance
  const avgMtta = (opdPerformance.reduce((acc, curr) => acc + curr.mttaAvgMin, 0) / opdPerformance.length).toFixed(1);
  const avgMttr = (opdPerformance.reduce((acc, curr) => acc + curr.mttrAvgHours, 0) / opdPerformance.length).toFixed(1);
  
  // Compliance
  const compliantCount = tickets.filter(t => !t.isEscalated).length;
  const complianceRate = Math.round((compliantCount / tickets.length) * 100);

  // Category counts
  const categoriesCount = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Top Status Command Strip */}
      <div className="bg-white rounded-xl p-4 border border-surface-container shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal border border-teal-200">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-headline font-bold text-navy text-[16px]">
                Command Center Operasional Bandar Lampung
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-[12px] text-brandText-secondary mt-0.5">
              Pemantauan real-time kepatuhan Service Level Agreement (SLA) & routing terintegrasi.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-surface-low rounded-lg border border-surface-container text-[12px]">
            <Truck className="w-4 h-4 text-navy" />
            <span className="text-brandText-secondary">Armada Standby:</span>
            <span className="font-mono font-bold text-navy">24 Regu Cepat</span>
          </div>

          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-4 py-2 bg-navy text-white text-[13px] font-semibold rounded-lg hover:bg-navy-container transition-colors flex items-center space-x-2 shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-teal-container" />
            <span>Buat Aduan Darurat</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Aduan */}
        <div className="bg-white p-5 rounded-xl border border-surface-container shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-brandText-muted uppercase">
              Total Aduan Aktif
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-headline font-extrabold text-[32px] text-navy">
              {totalActive}
            </span>
            <span className="text-[12px] text-brandText-secondary font-medium">
              / {tickets.length} total tiket
            </span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-700 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>82% Deduplikasi Otomatis PostGIS</span>
          </div>
        </div>

        {/* KPI 2: MTTA */}
        <div className="bg-white p-5 rounded-xl border border-surface-container shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-brandText-muted uppercase">
              Rerata MTTA (Respon)
            </span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-headline font-extrabold text-[32px] text-teal">
              {avgMtta}
            </span>
            <span className="text-[14px] font-mono text-teal font-bold">Menit</span>
          </div>
          <div className="mt-2 text-[11px] text-brandText-muted">
            Target SLA: <strong>&lt; 30 Menit</strong> (Baseline: 24 Jam)
          </div>
        </div>

        {/* KPI 3: MTTR */}
        <div className="bg-white p-5 rounded-xl border border-surface-container shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-brandText-muted uppercase">
              Rerata MTTR (Selesai)
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="font-headline font-extrabold text-[32px] text-navy">
              {avgMttr}
            </span>
            <span className="text-[14px] font-mono text-navy font-bold">Jam</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
            Penyelesaian Matriks SLA: 4 Jam – 3 Hari
          </div>
        </div>

        {/* KPI 4: Kepatuhan SLA */}
        <div className="bg-white p-5 rounded-xl border border-surface-container shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-brandText-muted uppercase">
              Kepatuhan SLA Global
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`font-headline font-extrabold text-[32px] ${complianceRate >= 90 ? 'text-teal' : 'text-amber-600'}`}>
              {complianceRate}%
            </span>
            <span className="text-[12px] font-mono font-bold text-brandText-muted">
              (Target &gt;= 90%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-brandText-secondary">
            CSAT Warga: <strong>91.4% Puas</strong> (Target &gt; 85%)
          </div>
        </div>
      </div>

      {/* Grid: Early Warning Escalation Widget & Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Early Warning Escalation Widget (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-md bg-red-100 text-error">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="font-headline font-bold text-navy text-[15px]">
                Peringatan Dini & Tiket Kritis (SLA &lt; 20% & Prioritas P0)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('stream')}
              className="text-[12px] font-semibold text-teal hover:underline flex items-center"
            >
              Buka Stream Lengkap →
            </button>
          </div>

          <div className="space-y-3">
            {escalatedTickets.length === 0 && criticalP0 === 0 ? (
              <div className="p-6 text-center text-brandText-muted text-[13px] bg-surface-low rounded-lg">
                Tidak ada tiket yang terancam melanggar batas SLA saat ini.
              </div>
            ) : (
              tickets
                .filter(t => (t.isEscalated || t.priority === 'P0') && t.status !== 'SELESAI')
                .map((ticket) => {
                  const remSecs = Math.max(0, ticket.totalSlaSeconds - ticket.elapsedSeconds);
                  const remMins = Math.floor(remSecs / 60);

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-xs flex items-center justify-between ${
                        ticket.priority === 'P0'
                          ? 'bg-red-50/70 border-red-200 hover:border-red-400'
                          : 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                          ticket.priority === 'P0' ? 'bg-error text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {ticket.priority}
                        </span>
                        <div>
                          <div className="font-semibold text-navy text-[13px] hover:text-teal">
                            #{ticket.id} - {ticket.title}
                          </div>
                          <div className="text-[11px] text-brandText-muted mt-0.5 flex items-center space-x-2">
                            <span>{ticket.locationName}</span>
                            <span>•</span>
                            <span className="font-medium text-navy">{ticket.opd}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <div className="text-[10px] font-mono font-bold uppercase text-error">
                          {ticket.status}
                        </div>
                        <div className="font-mono text-[13px] font-bold text-navy">
                          {remMins > 0 ? `${remMins} mnt tersisa` : 'OVERDUE'}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Categories Breakdown (1 Column) */}
        <div className="bg-white rounded-xl p-5 border border-surface-container shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-navy text-[15px]">
              Distribusi Kategori Aduan
            </h3>
            <span className="text-[11px] font-mono text-brandText-muted">Real-Time</span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoriesCount).map(([catName, count]) => {
              const pct = Math.round((count / tickets.length) * 100);
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-brandText-main font-medium">{catName}</span>
                    <span className="font-mono text-navy font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-navy h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-surface-container">
            <button
              onClick={() => setActiveTab('gis')}
              className="w-full py-2 bg-surface-low border border-surface-container text-navy hover:bg-surface-container rounded-lg text-[12px] font-semibold transition-colors flex items-center justify-center space-x-1.5"
            >
              <MapPin className="w-4 h-4 text-teal" />
              <span>Lihat Heatmap & Peta Spasial PostGIS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
