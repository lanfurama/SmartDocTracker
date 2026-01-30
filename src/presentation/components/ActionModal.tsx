import React from 'react';
import type { ActionType } from '../hooks/useAppState';

interface ActionModalProps {
  type: ActionType;
  docId: string;
  note: string;
  onNoteChange: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const TITLES: Record<ActionType, string> = {
  receive: 'Xác nhận nhận hồ sơ',
  transfer: 'Chuyển hồ sơ đi',
  return: 'Trả hồ sơ (Cần ghi chú lý do)',
};

const ActionModal: React.FC<ActionModalProps> = ({ type, docId, note, onNoteChange, loading, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-in-bottom border-t-2 border-x-2 border-slate-200 shadow-2xl">
      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
      <h3 className="text-lg font-bold text-slate-800 mb-2">{TITLES[type]}</h3>
      <p className="text-sm text-slate-500 mb-6">Bạn đang thực hiện thao tác cập nhật trạng thái cho hồ sơ <b>{docId}</b></p>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
            {type === 'return' ? 'Lý do trả hồ sơ (Bắt buộc)' : 'Ghi chú (Tùy chọn)'}
          </label>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={type === 'return' ? "Nhập chi tiết lý do trả về (ví dụ: thiếu chữ ký, sai thông tin)..." : "Nhập lý do hoặc thông tin thêm..."}
            className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 ${type === 'return' && !note.trim() ? 'border-red-300' : 'border-slate-200'}`}
            rows={3}
          />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={loading} className={`flex-1 py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed ${type === 'return' ? 'bg-red-600 shadow-lg shadow-red-100' : 'bg-blue-600 shadow-lg shadow-blue-100'}`}>
            {loading ? (<><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang xử lý...</>) : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ActionModal;
