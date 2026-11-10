import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Flame
} from 'lucide-react';

export const TicketStream: React.FC = () => {
  const { tickets, setSelectedTicket, escalateTicket, updateTicketStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOpd, setSelectedOpd] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filtered tickets
  const filtered = tickets.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.locationName.toLowerCase().includes(q) ||
        t.citizenName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedOpd !== 'ALL' && t.opd !== selectedOpd) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    if (selectedStatus === 'ACTIVE' && t.status === 'SELESAI') return false;
    if (selectedStatus === 'ESCALATED' && !t.isEscalated) return false;
    if (selectedStatus === 'COMPLETED' && t.status !== 'SELESAI') return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Search & Multi-filter Controls */}
      <div className="bg-white rounded-xl p-4 border border-surface-container shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID tiket, lokasi, kategori, atau nama warga..."
              className="w-full pl-10 pr-4 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:outline-hidden"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-[12px]">
            {/* OPD Filter */}
            <select
              value={selectedOpd}
              onChange={(e) => setSelectedOpd(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-navy font-medium focus:ring-2 focus:ring-teal focus:outline-hidden"
            >
              <option value="ALL">Semua Dinas (OPD)</option>
              <option value="Dinas PUPR">Dinas PUPR</option>
              <option value="Dinas Perhubungan">Dinas Perhubungan</option>
              <option value="Dinas Lingkungan Hidup">Dinas Lingkungan Hidup</option>
              <option value="BPBD / TRC Kota">BPBD / TRC Kota</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-navy font-medium focus:ring-2 focus:ring-teal focus:outline-hidden"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="P0">P0 - Emergency (&lt; 4 Jam)</option>
              <option value="P1">P1 - High (&lt; 24 Jam)</option>
              <option value="P2">P2 - Medium (&lt; 48 Jam)</option>
              <option value="P3">P3 - Low (&lt; 7 Hari)</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-navy font-medium focus:ring-2 focus:ring-teal focus:outline-hidden"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Aktif Belum Selesai</option>
              <option value="ESCALATED">Ter-Eskalasi Kadis</option>
              <option value="COMPLETED">Selesai</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-brandText-muted pt-2 border-t border-gray-100">
          <span>Menampilkan <strong>{filtered.length}</strong> dari {tickets.length} total tiket aduan</span>
          <span>Engine: Tokio Async Real-time Ticking</span>
        </div>
      </div>

      {/* Stream List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-brandText-muted border border-surface-container">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-teal" />
            <h4 className="font-semibold text-[15px] text-navy">Tidak ada tiket yang cocok dengan filter.</h4>
            <p className="text-[12px] mt-1">Cobalah mengatur ulang pencarian atau opsi filter Anda.</p>
          </div>
        ) : (
          filtered.map((ticket) => {
            const isCompleted = ticket.status === 'SELESAI';
            const isEscalated = ticket.status === 'ESKALASI_KADIS' || ticket.isEscalated;
            const remainingSecs = Math.max(0, ticket.totalSlaSeconds - ticket.elapsedSeconds);
            const remHours = Math.floor(remainingSecs / 3600);
            const remMinutes = Math.floor((remainingSecs % 3600) / 60);
            const remSeconds = remainingSecs % 60;
            const timerString = `${String(remHours).padStart(2, '0')}:${String(remMinutes).padStart(2, '0')}:${String(remSeconds).padStart(2, '0')}`;
            const elapsedRatio = Math.min(100, Math.round((ticket.elapsedSeconds / ticket.totalSlaSeconds) * 100));

            // Determine border color
            let borderColorClass = 'border-l-slate-400';
            if (isCompleted) borderColorClass = 'border-l-emerald-600';
            else if (ticket.priority === 'P0') borderColorClass = 'border-l-error';
            else if (ticket.priority === 'P1') borderColorClass = 'border-l-amber-500';
            else if (ticket.priority === 'P2') borderColorClass = 'border-l-blue-600';

            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-xl p-4 sm:p-5 border border-surface-container border-l-4 ${borderColorClass} shadow-xs hover:shadow-md transition-all duration-150`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority badge */}
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider ${
                        ticket.priority === 'P0' ? 'bg-error text-white' :
                        ticket.priority === 'P1' ? 'bg-amber-500 text-white' :
                        ticket.priority === 'P2' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
                      }`}>
                        {ticket.priority} {ticket.priority === 'P0' ? 'CRITICAL' : ''}
                      </span>

                      {/* Ticket ID */}
                      <span className="font-mono text-[12px] font-extrabold text-navy">
                        #{ticket.id}
                      </span>

                      {/* Status */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' :
                        isEscalated ? 'bg-error-container text-error animate-pulse' :
                        'bg-surface-container text-navy'
                      }`}>
                        {ticket.status}
                      </span>

                      {ticket.duplicateCount ? (
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-mono font-semibold border border-purple-200">
                          {ticket.duplicateCount} Aduan Teragregasi (PostGIS 15m)
                        </span>
                      ) : null}
                    </div>

                    {/* Title */}
                    <h3 className="font-headline font-bold text-navy text-[15px] sm:text-[16px]">
                      {ticket.title}
                    </h3>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[12px] text-brandText-secondary">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-teal" />
                        {ticket.locationName} ({ticket.district})
                      </span>
                      <span>•</span>
                      <span className="font-medium text-navy">{ticket.opd}</span>
                      <span>•</span>
                      <span className="text-brandText-muted">Tim: {ticket.assignedTeam || 'Antrean Penugasan'}</span>
                    </div>
                  </div>

                  {/* Right: SLA Countdown & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-64 gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    {/* Countdown Box */}
                    <div className="text-left lg:text-right w-full">
                      <div className="text-[10px] font-bold font-mono text-brandText-muted uppercase">
                        {isCompleted ? 'Status Penanganan' : 'Sisa Durasi SLA (Hitung Mundur):'}
                      </div>
                      <div className={`font-mono text-[18px] sm:text-[20px] font-black tracking-tight ${
                        isCompleted ? 'text-emerald-700' :
                        isEscalated ? 'text-error animate-pulse' :
                        elapsedRatio > 50 ? 'text-amber-600' : 'text-teal'
                      }`}>
                        {isCompleted ? 'SELESAI (VERIFIED)' : timerString}
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-600' :
                            isEscalated ? 'bg-error' :
                            elapsedRatio > 50 ? 'bg-amber-500' : 'bg-teal'
                          }`}
                          style={{ width: `${isCompleted ? 100 : elapsedRatio}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] font-mono text-brandText-muted mt-0.5">
                        Target MTTR: {ticket.mttrTargetHours} Jam ({elapsedRatio}% waktu terpakai)
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 w-full lg:justify-end">
                      {!isEscalated && !isCompleted && (
                        <button
                          onClick={() => escalateTicket(ticket.id)}
                          title="Eskalasikan ke Kepala Dinas"
                          className="p-1.5 rounded-lg text-error hover:bg-red-50 border border-red-200 transition-colors"
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                      )}

                      {!isCompleted && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'SELESAI')}
                          title="Tandai Selesai"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold text-[11px] flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Selesai</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="px-3 py-1.5 rounded-lg bg-navy text-white hover:bg-navy-container font-semibold text-[12px] flex items-center space-x-1 shadow-xs"
                      >
                        <span>Detail</span>
                        <ChevronRight className="w-3.5 h-3.5 text-teal-container" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
