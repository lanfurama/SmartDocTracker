import React from 'react';
import { Info } from 'lucide-react';

const SupportTab: React.FC = () => (
  <div className="p-6 animate-fade-in space-y-6">
    <h3 className="font-bold text-slate-800">Hỗ trợ</h3>
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">DocTracker</h4>
          <p className="text-xs text-slate-500">Smart Logistics</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">Ứng dụng quản lý và theo dõi hồ sơ luân chuyển. Quét mã QR để tra cứu, cập nhật trạng thái hồ sơ nhanh chóng.</p>
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Liên hệ hỗ trợ</p>
        <p className="text-sm text-slate-700">Liên hệ phòng IT hoặc quản trị viên hệ thống để được hỗ trợ.</p>
      </div>
    </div>
  </div>
);

export default SupportTab;
