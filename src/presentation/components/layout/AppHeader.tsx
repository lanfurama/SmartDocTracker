import React from 'react';
import { Search, Bell, User, ArrowLeft, LogOut, Settings, PackageCheck } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

interface AppHeaderProps {
  activeTab: string;
  selectedDoc: { id: string } | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onBack: () => void;
  user: UserInfo | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  showUserMenu: boolean;
  setShowUserMenu: (v: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (v: boolean | ((prev: boolean) => boolean)) => void;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
  notificationsRef: React.RefObject<HTMLDivElement | null>;
  notifications: {
    notifications: Array<{ id: string; title: string; message?: string; read: boolean; createdAt: string }>;
    loading: boolean;
    error: string | null;
    unreadCount: number;
    readFilter: 'all' | 'unread';
    markingId: string | null;
    markingAll: boolean;
    refresh: () => void;
    markAllAsRead: () => void;
    setReadFilter: (f: 'all' | 'unread') => void;
    markAsRead: (id: string) => void;
    retry: () => void;
  };
}

const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  selectedDoc,
  searchQuery,
  onSearchChange,
  onBack,
  user,
  onLogout,
  onOpenProfile,
  onOpenAuth,
  showUserMenu,
  setShowUserMenu,
  showNotifications,
  setShowNotifications,
  userMenuRef,
  notificationsRef,
  notifications,
}) => (
  <header className="bg-white px-6 pt-8 pb-4 sticky top-0 z-30 border-b-2 border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <PackageCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 leading-tight">DocTracker</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Smart Logistics</p>
        </div>
      </div>
      <div className="flex items-center gap-2 relative" ref={userMenuRef}>
        <div className="relative" ref={notificationsRef}>
          <button type="button" onClick={() => { setShowUserMenu(false); setShowNotifications((v) => !v); }} className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100" aria-label="Thông báo">
            <Bell className="w-5 h-5" />
            {notifications.unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                {notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <NotificationsDropdown
              notifications={notifications.notifications}
              loading={notifications.loading}
              error={notifications.error}
              unreadCount={notifications.unreadCount}
              readFilter={notifications.readFilter}
              markingId={notifications.markingId}
              markingAll={notifications.markingAll}
              onRefresh={notifications.refresh}
              onMarkAllAsRead={notifications.markAllAsRead}
              onSetReadFilter={notifications.setReadFilter}
              onMarkAsRead={notifications.markAsRead}
              onRetry={notifications.retry}
            />
          )}
        </div>
        <button type="button" onClick={() => { setShowNotifications(false); user ? setShowUserMenu((v) => !v) : onOpenAuth(); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100" aria-label={user ? 'Tài khoản' : 'Đăng nhập'}>
          <User className="w-5 h-5" />
        </button>
        {showUserMenu && user && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border-2 border-slate-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-slate-200">
              <p className="font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5">{user.role}</p>
            </div>
            <button type="button" onClick={() => { setShowUserMenu(false); onOpenProfile(); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
              <Settings className="w-4 h-4" /> Chỉnh sửa hồ sơ
            </button>
            <button type="button" onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
    {activeTab === 'home' && !selectedDoc && (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder="Nhập mã hồ sơ hoặc tên..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400" />
      </div>
    )}
    {selectedDoc && (
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </button>
    )}
  </header>
);

export default AppHeader;
