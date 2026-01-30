import { useState, useRef, useEffect } from 'react';
import { Document } from '../../domain/entities/Document';
import { apiClient } from '../../infrastructure/api/apiClient';
import { useDocuments } from './useDocuments';
import { useDocumentInsights } from './useAiInsights';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from './useNotifications';
import { useScanner, useTabNavigation } from './useScanner';

export type ActionType = 'receive' | 'transfer' | 'return';

export function useAppState() {
  const { user, logout, loading: authLoading } = useAuth();
  const { activeTab, setActiveTab } = useTabNavigation('home');
  const { showScanner, openScanner, closeScanner } = useScanner();
  const notifications = useNotifications(!!user);

  const [initialDocs, setInitialDocs] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState<ActionType | null>(null);
  const [note, setNote] = useState('');
  const [notFoundQR, setNotFoundQR] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const documentsState = useDocuments(initialDocs);
  const { insights: aiInsights, loading: loadingAi } = useDocumentInsights(documentsState.selectedDoc);

  // Load documents when user logs in
  useEffect(() => {
    if (!user) {
      setInitialDocs([]);
      setDocsLoading(false);
      return;
    }
    setDocsLoading(true);
    setDocsError(null);
    apiClient
      .getDocuments()
      .then((res) => setInitialDocs(res.documents))
      .catch((e) => setDocsError(e instanceof Error ? e.message : 'Không tải được danh sách hồ sơ'))
      .finally(() => setDocsLoading(false));
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifications]);

  useEffect(() => {
    if (showNotifications && user) notifications.refresh();
  }, [showNotifications, user]);

  // Detect unknown doc -> show not found
  useEffect(() => {
    if (documentsState.selectedDoc && lastScannedCode && documentsState.selectedDoc.title === 'Hồ sơ chưa xác định' && documentsState.selectedDoc.id === lastScannedCode) {
      setNotFoundQR(lastScannedCode);
      setLastScannedCode(null);
    }
  }, [documentsState.selectedDoc, lastScannedCode]);

  // Record scan history
  useEffect(() => {
    if (documentsState.selectedDoc && lastScannedCode && documentsState.selectedDoc.id === lastScannedCode) {
      const { ScanHistoryService } = require('../../infrastructure/services/ScanHistoryService');
      ScanHistoryService.add({
        qrCode: lastScannedCode,
        documentId: documentsState.selectedDoc.id,
        documentTitle: documentsState.selectedDoc.title,
        status: documentsState.selectedDoc.title === 'Hồ sơ chưa xác định' ? 'not_found' : 'found'
      });
    }
  }, [documentsState.selectedDoc, lastScannedCode]);

  const onScan = async (code: string) => {
    closeScanner();
    setLastScannedCode(code);
    try {
      await documentsState.handleScanResult(code);
    } catch (error) {
      console.error('Scan error:', error);
      setNotFoundQR(code);
      setLastScannedCode(null);
      const { ScanHistoryService } = require('../../infrastructure/services/ScanHistoryService');
      ScanHistoryService.add({ qrCode: code, documentId: code, documentTitle: 'Chưa tìm thấy', status: 'not_found' });
    }
  };

  const onAction = async (type: ActionType) => {
    setActionLoading(true);
    try {
      const result = await documentsState.handleDocAction(type, note);
      if (!result.success && result.error) {
        alert(result.error);
        return;
      }
      setShowActionModal(null);
      setNote('');
    } finally {
      setActionLoading(false);
    }
  };

  const refetchDocs = () => {
    setDocsError(null);
    setDocsLoading(true);
    apiClient.getDocuments()
      .then((res) => setInitialDocs(res.documents))
      .catch((e) => setDocsError(e instanceof Error ? e.message : 'Lỗi'))
      .finally(() => setDocsLoading(false));
  };

  return {
    authLoading,
    user,
    logout,
    activeTab,
    setActiveTab,
    showScanner,
    openScanner,
    closeScanner,
    aiInsights,
    loadingAi,
    notifications,
    initialDocs,
    docsLoading,
    docsError,
    refetchDocs,
    showAuthModal,
    setShowAuthModal,
    showProfileModal,
    setShowProfileModal,
    showUserMenu,
    setShowUserMenu,
    showNotifications,
    setShowNotifications,
    userMenuRef,
    notificationsRef,
    showActionModal,
    setShowActionModal,
    note,
    setNote,
    notFoundQR,
    setNotFoundQR,
    actionLoading,
    onScan,
    onAction,
    handleCreateNew: () => { setNotFoundQR(null); setActiveTab('creator'); },
    handleScanAgain: () => { setNotFoundQR(null); documentsState.selectDoc(null); openScanner(); },
    documents: documentsState,
  };
}
