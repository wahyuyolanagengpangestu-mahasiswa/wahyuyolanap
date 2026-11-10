import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, OPDPerformanceItem, AuditLog, TicketStatus, OPDName, Category, Priority } from '../types';
import { INITIAL_TICKETS, INITIAL_OPD_PERFORMANCE, INITIAL_AUDIT_LOGS } from '../data/mockData';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'critical' | 'warning' | 'info';
  ticketId?: string;
}

interface AppContextType {
  activeTab: 'dashboard' | 'gis' | 'stream' | 'opd' | 'audit';
  setActiveTab: (tab: 'dashboard' | 'gis' | 'stream' | 'opd' | 'audit') => void;
  tickets: Ticket[];
  opdPerformance: OPDPerformanceItem[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  isNewTicketModalOpen: boolean;
  setIsNewTicketModalOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  checkPostGISDeduplication: (lat: number, lng: number) => Ticket | null;
  addNewTicket: (data: {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    opd: OPDName;
    locationName: string;
    district: string;
    coordinates: { lat: number; lng: number };
    citizenName: string;
    photoUrl?: string;
  }) => Ticket;
  escalateTicket: (ticketId: string, reason?: string) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, photoAfterUrl?: string, completionNotes?: string) => void;
  redispatchTicket: (ticketId: string, targetOpd: OPDName, teamName: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Haversine formula in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gis' | 'stream' | 'opd' | 'audit'>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [opdPerformance, setOpdPerformance] = useState<OPDPerformanceItem[]>(INITIAL_OPD_PERFORMANCE);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Peringatan SLA Terlewat < 20%',
      message: 'Tiket #TKT-BDL-2026-0839 (Bundaran Hajimena) melewati batas aman SLA. Terdistribusi otomatis ke Kadishub.',
      time: '16:15 WIB',
      type: 'critical',
      ticketId: 'TKT-BDL-2026-0839'
    },
    {
      id: 'notif-2',
      title: 'Deduplikasi PostGIS Berhasil',
      message: '3 laporan warga terduplikasi dalam radius < 15m di Jl. Z.A. Pagar Alam digabung ke Tiket Induk #TKT-BDL-2026-0841.',
      time: '15:48 WIB',
      type: 'info',
      ticketId: 'TKT-BDL-2026-0841'
    }
  ]);

  // Tokio Async Simulation: 1s live countdown tick dengan Standardisasi UTC
  useEffect(() => {
    const interval = setInterval(() => {
      const nowUtcMs = Date.now();
      const currentWibTime = new Date(nowUtcMs).toLocaleTimeString('id-ID', { 
        timeZone: 'Asia/Jakarta', 
        hour12: false 
      }) + ' WIB';

      setTickets((prevTickets) =>
        prevTickets.map((ticket) => {
          if (ticket.status === 'SELESAI') return ticket;

          // Standardisasi UTC: Hitung selisih detik riil terhadap createdAt UTC untuk mencegah offset
          const createdUtcMs = new Date(ticket.createdAt).getTime();
          const calculatedElapsed = !isNaN(createdUtcMs) && createdUtcMs > 0
            ? Math.max(0, Math.floor((nowUtcMs - createdUtcMs) / 1000))
            : ticket.elapsedSeconds + 1;

          const remainingSeconds = Math.max(0, ticket.totalSlaSeconds - calculatedElapsed);
          const remainingRatio = ticket.totalSlaSeconds > 0 ? remainingSeconds / ticket.totalSlaSeconds : 0;

          // Auto Escalation trigger if remaining <= 20% and not yet escalated
          if (remainingRatio <= 0.20 && !ticket.isEscalated && ticket.status !== 'ESKALASI_KADIS') {
            // Trigger automatic escalation log
            const newLog: AuditLog = {
              id: `aud-${nowUtcMs}`,
              timestamp: currentWibTime,
              txHash: '7c89ab' + Math.random().toString(36).substring(2, 10) + '99d0e12',
              actor: 'AutoEscalation::TokioAsyncWorker',
              role: 'Sistem AI',
              action: `ESCALATION_ALERT: Sisa durasi SLA tiket #${ticket.id} < 20%. Dispatch otomatis ke Kepala ${ticket.opd}.`,
              ticketId: ticket.id,
              status: 'PERINGATAN'
            };

            setAuditLogs((prevLogs) => [newLog, ...prevLogs]);

            setNotifications((prevNotifs) => [
              {
                id: `notif-${nowUtcMs}`,
                title: `Eskalasi Otomatis Tiket ${ticket.id}`,
                message: `Waktu penanganan tersisa kurang dari 20% (${Math.round(remainingSeconds / 60)} menit lagi).`,
                time: currentWibTime,
                type: 'critical',
                ticketId: ticket.id
              },
              ...prevNotifs
            ]);

            return {
              ...ticket,
              elapsedSeconds: calculatedElapsed,
              isEscalated: true,
              status: 'ESKALASI_KADIS'
            };
          }

          return {
            ...ticket,
            elapsedSeconds: calculatedElapsed
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // PostGIS ST_DWithin simulation: Check for active reports within 15 meters
  const checkPostGISDeduplication = (lat: number, lng: number): Ticket | null => {
    for (const ticket of tickets) {
      if (ticket.status !== 'SELESAI') {
        const dist = calculateDistanceMeters(lat, lng, ticket.coordinates.lat, ticket.coordinates.lng);
        if (dist <= 15) {
          return ticket; // Match found within 15 meters!
        }
      }
    }
    return null;
  };

  const addNewTicket = (data: {
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    opd: OPDName;
    locationName: string;
    district: string;
    coordinates: { lat: number; lng: number };
    citizenName: string;
    photoUrl?: string;
  }): Ticket => {
    // Determine SLA targets
    let mttaTarget = 30;
    let mttrHours = 24;
    let totalSeconds = 24 * 3600;

    if (data.priority === 'P0') {
      mttaTarget = 15;
      mttrHours = 4;
      totalSeconds = 4 * 3600;
    } else if (data.priority === 'P1') {
      mttaTarget = 30;
      mttrHours = 24;
      totalSeconds = 24 * 3600;
    } else if (data.priority === 'P2') {
      mttaTarget = 120;
      mttrHours = 48;
      totalSeconds = 48 * 3600;
    } else {
      mttaTarget = 240;
      mttrHours = 168; // 7 days
      totalSeconds = 7 * 24 * 3600;
    }

    const nextId = `TKT-BDL-2026-0${843 + tickets.length}`;
    const newTicket: Ticket = {
      id: nextId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'TERKIRIM',
      opd: data.opd,
      locationName: data.locationName,
      district: data.district,
      coordinates: data.coordinates,
      citizenName: data.citizenName,
      citizenNikEncrypted: '1871' + Math.floor(100000 + Math.random() * 900000) + '******',
      citizenPhone: '0812-' + Math.floor(1000 + Math.random() * 9000) + '-****',
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date().toISOString(),
      totalSlaSeconds: totalSeconds,
      elapsedSeconds: 0,
      mttaTargetMinutes: mttaTarget,
      mttrTargetHours: mttrHours,
      isEscalated: false,
      duplicateCount: 0,
      assignedTeam: `Unit Cepat ${data.opd}`
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Create Audit Log
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }) + ' WIB',
      txHash: 'a1b2c3' + Math.random().toString(36).substring(2, 10) + 'ef0123',
      actor: `${data.citizenName} (Warga)`,
      role: 'Warga (Pelapor)',
      action: `NEW_TICKET: Aduan "${data.title}" berhasil diinput via Instant Geo-Reporting.`,
      ticketId: nextId,
      status: 'TERVERIFIKASI'
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Tiket Baru: ${nextId}`,
        message: `${data.title} (${data.priority}) didisposisikan ke ${data.opd}.`,
        time: new Date().toLocaleTimeString('id-ID', { hour12: false }) + ' WIB',
        type: data.priority === 'P0' ? 'critical' : 'info',
        ticketId: nextId
      },
      ...prev
    ]);

    return newTicket;
  };

  const escalateTicket = (ticketId: string, reason: string = 'Eskalasi manual oleh dispatcher') => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            isEscalated: true,
            status: 'ESKALASI_KADIS'
          };
        }
        return t;
      })
    );

    const targetTicket = tickets.find((t) => t.id === ticketId);
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }) + ' WIB',
      txHash: 'ee4499' + Math.random().toString(36).substring(2, 10) + '22aa33',
      actor: 'Dispatcher Hendrawan (NIP: 198804122011011002)',
      role: 'Operator Dispatcher',
      action: `MANUAL_ESCALATION: Tiket #${ticketId} dieskalasikan darurat ke Kadis. Alasan: ${reason}`,
      ticketId,
      status: 'PERINGATAN'
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Eskalasi Darurat Tiket #${ticketId}`,
        message: `Tiket langsung ditindaklanjuti pimpinan dinas terkait (${targetTicket?.opd}).`,
        time: new Date().toLocaleTimeString('id-ID', { hour12: false }) + ' WIB',
        type: 'critical',
        ticketId
      },
      ...prev
    ]);
  };

  const updateTicketStatus = (
    ticketId: string,
    status: TicketStatus,
    photoAfterUrl?: string,
    completionNotes?: string
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            resolvedAt: status === 'SELESAI' ? new Date().toISOString() : t.resolvedAt,
            photoAfterUrl: photoAfterUrl || t.photoAfterUrl,
            completionNotes: completionNotes || t.completionNotes
          };
        }
        return t;
      })
    );

    const isResolved = status === 'SELESAI';
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }) + ' WIB',
      txHash: '55ffaa' + Math.random().toString(36).substring(2, 10) + '112233',
      actor: isResolved ? 'Bripka Danu (Petugas Lapangan TRC)' : 'Petugas Lapangan',
      role: 'Tim TRC Lapangan',
      action: isResolved
        ? `RESOLUTION_VERIFIED: Tiket #${ticketId} dinyatakan SELESAI. Bukti foto After terunggah. Catatan: "${completionNotes || 'Pekerjaan perbaikan lapangan tuntas.'}"`
        : `STATUS_CHANGED: Tiket #${ticketId} diperbarui ke status ${status}.`,
      ticketId,
      status: 'TERVERIFIKASI'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const redispatchTicket = (ticketId: string, targetOpd: OPDName, teamName: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            opd: targetOpd,
            assignedTeam: teamName,
            status: 'DIRESPON'
          };
        }
        return t;
      })
    );

    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }) + ' WIB',
      txHash: '998877' + Math.random().toString(36).substring(2, 10) + 'bbccdd',
      actor: 'Dispatcher Hendrawan',
      role: 'Operator Dispatcher',
      action: `REDISPATCH: Tiket #${ticketId} dialihkan ke ${targetOpd} (${teamName}).`,
      ticketId,
      status: 'TERVERIFIKASI'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tickets,
        opdPerformance,
        auditLogs,
        notifications,
        isNewTicketModalOpen,
        setIsNewTicketModalOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        selectedTicket,
        setSelectedTicket,
        checkPostGISDeduplication,
        addNewTicket,
        escalateTicket,
        updateTicketStatus,
        redispatchTicket
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

