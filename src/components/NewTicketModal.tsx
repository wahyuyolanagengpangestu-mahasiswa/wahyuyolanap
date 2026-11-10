import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Sparkles, ShieldAlert, Check } from 'lucide-react';
import { Category, Priority, OPDName } from '../types';

export const NewTicketModal: React.FC = () => {
  const { isNewTicketModalOpen, setIsNewTicketModalOpen, checkPostGISDeduplication, addNewTicket, setSelectedTicket } = useApp();

  const [citizenName, setCitizenName] = useState('Rizky Ananda Pratama');
  const [citizenNik, setCitizenNik] = useState('1871051208990003');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Jalan Berlubang');
  const [priority, setPriority] = useState<Priority>('P1');
  const [opd, setOpd] = useState<OPDName>('Dinas PUPR');
  const [locationName, setLocationName] = useState('Jl. Z.A. Pagar Alam No. 15 (Dekat Kampus Teknokrat)');
  const [district, setDistrict] = useState('Kedaton');
  const [coordinates, setCoordinates] = useState({ lat: -5.3817, lng: 105.2579 });
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80');

  // AI categorization feedback
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(96);

  // PostGIS deduplication state
  const [duplicateTicket, setDuplicateTicket] = useState<any>(null);

  // Check deduplication whenever coordinates change
  useEffect(() => {
    if (isNewTicketModalOpen) {
      const match = checkPostGISDeduplication(coordinates.lat, coordinates.lng);
      setDuplicateTicket(match);
    }
  }, [coordinates, isNewTicketModalOpen]);

  if (!isNewTicketModalOpen) return null;

  // Preset location quick buttons
  const presetLocations = [
    {
      name: 'Jl. Z.A. Pagar Alam (Teknokrat)',
      district: 'Kedaton',
      lat: -5.3817,
      lng: 105.2579,
      cat: 'Jalan Berlubang' as Category,
      opd: 'Dinas PUPR' as OPDName,
      prio: 'P1' as Priority,
      photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Jl. Raden Intan (Enggal)',
      district: 'Tanjung Karang Pusat',
      lat: -5.4125,
      lng: 105.2605,
      cat: 'Pohon Tumbang' as Category,
      opd: 'BPBD / TRC Kota' as OPDName,
      prio: 'P0' as Priority,
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Jl. Sultan Agung (Way Halim)',
      district: 'Way Halim',
      lat: -5.3890,
      lng: 105.2720,
      cat: 'Sampah Liar' as Category,
      opd: 'Dinas Lingkungan Hidup' as OPDName,
      prio: 'P2' as Priority,
      photo: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Bundaran Simpang Hajimena',
      district: 'Rajabasa',
      lat: -5.3620,
      lng: 105.2340,
      cat: 'Lampu Lalu Lintas' as Category,
      opd: 'Dinas Perhubungan' as OPDName,
      prio: 'P1' as Priority,
      photo: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const handleApplyPreset = (loc: typeof presetLocations[0]) => {
    setLocationName(loc.name);
    setDistrict(loc.district);
    setCoordinates({ lat: loc.lat, lng: loc.lng });
    setCategory(loc.cat);
    setOpd(loc.opd);
    setPriority(loc.prio);
    setPhotoUrl(loc.photo);
    setTitle(`Aduan Fasilitas: ${loc.cat} di ${loc.name}`);
    setDescription(`Ditemukan kondisi ${loc.cat.toLowerCase()} yang membutuhkan perbaikan segera oleh dinas terkait.`);
    
    // Simulate AI inference delay
    setAiAnalysisRunning(true);
    setTimeout(() => {
      setAiAnalysisRunning(false);
      setAiConfidence(Math.floor(92 + Math.random() * 7));
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Mohon masukkan judul aduan.');
      return;
    }

    addNewTicket({
      title,
      description: description || 'Pelaporan warga melalui sistem Instant Geo-Reporting.',
      category,
      priority,
      opd,
      locationName,
      district,
      coordinates,
      citizenName,
      photoUrl
    });

    setIsNewTicketModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-surface-container overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-navy-container rounded-lg">
              <span className="material-symbols-outlined text-[20px] text-teal-container">add_location_alt</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-[16px]">
                Input Pengaduan Baru (Instant Geo-Reporting)
              </h3>
              <p className="text-[11px] text-blue-200">
                Simulasi Modul Warga & AI Smart Routing Kota Bandar Lampung
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewTicketModalOpen(false)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-navy-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick Preset Selector */}
          <div>
            <label className="text-[11px] font-bold tracking-wider text-brandText-muted uppercase block mb-1.5">
              Pilih Titik Lokasi Realistis Bandar Lampung:
            </label>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {presetLocations.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(loc)}
                  className="p-2.5 rounded-lg border border-gray-200 text-left hover:border-teal hover:bg-teal-50/40 transition-colors flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-navy group-hover:text-teal truncate">
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-brandText-muted">
                      {loc.district} • {loc.cat}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                    {loc.prio}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PostGIS Deduplication Alert Banner */}
          {duplicateTicket && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start space-x-3 text-amber-900 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[12px]">
                <div className="font-bold flex items-center space-x-2">
                  <span>Peringatan Duplikasi Spasial PostGIS (&lt; 15 meter)</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-800 text-[10px] font-mono">
                    ST_DWithin Match
                  </span>
                </div>
                <p className="mt-0.5 text-amber-800">
                  Aduan serupa terdeteksi di koordinat ini: <strong>#{duplicateTicket.id}</strong> ({duplicateTicket.title}). Laporan baru Anda akan ditautkan sebagai duplikat agregat untuk meningkatkan bobot prioritas.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTicket(duplicateTicket);
                    setIsNewTicketModalOpen(false);
                  }}
                  className="mt-2 text-[11px] font-bold text-amber-900 underline hover:text-navy"
                >
                  Buka Tiket Induk #{duplicateTicket.id} →
                </button>
              </div>
            </div>
          )}

          {/* AI Auto-Categorization Card */}
          <div className="p-3.5 rounded-xl bg-surface-low border border-teal-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-5 h-5 text-teal" />
              <div>
                <div className="text-[12px] font-bold text-navy flex items-center space-x-2">
                  <span>AI Computer Vision Engine</span>
                  {aiConfidence && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-teal text-white">
                      Confidence {aiConfidence}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-brandText-secondary">
                  Kategori '{category}' otomatis dipetakan ke <strong>{opd}</strong> (Prioritas {priority}).
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-teal font-semibold">
              FR-MOB-02 ACTIVE
            </span>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-navy mb-1">
                Nama Pelapor (Warga)
              </label>
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-navy mb-1">
                NIK Pelapor (Terenkripsi AES-256)
              </label>
              <input
                type="text"
                value={citizenNik}
                onChange={(e) => setCitizenNik(e.target.value)}
                className="w-full px-3 py-2 text-[13px] font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:outline-hidden bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-navy mb-1">
              Judul Pengaduan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Aspal Jalan Amblas Dekat Kampus Teknokrat"
              className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:outline-hidden"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-navy mb-1">
              Deskripsi Kerusakan / Kondisi Lapangan
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan perkiraan kedalaman lubang, dampaknya terhadap lalu lintas, dsb."
              className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:outline-hidden"
            />
          </div>

          {/* Location & Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-navy mb-1">
                Nama Lokasi & Jalan
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-navy mb-1">
                Kecamatan Kota Bandar Lampung
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 text-[13px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:outline-hidden"
              >
                <option value="Kedaton">Kedaton</option>
                <option value="Tanjung Karang Pusat">Tanjung Karang Pusat</option>
                <option value="Way Halim">Way Halim</option>
                <option value="Sukarame">Sukarame</option>
                <option value="Rajabasa">Rajabasa</option>
                <option value="Teluk Betung Selatan">Teluk Betung Selatan</option>
                <option value="Kemiling">Kemiling</option>
                <option value="Panjang">Panjang</option>
              </select>
            </div>
          </div>

          {/* Coordinate Telemetry Display */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-mono">
            <span className="text-brandText-muted">GPS Locked (SRID 4326):</span>
            <span className="text-navy font-bold">
              LAT: {coordinates.lat.toFixed(4)}, LNG: {coordinates.lng.toFixed(4)}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsNewTicketModalOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-brandText-secondary hover:bg-gray-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-[13px] font-semibold bg-navy text-white rounded-lg hover:bg-navy-container transition-colors shadow-sm flex items-center space-x-2"
            >
              <Check className="w-4 h-4 text-teal-container" />
              <span>Simpan & Kirim Tiket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
