import React from 'react';
import { Bell, RefreshCw, Check, Circle } from 'lucide-react';
import DataFlowLoader from '../DataFlowLoader';

interface Notification {
  id: string;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  readFilter: 'all' | 'unread';
  markingId: string | null;
  markingAll: boolean;
  onRefresh: () => void;
  onMarkAllAsRead: () => void;
  onSetReadFilter: (f: 'all' | 'unread') => void;
  onMarkAsRead: (id: string) => void;
  onRetry: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  loading,
  error,
  unreadCount,
  readFilter,
  markingId,
  markingAll,
  onRefresh,
  onMarkAllAsRead,
  onSetReadFilter,
  onMarkAsRead,
  onRetry,
}) => (
  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border-2 border-slate-200 py-2 z-50">
    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
      <h3 className="font-bold text-slate-800 text-sm">Thông báo</h3>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onRefresh} disabled={loading} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50" aria-label="Tải lại">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        {unreadCount > 0 && (
          <button type="button" onClick={onMarkAllAsRead} disabled={markingAll} className="text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1">
            {markingAll ? <span className="inline-block w-3 h-3 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" /> : null}
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>
    </div>
    <div className="flex border-b border-slate-200">
      <button type="button" onClick={() => onSetReadFilter('all')} className={`flex-1 py-2.5 text-xs font-medium transition-colors ${readFilter === 'all' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'}`}>Tất cả</button>
      <button type="button" onClick={() => onSetReadFilter('unread')} className={`flex-1 py-2.5 text-xs font-medium transition-colors ${readFilter === 'unread' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'}`}>Chưa đọc {unreadCount > 0 ? `(${unreadCount})` : ''}</button>
    </div>
    <div className="max-h-72 overflow-y-auto">
      {loading && <div className="px-4 py-6 flex justify-center"><DataFlowLoader message="Đang tải thông báo..." size="sm" /></div>}
      {!loading && error && <div className="px-4 py-6 text-center"><p className="text-red-600 text-sm mb-2">{error}</p><button type="button" onClick={onRetry} className="text-xs font-semibold text-blue-600 hover:underline">Thử lại</button></div>}
      {!loading && !error && notifications.length === 0 && <div className="px-4 py-8 text-center text-slate-500 text-sm"><Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" /><p>{readFilter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo mới'}</p></div>}
      {!loading && !error && notifications.length > 0 && (
        <ul className="py-1">
          {notifications.map((n) => (
            <li key={n.id} className={`px-4 py-3 border-b border-slate-100 last:border-0 flex gap-2 ${!n.read ? 'bg-blue-50/30' : ''}`}>
              <div className="flex-shrink-0 mt-0.5">{n.read ? <Check className="w-4 h-4 text-slate-400" /> : <Circle className="w-4 h-4 text-blue-500 fill-blue-500/20" />}</div>
              <button type="button" onClick={() => !n.read && onMarkAsRead(n.id)} disabled={n.read || markingId === n.id} className="flex-1 text-left min-w-0 disabled:opacity-100">
                <p className="font-semibold text-slate-800 text-sm">{n.title}</p>
                {n.message && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>}
                <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                {!n.read && <span className="text-[10px] text-blue-600 mt-1 inline-block">{markingId === n.id ? <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />Đang đánh dấu...</span> : 'Bấm để đánh dấu đã đọc'}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default NotificationsDropdown;
