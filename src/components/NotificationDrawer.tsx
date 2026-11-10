import React from 'react';
import { useApp } from '../context/AppContext';
import { X, AlertTriangle, Info, Bell, CheckCircle2 } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { notifications, isNotificationDrawerOpen, setIsNotificationDrawerOpen, setSelectedTicket, tickets } = useApp();

  if (!isNotificationDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/30 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotificationDrawerOpen(false)}
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-surface-container flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-low">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-navy" />
              <h3 className="font-headline font-bold text-navy text-[15px]">
                Pusat Notifikasi & Eskalasi
              </h3>
            </div>
            <button
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-navy hover:bg-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-brandText-muted">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-teal" />
                <p className="text-[13px]">Semua sistem berjalan normal, tidak ada peringatan aktif.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isCritical = notif.type === 'critical';
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border text-[13px] transition-all ${
                      isCritical
                        ? 'bg-red-50/60 border-red-200'
                        : notif.type === 'warning'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-surface-low border-surface-container'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      {isCritical ? (
                        <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold ${isCritical ? 'text-error' : 'text-navy'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] font-mono text-brandText-muted">
                            {notif.time}
                          </span>
                        </div>

                        <p className="mt-1 text-[12px] text-brandText-secondary leading-relaxed">
                          {notif.message}
                        </p>

                        {notif.ticketId && (
                          <div className="mt-2.5 flex items-center justify-between">
                            <span className="font-mono text-[11px] font-semibold text-navy bg-white px-2 py-0.5 rounded border border-gray-200">
                              #{notif.ticketId}
                            </span>
                            <button
                              onClick={() => {
                                const target = tickets.find(t => t.id === notif.ticketId);
                                if (target) setSelectedTicket(target);
                                setIsNotificationDrawerOpen(false);
                              }}
                              className="text-[11px] font-semibold text-teal hover:underline"
                            >
                              Lihat Detail Tiket →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 border-t border-surface-container text-center bg-surface-low text-[11px] font-mono text-brandText-muted">
            Auto-Escalation Engine • Rust Tokio Async Monitor
          </div>
        </div>
      </div>
    </div>
  );
};

