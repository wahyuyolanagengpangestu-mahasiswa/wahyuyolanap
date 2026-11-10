import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Download,
  Search,
  Lock,
  CheckCircle2,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        log.txHash.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.ticketId.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roleFilter !== 'ALL' && log.role !== roleFilter) return false;
    return true;
  });

  const handleDownload = (format: string) => {
    setDownloadSuccessToast(`Laporan format ${format} berhasil di-generate dengan tanda tangan digital SHA-256.`);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-[13px] flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{downloadSuccessToast}</span>
          </div>
          <button onClick={() => setDownloadSuccessToast(null)} className="text-xs font-bold underline">
            Tutup
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-xl p-5 border border-surface-container shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-navy text-teal-container">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-headline font-bold text-navy text-[17px]">
                Audit Trail & Integritas Tata Kelola SLA
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                IMMUTABLE AUDIT LOG
              </span>
            </div>
            <p className="text-[12px] text-brandText-secondary mt-0.5">
              Pencatatan kriptografis setiap aktivitas pergeseran status tiket, intervensi operator, dan eskalasi otomatis.
            </p>
          </div>
        </div>

        {/* Quick Export Actions */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => handleDownload('PDF')}
            className="flex-1 md:flex-none px-3.5 py-2 bg-navy text-white text-[12px] font-semibold rounded-lg hover:bg-navy-container transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-container" />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={() => handleDownload('CSV')}
            className="flex-1 md:flex-none px-3.5 py-2 bg-surface-low border border-surface-container text-navy text-[12px] font-semibold rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => handleDownload('JSON')}
            className="flex-1 md:flex-none px-3.5 py-2 bg-surface-low border border-surface-container text-navy text-[12px] font-semibold rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center space-x-1.5"
          >
            <FileCode className="w-4 h-4 text-teal" />
            <span>JSON API</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-surface-container shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari hash transaksi, ID tiket, aktor, atau pesan log..."
            className="w-full pl-10 pr-4 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto text-[12px]">
          <span className="text-brandText-muted font-bold uppercase text-[11px]">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-navy font-medium focus:ring-2 focus:ring-teal focus:outline-hidden"
          >
            <option value="ALL">Semua Peran Aktor</option>
            <option value="Sistem AI">Sistem AI (Tokio & PostGIS)</option>
            <option value="Operator Dispatcher">Operator Dispatcher</option>
            <option value="Tim TRC Lapangan">Tim TRC Lapangan</option>
            <option value="Warga (Pelapor)">Warga (Pelapor)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-surface-container shadow-xs overflow-hidden">
        <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-low/50">
          <h3 className="font-headline font-bold text-navy text-[15px] flex items-center space-x-2">
            <Lock className="w-4 h-4 text-teal" />
            <span>Riwayat Transaksi & Audit Log (SHA-256 Digest)</span>
          </h3>
          <span className="text-[11px] font-mono text-brandText-muted">Total {filteredLogs.length} Entri</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead className="bg-surface-low border-b border-surface-container text-[11px] font-bold text-brandText-muted uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">SHA-256 Checksum Hash</th>
                <th className="py-3 px-4">Aktor / Entitas</th>
                <th className="py-3 px-4">Tindakan / Mutasi Status</th>
                <th className="py-3 px-4">Ref. Tiket</th>
                <th className="py-3 px-4 text-center">Status Integritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredLogs.map((log) => {
                const isAlert = log.status === 'PERINGATAN';
                return (
                  <tr key={log.id} className="hover:bg-surface-low/60 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-navy font-semibold whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    {/* Hash */}
                    <td className="py-3.5 px-4 font-mono text-brandText-muted text-[11px]">
                      <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {log.txHash.substring(0, 14)}...
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-navy">{log.actor}</div>
                      <div className="text-[10px] text-teal font-mono font-medium">{log.role}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-brandText-secondary leading-snug max-w-md">
                      {log.action}
                    </td>

                    {/* Ref Ticket */}
                    <td className="py-3.5 px-4 font-mono font-bold text-navy whitespace-nowrap">
                      #{log.ticketId}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isAlert
                          ? 'bg-red-100 text-error border border-red-200'
                          : log.status === 'OTOMATIS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
