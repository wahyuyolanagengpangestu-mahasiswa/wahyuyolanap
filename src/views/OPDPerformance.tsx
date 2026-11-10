import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Award, 
  Smile, 
  AlertCircle, 
  TrendingUp
} from 'lucide-react';

export const OPDPerformance: React.FC = () => {
  const { opdPerformance } = useApp();

  return (
    <div className="space-y-6">
      {/* Header Overview Card */}
      <div className="bg-white rounded-xl p-5 border border-surface-container shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-navy text-teal-container">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-headline font-bold text-navy text-[17px]">
                Leaderboard & Evaluasi Kinerja OPD Kota Bandar Lampung
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal border border-teal-200">
                AUDIT Q4 2026
              </span>
            </div>
            <p className="text-[12px] text-brandText-secondary mt-0.5">
              Tolok ukur transparansi kecepatan respon (MTTA), durasi penyelesaian (MTTR), dan kepuasan warga (CSAT).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[12px]">
          <div className="px-3.5 py-2 bg-surface-low rounded-lg border border-surface-container">
            <span className="text-brandText-muted block text-[10px] uppercase font-mono">Standar Kepatuhan:</span>
            <span className="font-bold text-navy text-[13px]">&gt;= 90% Tepat SLA</span>
          </div>
          <div className="px-3.5 py-2 bg-surface-low rounded-lg border border-surface-container">
            <span className="text-brandText-muted block text-[10px] uppercase font-mono">Target CSAT Warga:</span>
            <span className="font-bold text-teal text-[13px]">&gt; 85% Puas</span>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-white rounded-xl border border-surface-container shadow-xs overflow-hidden">
        <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-low/50">
          <h3 className="font-headline font-bold text-navy text-[15px] flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal" />
            <span>Peringkat Kepatuhan SLA Antar-Organisasi Perangkat Daerah</span>
          </h3>
          <span className="text-[11px] font-mono text-brandText-muted">Urutan Berdasarkan Persentase Kepatuhan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface-low border-b border-surface-container text-[11px] font-bold text-brandText-muted uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Peringkat & OPD</th>
                <th className="py-3 px-4 text-center">Total Tiket</th>
                <th className="py-3 px-4 text-center">Tepat Waktu</th>
                <th className="py-3 px-4 text-center">Breach / Overdue</th>
                <th className="py-3 px-4">Rerata MTTA</th>
                <th className="py-3 px-4">Rerata MTTR</th>
                <th className="py-3 px-4 text-center">Indeks CSAT</th>
                <th className="py-3 px-4">Kepatuhan SLA</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {opdPerformance.map((opd, index) => {
                const isTop1 = index === 0;

                return (
                  <tr key={opd.id} className="hover:bg-surface-low/60 transition-colors">
                    {/* Rank & Name */}
                    <td className="py-4 px-4 font-medium text-navy">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                          isTop1 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-navy flex items-center space-x-1.5">
                            <span>{opd.name}</span>
                            {isTop1 && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-mono font-bold">
                                TOP 1
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-brandText-muted">
                            Kode: {opd.code} • {opd.activeStaff} Petugas Aktif
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Total Tickets */}
                    <td className="py-4 px-4 text-center font-mono font-semibold text-navy">
                      {opd.totalTickets}
                    </td>

                    {/* Resolved On Time */}
                    <td className="py-4 px-4 text-center font-mono font-semibold text-emerald-700">
                      {opd.resolvedOnTime}
                    </td>

                    {/* Overdue */}
                    <td className="py-4 px-4 text-center font-mono font-semibold text-error">
                      {opd.overdueBreach}
                    </td>

                    {/* MTTA */}
                    <td className="py-4 px-4 font-mono text-navy">
                      <div className="font-bold">{opd.mttaAvgMin} Mnt</div>
                      <div className="text-[10px] text-brandText-muted">Target &lt; 30 Mnt</div>
                    </td>

                    {/* MTTR */}
                    <td className="py-4 px-4 font-mono text-navy">
                      <div className="font-bold">{opd.mttrAvgHours} Jam</div>
                      <div className="text-[10px] text-brandText-muted">Sesuai Matriks</div>
                    </td>

                    {/* CSAT */}
                    <td className="py-4 px-4 text-center font-mono font-bold text-teal">
                      <div className="flex items-center justify-center space-x-1">
                        <Smile className="w-3.5 h-3.5 text-teal" />
                        <span>{opd.csatScore}%</span>
                      </div>
                    </td>

                    {/* Compliance Progress Bar */}
                    <td className="py-4 px-4 min-w-[140px]">
                      <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                        <span className="font-bold text-navy">{opd.complianceRate}%</span>
                        <span className="text-brandText-muted">{opd.complianceRate >= 90 ? 'Lolos' : 'Defisit'}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            opd.complianceRate >= 95 ? 'bg-emerald-600' :
                            opd.complianceRate >= 90 ? 'bg-teal' : 'bg-amber-500'
                          }`}
                          style={{ width: `${opd.complianceRate}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        opd.status === 'Sangat Baik'
                          ? 'bg-emerald-100 text-emerald-800'
                          : opd.status === 'Memenuhi Target'
                          ? 'bg-teal-50 text-teal border border-teal-200'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {opd.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Analytic Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-surface-container shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-navy font-bold text-[14px]">
            <TrendingUp className="w-4 h-4 text-teal" />
            <span>Kinerja Tercepat: BPBD / TRC</span>
          </div>
          <p className="text-[12px] text-brandText-secondary leading-relaxed">
            Tim Reaksi Cepat BPBD Kota Bandar Lampung mencatat respons rata-rata <strong>11.4 menit</strong> untuk insiden P0 (pohon tumbang dan kabel putus), melampaui target awal 15 menit.
          </p>
          <div className="p-3 bg-surface-low rounded-lg font-mono text-[11px] text-navy">
            Kepatuhan SLA: 97.8% • CSAT: 94.6%
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-surface-container shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-navy font-bold text-[14px]">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Beban Tertinggi: Dinas PUPR</span>
          </div>
          <p className="text-[12px] text-brandText-secondary leading-relaxed">
            Menangani <strong>384 tiket</strong> terkait perbaikan jalan berlubang dan sedimentasi drainase, dengan tingkat penyelesaian tepat waktu mencapai 91.4%.
          </p>
          <div className="p-3 bg-surface-low rounded-lg font-mono text-[11px] text-navy">
            68 Petugas Lapangan • 351 Tiket Selesai
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-surface-container shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-navy font-bold text-[14px]">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Fokus Evaluasi: Dinas Lingkungan Hidup</span>
          </div>
          <p className="text-[12px] text-brandText-secondary leading-relaxed">
            Persentase kepatuhan berada di angka <strong>87.0%</strong> (di bawah standar 90%) akibat kendala armada dumptruck pada pengangkutan tumpukan sampah liar di Way Halim.
          </p>
          <div className="p-3 bg-amber-50 rounded-lg font-mono text-[11px] text-amber-800">
            Rekomendasi: Penambahan 2 unit armada pengangkut
          </div>
        </div>
      </div>
    </div>
  );
};
