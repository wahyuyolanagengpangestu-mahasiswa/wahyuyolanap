import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DISTRICT_POLYGONS } from '../data/mockData';
import { 
  Layers, 
  Compass, 
  Database, 
  Radio, 
  ExternalLink 
} from 'lucide-react';

export const SpatialGISMap: React.FC = () => {
  const { tickets, selectedTicket, setSelectedTicket } = useApp();
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [activeDistrict, setActiveDistrict] = useState<string | null>(null);
  const [showDeduplicationRadius, setShowDeduplicationRadius] = useState<boolean>(true);

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (activeDistrict && t.district !== activeDistrict) return false;
    return true;
  });

  // Calculate coordinates projection on SVG canvas (width 700, height 500)
  // Bandar Lampung bounding box roughly:
  // Lat: -5.3500 to -5.4700 (Delta: 0.12)
  // Lng: 105.2200 to 105.3300 (Delta: 0.11)
  const projectCoords = (lat: number, lng: number) => {
    const minLat = -5.4700;
    const maxLat = -5.3500;
    const minLng = 105.2200;
    const maxLng = 105.3300;

    const x = ((lng - minLng) / (maxLng - minLng)) * 620 + 40;
    // Invert Y because lat goes north/up
    const y = ((maxLat - lat) / (maxLat - minLat)) * 420 + 40;

    return { x, y };
  };

  const currentInspectorTicket = selectedTicket || filteredTickets[0];

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-white rounded-xl p-4 border border-surface-container shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-navy text-teal-container">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline font-bold text-navy text-[16px] flex items-center space-x-2">
              <span>Peta Spasial Command Center (PostGIS Engine)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800">
                SRID 4326 WGS84
              </span>
            </h2>
            <p className="text-[12px] text-brandText-secondary">
              Pemetaan insiden fasilitas publik terintegrasi di 8 kecamatan Kota Bandar Lampung.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 text-[12px]">
          <div className="flex items-center space-x-1 bg-surface-low p-1 rounded-lg border border-surface-container">
            <span className="text-[11px] font-bold text-brandText-muted px-2">Prioritas:</span>
            {['ALL', 'P0', 'P1', 'P2', 'P3'].map((prio) => (
              <button
                key={prio}
                onClick={() => setFilterPriority(prio)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                  filterPriority === prio
                    ? 'bg-navy text-white shadow-xs'
                    : 'text-brandText-secondary hover:text-navy hover:bg-white'
                }`}
              >
                {prio}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowDeduplicationRadius(!showDeduplicationRadius)}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono font-semibold flex items-center space-x-1.5 transition-colors ${
              showDeduplicationRadius
                ? 'bg-teal-50 border-teal text-teal'
                : 'bg-white border-gray-300 text-brandText-muted'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Buffer 15m PostGIS</span>
          </button>
        </div>
      </div>

      {/* Main Map + Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dark GIS Canvas (2 Columns) */}
        <div className="lg:col-span-2 bg-gis-dark rounded-2xl border border-gis-border shadow-xl p-4 relative overflow-hidden flex flex-col justify-between min-h-[520px]">
          {/* GIS Header Overlay */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-glow animate-pulse"></span>
              <span className="font-mono text-[11px] tracking-wider text-teal-container">
                LIVE POSTGIS SPATIAL LAYER: KOTA BANDAR LAMPUNG
              </span>
            </div>

            <div className="flex items-center space-x-2 font-mono text-[10px] text-gray-400">
              <span>LAT: -5.4125</span>
              <span>•</span>
              <span>LNG: 105.2605</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full h-full my-auto flex items-center justify-center relative select-none">
            <svg
              viewBox="0 0 700 500"
              className="w-full h-auto max-h-[440px] drop-shadow-md"
              style={{ filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.4))' }}
            >
              {/* Thin Grid Coordinates */}
              <defs>
                <pattern id="gisGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2,2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gisGrid)" />

              {/* District Polygons */}
              {DISTRICT_POLYGONS.map((district) => {
                const isSelected = activeDistrict === district.name;
                return (
                  <g key={district.code} onClick={() => setActiveDistrict(isSelected ? null : district.name)}>
                    <path
                      d={district.pathD}
                      fill={isSelected ? '#1E3A8A' : '#13213C'}
                      fillOpacity={isSelected ? '0.6' : '0.35'}
                      stroke={isSelected ? '#38BDF8' : '#334155'}
                      strokeWidth={isSelected ? '2' : '1.2'}
                      className="cursor-pointer hover:fill-opacity-50 transition-all duration-200"
                    />
                    {/* District Label */}
                    <text
                      x={district.center.lng ? projectCoords(district.center.lat, district.center.lng).x : 350}
                      y={district.center.lat ? projectCoords(district.center.lat, district.center.lng).y : 250}
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                      className="pointer-events-none select-none font-semibold tracking-wider"
                    >
                      {district.code}
                    </text>
                  </g>
                );
              })}

              {/* Coastal Line Hint (Teluk Lampung) */}
              <path
                d="M 370,490 Q 450,440 600,470 L 690,490"
                fill="none"
                stroke="#0EA5E9"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                opacity="0.4"
              />
              <text x="500" y="485" fill="#0EA5E9" fontSize="8" fontFamily="JetBrains Mono" opacity="0.6">
                TELUK LAMPUNG (PESISIR)
              </text>

              {/* Render Incident Markers */}
              {filteredTickets.map((ticket) => {
                const { x, y } = projectCoords(ticket.coordinates.lat, ticket.coordinates.lng);
                const isCurrent = currentInspectorTicket?.id === ticket.id;

                let markerColor = '#64748B'; // P3 default
                if (ticket.status === 'SELESAI') markerColor = '#10B981';
                else if (ticket.priority === 'P0') markerColor = '#EF4444';
                else if (ticket.priority === 'P1') markerColor = '#F59E0B';
                else if (ticket.priority === 'P2') markerColor = '#3B82F6';

                return (
                  <g
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="cursor-pointer group"
                  >
                    {/* 15m Deduplication Buffer Circle */}
                    {showDeduplicationRadius && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isCurrent ? "26" : "18"}
                        fill={markerColor}
                        fillOpacity="0.12"
                        stroke={markerColor}
                        strokeWidth="0.8"
                        strokeDasharray="2,2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Critical Pulse Glow for P0 */}
                    {ticket.priority === 'P0' && ticket.status !== 'SELESAI' && (
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2"
                        className="animate-ping"
                        opacity="0.75"
                      />
                    )}

                    {/* Outer selection ring */}
                    {isCurrent && (
                      <circle
                        cx={x}
                        cy={y}
                        r="10"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="2"
                      />
                    )}

                    {/* Core Point Marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isCurrent ? "6" : "4.5"}
                      fill={markerColor}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="transition-transform duration-150 group-hover:scale-125"
                    />

                    {/* Marker Tooltip label on hover */}
                    <text
                      x={x}
                      y={y - 12}
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none drop-shadow"
                    >
                      {ticket.priority}: #{ticket.id.slice(-4)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend Footer */}
          <div className="bg-gis-card/80 border border-gis-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-gray-300 z-10">
            <div className="flex items-center space-x-4">
              <span className="font-bold text-white">LEGENDA:</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>P0 Kritis</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>P1 Tinggi</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>P2 Sedang</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span>P3 Rendah</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Selesai</span>
              </div>
            </div>

            <div className="text-[10px] text-teal-glow">
              *Radius putus-putus = PostGIS Buffer ST_DWithin (15 Meter)
            </div>
          </div>
        </div>

        {/* Spatial Inspector Panel (1 Column) */}
        <div className="bg-white rounded-2xl p-5 border border-surface-container shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal" />
                <h3 className="font-headline font-bold text-navy text-[15px]">
                  Inspector Spasial PostGIS
                </h3>
              </div>
              {currentInspectorTicket && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  currentInspectorTicket.priority === 'P0' ? 'bg-error text-white' : 'bg-navy text-white'
                }`}>
                  {currentInspectorTicket.priority}
                </span>
              )}
            </div>

            {currentInspectorTicket ? (
              <div className="mt-4 space-y-3.5 text-[12px]">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase text-brandText-muted">
                    ID Tiket Terpilih
                  </div>
                  <div className="font-mono text-[15px] font-extrabold text-navy">
                    #{currentInspectorTicket.id}
                  </div>
                  <div className="font-semibold text-brandText-main mt-1 text-[13px]">
                    {currentInspectorTicket.title}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-low border border-surface-container space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-brandText-muted text-[11px]">Kategori:</span>
                    <span className="font-semibold text-navy">{currentInspectorTicket.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brandText-muted text-[11px]">Dinas Penanggung:</span>
                    <span className="font-semibold text-navy">{currentInspectorTicket.opd}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brandText-muted text-[11px]">Wilayah:</span>
                    <span className="font-semibold text-navy">{currentInspectorTicket.district}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-brandText-muted">Koordinat:</span>
                    <span className="text-navy font-bold">
                      {currentInspectorTicket.coordinates.lat}, {currentInspectorTicket.coordinates.lng}
                    </span>
                  </div>
                </div>

                {/* Simulated PostGIS SQL Query Telemetry */}
                <div className="p-3 rounded-xl bg-gis-dark text-gray-300 font-mono text-[10px] space-y-1">
                  <div className="text-teal-glow font-bold flex items-center space-x-1">
                    <Database className="w-3 h-3" />
                    <span>PostGIS ST_DWithin Query Log:</span>
                  </div>
                  <code className="block text-gray-400 break-all leading-tight">
                    SELECT id FROM tickets WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint({currentInspectorTicket.coordinates.lng}, {currentInspectorTicket.coordinates.lat}), 4326)::geography, 15);
                  </code>
                  <div className="text-emerald-400 font-bold pt-1">
                    → Matched {currentInspectorTicket.duplicateCount || 1} laporan dalam radius 15m.
                  </div>
                </div>

                <div className="text-[11px] text-brandText-secondary leading-snug">
                  Lokasi spesifik: <strong>{currentInspectorTicket.locationName}</strong>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-brandText-muted text-[13px]">
                Pilih salah satu titik insiden pada peta untuk melihat telemetri PostGIS.
              </div>
            )}
          </div>

          {currentInspectorTicket && (
            <button
              onClick={() => setSelectedTicket(currentInspectorTicket)}
              className="w-full py-2.5 bg-navy text-white hover:bg-navy-container rounded-lg text-[12px] font-semibold transition-colors flex items-center justify-center space-x-2 shadow-xs"
            >
              <span>Buka Detail & Tindak Lanjut Tiket</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
