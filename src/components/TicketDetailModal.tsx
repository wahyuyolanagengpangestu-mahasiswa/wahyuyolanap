import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Clock, MapPin, AlertTriangle, CheckCircle, ShieldCheck, User, RefreshCw, Camera, Check } from 'lucide-react';
import { OPDName } from '../types';

export const TicketDetailModal: React.FC = () => {
  const { selectedTicket, setSelectedTicket, escalateTicket, updateTicketStatus, redispatchTicket } = useApp();
  const [redispatchOpd, setRedispatchOpd] = useState<OPDName>('Dinas PUPR');
  const [redispatchTeam, setRedispatchTeam] = useState('Unit Reaksi Cepat 01');
  const [showRedispatchForm, setShowRedispatchForm] = useState(false);

  // Field Officer Resolution Form State (Skenario 5)
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [photoAfterUrl, setPhotoAfterUrl] = useState(
    'https://images.unsplash.com/photo-1578961952402-f8432a5d83bb?auto=format&fit=crop&w=600&q=80'
  );
  const [completionNotes, setCompletionNotes] = useState(
    'Perbaikan fisik selesai diverifikasi di lapangan. Aspal hotmix telah dipadatkan dan rambu keselamatan terpasang.'
  );

  if (!selectedTicket) return null;

  const remainingSeconds = Math.max(0, selectedTicket.totalSlaSeconds - selectedTicket.elapsedSeconds);
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
  const remainingSecs = remainingSeconds % 60;

  const isEscalated = selectedTicket.status === 'ESKALASI_KADIS' || selectedTicket.isEscalated;
  const isCompleted = selectedTicket.status === 'SELESAI';

  // Format timer string HH:MM:SS
  const timerDisplay = `${String(remainingHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  const elapsedPercent = Math.min(100, Math.round((selectedTicket.elapsedSeconds / selectedTicket.totalSlaSeconds) * 100));

  const handleCompleteTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoAfterUrl.trim()) {
      alert('Foto bukti After wajib dilampirkan oleh petugas lapangan!');
      return;
    }
    if (!completionNotes.trim()) {
      alert('Catatan berita acara hasil pengerjaan wajib diisi!');
      return;
    }

    updateTicketStatus(selectedTicket.id, 'SELESAI', photoAfterUrl, completionNotes);
    setShowResolutionForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-surface-container overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold ${
              selectedTicket.priority === 'P0' ? 'bg-error text-white' :
              selectedTicket.priority === 'P1' ? 'bg-amber-500 text-white' :
              selectedTicket.priority === 'P2' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
            }`}>
              {selectedTicket.priority} - {selectedTicket.priority === 'P0' ? 'EMERGENCY' : selectedTicket.priority === 'P1' ? 'HIGH' : selectedTicket.priority === 'P2' ? 'MEDIUM' : 'LOW'}
            </span>
            <span className="font-mono text-[14px] text-teal-container font-bold">
              #{selectedTicket.id}
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedTicket(null);
              setShowRedispatchForm(false);
              setShowResolutionForm(false);
            }}
            className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-navy-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Main Title & Status */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-teal">
                {selectedTicket.category} • {selectedTicket.opd}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                isCompleted ? 'bg-emerald-100 text-emerald-800' :
                isEscalated ? 'bg-error-container text-error' :
                'bg-blue-100 text-blue-800'
              }`}>
                STATUS: {selectedTicket.status}
              </span>
            </div>
            <h2 className="font-headline font-bold text-navy text-[18px] mt-1">
              {selectedTicket.title}
            </h2>
            <p className="text-[13px] text-brandText-secondary mt-1 leading-relaxed">
              {selectedTicket.description}
            </p>
          </div>

          {/* SLA Countdown Timer Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isCompleted ? 'bg-emerald-50 border-emerald-200' :
            isEscalated ? 'bg-red-50 border-red-300' :
            elapsedPercent > 50 ? 'bg-amber-50 border-amber-200' : 'bg-surface-low border-surface-container'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-lg ${
                isCompleted ? 'bg-emerald-200 text-emerald-900' :
                isEscalated ? 'bg-error text-white animate-pulse' :
                'bg-navy text-teal-container'
              }`}>
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-wider text-brandText-muted uppercase">
                  {isCompleted ? 'Target Selesai' : 'Sisa Durasi SLA (Hitung Mundur Tokio Async)'}
                </div>
                <div className={`font-mono text-[22px] font-extrabold tracking-tight ${
                  isCompleted ? 'text-emerald-800' :
                  isEscalated ? 'text-error' :
                  'text-navy'
                }`}>
                  {isCompleted ? 'SELESAI SESUAI TARGET' : timerDisplay}
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] font-mono">
              <div className="text-brandText-muted">Elapsed Progress</div>
              <div className="font-bold text-navy text-[14px]">{elapsedPercent}%</div>
              <div className="text-[10px] text-gray-500">Max MTTR: {selectedTicket.mttrTargetHours} Jam</div>
            </div>
          </div>

          {/* Before & After Photo Evidence Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-brandText-muted uppercase block">
              Dokumentasi Visual Lapangan (Before & After):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Photo Before */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                <div className="px-3 py-1.5 bg-gray-100 text-[11px] font-mono font-bold text-gray-700 flex items-center justify-between">
                  <span>FOTO BEFORE (LAPORAN WARGA)</span>
                  <span className="text-teal font-semibold">Instant Geo-Tag</span>
                </div>
                <img
                  src={selectedTicket.photoUrl}
                  alt="Kondisi Awal"
                  className="w-full h-44 object-cover"
                />
              </div>

              {/* Photo After */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                <div className="px-3 py-1.5 bg-gray-100 text-[11px] font-mono font-bold text-gray-700 flex items-center justify-between">
                  <span>FOTO AFTER (VERIFIKASI PENYELESAIAN)</span>
                  <span className={selectedTicket.photoAfterUrl ? 'text-emerald-700' : 'text-amber-600'}>
                    {selectedTicket.photoAfterUrl ? 'Terverifikasi' : 'Menunggu Pengerjaan'}
                  </span>
                </div>
                {selectedTicket.photoAfterUrl ? (
                  <img
                    src={selectedTicket.photoAfterUrl}
                    alt="Kondisi Pasca Perbaikan"
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 flex flex-col items-center justify-center text-gray-400 bg-gray-50 space-y-2 border-2 border-dashed border-gray-200 m-2 rounded-lg">
                    <Camera className="w-8 h-8 text-gray-300" />
                    <span className="text-[12px] text-center px-4 text-gray-500">
                      Petugas lapangan wajib mengunggah foto After untuk menandai tiket selesai.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedTicket.completionNotes && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] text-emerald-900">
                <span className="font-bold">Berita Acara Lapangan: </span>
                {selectedTicket.completionNotes}
              </div>
            )}
          </div>

          {/* Location & Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px]">
            <div className="p-3.5 rounded-xl bg-surface-low border border-surface-container space-y-2">
              <div className="font-bold text-navy flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-teal" />
                <span>Geolokasi & Wilayah</span>
              </div>
              <div className="text-brandText-main font-medium">{selectedTicket.locationName}</div>
              <div className="text-brandText-muted">Kecamatan: {selectedTicket.district}</div>
              <div className="font-mono text-[11px] text-navy font-semibold">
                Koordinat: {selectedTicket.coordinates.lat}, {selectedTicket.coordinates.lng}
              </div>
              {selectedTicket.duplicateCount ? (
                <div className="text-[11px] text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded font-mono">
                  PostGIS Deduplication: {selectedTicket.duplicateCount} aduan serupa teragregasi (&lt; 15m)
                </div>
              ) : null}
            </div>

            <div className="p-3.5 rounded-xl bg-surface-low border border-surface-container space-y-2">
              <div className="font-bold text-navy flex items-center space-x-1.5">
                <User className="w-4 h-4 text-teal" />
                <span>Informasi Pelapor (Terenkripsi)</span>
              </div>
              <div className="text-brandText-main font-medium">{selectedTicket.citizenName}</div>
              <div className="font-mono text-[11px] text-brandText-muted">
                NIK: {selectedTicket.citizenNikEncrypted} (AES-256)
              </div>
              <div className="font-mono text-[11px] text-brandText-muted">
                Kontak: {selectedTicket.citizenPhone}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Identitas Terverifikasi KTP-el
              </div>
            </div>
          </div>

          {/* Assigned Field Team */}
          <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-[12px]">
            <div>
              <span className="text-[11px] font-bold text-brandText-muted uppercase block">
                Tim Operasional Lapangan:
              </span>
              <span className="font-semibold text-navy">
                {selectedTicket.assignedTeam || 'Belum ditugaskan'}
              </span>
            </div>
            {!isCompleted && (
              <button
                type="button"
                onClick={() => setShowRedispatchForm(!showRedispatchForm)}
                className="px-3 py-1.5 rounded-lg border border-teal text-teal hover:bg-teal-50 font-semibold text-[11px] flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Disposisi Ulang</span>
              </button>
            )}
          </div>

          {/* Redispatch Form Toggle */}
          {showRedispatchForm && (
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 text-[12px] space-y-3">
              <div className="font-bold text-navy">Disposisi Ulang ke Dinas / Tim Lain:</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-brandText-muted mb-1">Dinas Tujuan</label>
                  <select
                    value={redispatchOpd}
                    onChange={(e) => setRedispatchOpd(e.target.value as OPDName)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="Dinas PUPR">Dinas PUPR</option>
                    <option value="Dinas Perhubungan">Dinas Perhubungan</option>
                    <option value="Dinas Lingkungan Hidup">Dinas Lingkungan Hidup</option>
                    <option value="BPBD / TRC Kota">BPBD / TRC Kota</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-brandText-muted mb-1">Nama Tim / Unit</label>
                  <input
                    type="text"
                    value={redispatchTeam}
                    onChange={(e) => setRedispatchTeam(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  redispatchTicket(selectedTicket.id, redispatchOpd, redispatchTeam);
                  setShowRedispatchForm(false);
                }}
                className="px-4 py-2 bg-teal text-white rounded-lg font-semibold text-[12px] hover:bg-teal/90"
              >
                Konfirmasi Pengalihan Disposisi
              </button>
            </div>
          )}

          {/* Skenario 5: Form Verifikasi Penyelesaian oleh Petugas Lapangan */}
          {showResolutionForm && !isCompleted && (
            <form onSubmit={handleCompleteTicket} className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300 space-y-3 text-[12px] animate-in fade-in">
              <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Form Penyelesaian Aduan & Unggah Foto After (Petugas Lapangan)</span>
              </div>

              <div>
                <label className="block text-[11px] text-emerald-800 font-semibold mb-1">
                  URL / Foto Bukti Pengerjaan Lapangan (Foto After)
                </label>
                <input
                  type="text"
                  value={photoAfterUrl}
                  onChange={(e) => setPhotoAfterUrl(e.target.value)}
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white text-[12px] font-mono"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-emerald-800 font-semibold mb-1">
                  Berita Acara & Catatan Penanganan Teknis
                </label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white text-[12px]"
                  placeholder="Tuliskan tindakan perbaikan yang telah dilaksanakan..."
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowResolutionForm(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-[12px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-[12px] flex items-center space-x-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi & Simpan Status SELESAI</span>
                </button>
              </div>
            </form>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              {!isEscalated && !isCompleted && (
                <button
                  type="button"
                  onClick={() => escalateTicket(selectedTicket.id)}
                  className="px-3.5 py-2 rounded-lg bg-red-600 text-white font-semibold text-[12px] hover:bg-red-700 transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Eskalasi Manual ke Kadis</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {!isCompleted && !showResolutionForm && (
                <button
                  type="button"
                  onClick={() => setShowResolutionForm(true)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold text-[12px] hover:bg-emerald-800 transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Selesaikan Aduan (Input Bukti After)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
