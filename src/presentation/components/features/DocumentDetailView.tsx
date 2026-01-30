import React from 'react';
import { PackageCheck, Sparkles, Truck, RotateCcw, AlignLeft } from 'lucide-react';
import { Document } from '../../../domain/entities/Document';
import { STATUS_CONFIG } from '../../../shared/constants';
import { STATUS_ICONS } from '../../../shared/config/statusUI';
import TrackingTimeline from '../TrackingTimeline';
import DataFlowLoader from '../DataFlowLoader';

interface DocumentDetailViewProps {
  doc: Document;
  aiInsights: string;
  loadingAi: boolean;
  onOpenActionModal: (type: 'receive' | 'transfer' | 'return') => void;
}

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({ doc, aiInsights, loadingAi, onOpenActionModal }) => (
  <div className="p-6 space-y-6 animate-slide-in-right">
    <div className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 relative overflow-hidden">
      {doc.isBottleneck && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">Điểm nghẽn</div>}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Mã hồ sơ: {doc.id}</p>
          <h2 className="text-lg font-bold text-slate-800 leading-snug break-words">{doc.title}</h2>
          {doc.description && (
            <div className="mt-2 flex items-start gap-2 text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <AlignLeft className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
              <p className="text-xs italic leading-relaxed">{doc.description}</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_CONFIG[doc.currentStatus].color}`}>
          {STATUS_ICONS[doc.currentStatus]}
          {STATUS_CONFIG[doc.currentStatus].label}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 font-medium">Tiến độ</span>
            <span className="text-[10px] text-blue-600 font-bold">Bước {STATUS_CONFIG[doc.currentStatus].step}/5</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full" style={{ width: `${(STATUS_CONFIG[doc.currentStatus].step / 5) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>

    {doc.history.length > 1 && (
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-2xl shadow-xl shadow-blue-200 text-white relative">
        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/20" />
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 bg-white/20 rounded-lg"><Sparkles className="w-3 h-3 text-white" /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">AI Phân tích hành trình</span>
        </div>
        {loadingAi ? (
          <div className="flex items-center gap-3 py-2">
            <DataFlowLoader size="sm" variant="onDark" message="Đang phân tích thông minh..." className="[&_.data-flow-loader]:!w-10 [&_.data-flow-loader]:!h-10" />
          </div>
        ) : (
          <p className="text-sm font-medium leading-relaxed">{aiInsights || "Sẵn sàng phân tích dữ liệu luân chuyển của hồ sơ này."}</p>
        )}
      </div>
    )}

    {doc.history.length === 1 && (
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-xl shadow-emerald-200 text-white relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 bg-white/20 rounded-lg"><PackageCheck className="w-3 h-3 text-white" /></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Hồ sơ mới</span>
        </div>
        <p className="text-sm font-medium leading-relaxed">Hồ sơ vừa được quét lần đầu tiên. Chọn hành động bên dưới để bắt đầu luân chuyển.</p>
      </div>
    )}

    <div>
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-slate-800">Lịch sử di chuyển</h3>
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Cập nhật: {new Date(doc.lastUpdate).toLocaleTimeString()}</span>
      </div>
      <TrackingTimeline history={doc.history} />
    </div>

    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
      <div className="bg-white backdrop-blur-md p-3 rounded-3xl shadow-xl border-2 border-slate-200 flex flex-wrap gap-2">
        <button onClick={() => onOpenActionModal('receive')} className="flex-1 min-w-[80px] bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <PackageCheck className="w-4 h-4" /> NHẬN
        </button>
        <button onClick={() => onOpenActionModal('transfer')} className="flex-1 min-w-[80px] bg-slate-800 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Truck className="w-4 h-4" /> CHUYỂN
        </button>
        <button onClick={() => onOpenActionModal('return')} className="flex-1 min-w-[80px] bg-red-50 text-red-600 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <RotateCcw className="w-4 h-4" /> TRẢ VỀ
        </button>
      </div>
    </div>
  </div>
);

export default DocumentDetailView;
