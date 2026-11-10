import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { NewTicketModal } from './components/NewTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ExecutiveDashboard } from './views/ExecutiveDashboard';
import { SpatialGISMap } from './views/SpatialGISMap';
import { TicketStream } from './views/TicketStream';
import { OPDPerformance } from './views/OPDPerformance';
import { AuditTrail } from './views/AuditTrail';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* 80px Fixed Header */}
      <Header />

      {/* 256px Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="pt-20 pl-64 flex-1 flex flex-col min-h-screen">
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <ExecutiveDashboard />}
          {activeTab === 'gis' && <SpatialGISMap />}
          {activeTab === 'stream' && <TicketStream />}
          {activeTab === 'opd' && <OPDPerformance />}
          {activeTab === 'audit' && <AuditTrail />}
        </div>

        {/* Mandatory Footer */}
        <Footer />
      </main>

      {/* Modals & Drawers */}
      <NewTicketModal />
      <TicketDetailModal />
      <NotificationDrawer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;

