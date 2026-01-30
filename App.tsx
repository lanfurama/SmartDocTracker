import React from 'react';
import { useAppState } from './src/presentation/hooks/useAppState';
import AppHeader from './src/presentation/components/layout/AppHeader';
import BottomNav from './src/presentation/components/layout/BottomNav';
import AppModals from './src/presentation/components/layout/AppModals';
import DocumentDetailView from './src/presentation/components/features/DocumentDetailView';
import HomeTab from './src/presentation/components/features/HomeTab';
import SupportTab from './src/presentation/components/features/SupportTab';
import AnalyticsBoard from './src/presentation/components/AnalyticsBoard';
import CreatorPortal from './src/presentation/components/CreatorPortal';
import AuthScreen from './src/presentation/components/AuthScreen';
import DataFlowLoader from './src/presentation/components/DataFlowLoader';

const App: React.FC = () => {
  const state = useAppState();
  const { documents, activeTab, setActiveTab } = state;

  if (state.authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/30">
      <DataFlowLoader message="Đang tải..." size="xl" />
    </div>
  );
  if (!state.user) return <AuthScreen />;

  const handleTabChange = (tab: typeof activeTab) => { setActiveTab(tab); documents.selectDoc(null); };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-100 relative shadow-xl overflow-hidden border-x border-slate-200">
      <AppHeader activeTab={activeTab} selectedDoc={documents.selectedDoc} searchQuery={documents.searchQuery} onSearchChange={documents.setSearchQuery} onBack={() => documents.selectDoc(null)} user={state.user} onLogout={state.logout} onOpenProfile={() => state.setShowProfileModal(true)} onOpenAuth={() => state.setShowAuthModal(true)} showUserMenu={state.showUserMenu} setShowUserMenu={state.setShowUserMenu} showNotifications={state.showNotifications} setShowNotifications={state.setShowNotifications} userMenuRef={state.userMenuRef} notificationsRef={state.notificationsRef} notifications={state.notifications} />

      <main className="flex-1 overflow-y-auto pb-32">
        {documents.selectedDoc ? (
          <DocumentDetailView doc={documents.selectedDoc} aiInsights={state.aiInsights} loadingAi={state.loadingAi} onOpenActionModal={state.setShowActionModal} />
        ) : (
          <>
            {activeTab === 'home' && <HomeTab documents={documents.documents} filteredDocs={documents.filteredDocs} docsLoading={state.docsLoading} docsError={state.docsError} onRefetch={state.refetchDocs} onSelectDoc={documents.selectDoc} onScanSelect={(qr) => documents.handleScanResult(qr).catch(() => state.setNotFoundQR(qr))} />}
            {activeTab === 'analytics' && <div className="animate-fade-in"><AnalyticsBoard /></div>}
            {activeTab === 'creator' && <div className="animate-fade-in"><CreatorPortal documents={documents.documents} onCreate={documents.addDocument} onSelectDoc={documents.selectDoc} /></div>}
            {activeTab === 'support' && <SupportTab />}
          </>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onScan={state.openScanner} />

      <AppModals showScanner={state.showScanner} onScan={state.onScan} onCloseScanner={state.closeScanner} scanLoading={documents.scanLoading} notFoundQR={state.notFoundQR} onCreateNew={state.handleCreateNew} onScanAgain={state.handleScanAgain} onCloseNotFound={() => state.setNotFoundQR(null)} showAuthModal={state.showAuthModal} onCloseAuthModal={() => state.setShowAuthModal(false)} showProfileModal={state.showProfileModal} onCloseProfileModal={() => state.setShowProfileModal(false)} showActionModal={state.showActionModal} selectedDocId={documents.selectedDoc?.id ?? null} note={state.note} onNoteChange={state.setNote} actionLoading={state.actionLoading} onActionConfirm={() => state.onAction(state.showActionModal!)} onActionCancel={() => { state.setShowActionModal(null); state.setNote(''); }} />
    </div>
  );
};

export default App;
