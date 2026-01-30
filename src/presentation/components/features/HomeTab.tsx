import React from 'react';
import { Search, PackageCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { Document } from '../../../domain/entities/Document';
import { STATUS_CONFIG } from '../../../shared/constants';
import RecentScans from '../RecentScans';
import DataFlowLoader from '../DataFlowLoader';

interface HomeTabProps {
  documents: Document[];
  filteredDocs: Document[];
  docsLoading: boolean;
  docsError: string | null;
  onRefetch: () => void;
  onSelectDoc: (doc: Document) => void;
  onScanSelect: (qrCode: string) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ documents, filteredDocs, docsLoading, docsError, onRefetch, onSelectDoc, onScanSelect }) => (
  <div className="p-6 space-y-6 animate-fade-in">
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-slate-800">Hồ sơ luân chuyển</h3>
      <button className="text-xs font-semibold text-blue-600">Xem tất cả</button>
    </div>

    <RecentScans onScanSelect={onScanSelect} />

    {docsLoading && (
      <div className="flex items-center justify-center py-12">
        <DataFlowLoader message="Đang tải hồ sơ..." size="lg" />
      </div>
    )}
    {docsError && !docsLoading && (
      <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-center justify-between gap-2 border border-red-200">
        <span>{docsError}</span>
        <button type="button" onClick={onRefetch} className="text-xs font-semibold text-red-600 underline">Thử lại</button>
      </div>
    )}
    <div className="space-y-4">
      {!docsLoading && filteredDocs.map((doc) => (
        <div key={doc.id} onClick={() => onSelectDoc(doc)} className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 flex items-center gap-4 active:bg-slate-50 transition-colors cursor-pointer">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.isBottleneck ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
            {doc.isBottleneck ? <AlertCircle className="w-6 h-6" /> : <PackageCheck className="w-6 h-6" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-800 text-sm truncate">{doc.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-medium">#{doc.id}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CONFIG[doc.currentStatus].color}`}>{STATUS_CONFIG[doc.currentStatus].label}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      ))}

      {!docsLoading && !docsError && filteredDocs.length === 0 && (
        <div className="text-center py-12 px-6 bg-white rounded-2xl border border-slate-200 shadow-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-slate-500 text-sm">Không tìm thấy hồ sơ phù hợp</p>
        </div>
      )}
    </div>

    <div className="bg-slate-800 p-6 rounded-3xl text-white relative overflow-hidden mt-8 border border-slate-700 shadow-lg">
      <div className="relative z-10">
        <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">Hiệu quả luân chuyển</h4>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-3xl font-bold">
              {documents.length === 0 ? '--' : ((documents.filter((d) => d.currentStatus === 'COMPLETED').length / documents.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {documents.filter((d) => d.currentStatus === 'COMPLETED').length}/{documents.length} hoàn thành
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60 mb-1">Đang xử lý</p>
            <div className="text-2xl font-bold">{documents.filter((d) => d.currentStatus === 'PROCESSING').length}</div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
    </div>
  </div>
);

export default HomeTab;
