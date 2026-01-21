import React, { useState } from 'react';
import {
  Search,
  QrCode,
  LayoutDashboard,
  PlusCircle,
  ChevronRight,
  Bell,
  User,
  ArrowLeft,
  Info,
  Truck,
  PackageCheck,
  RotateCcw,
  Sparkles,
  AlertCircle,
  TrendingUp,
  FileText,
  AlignLeft
} from 'lucide-react';

// Clean Architecture imports
import { Document } from './src/domain/entities/Document';
import { DocStatus, STATUS_CONFIG } from './src/shared/constants';
import { STATUS_ICONS } from './src/shared/config/statusUI';
import { useDocuments } from './src/presentation/hooks/useDocuments';
import { useDocumentInsights } from './src/presentation/hooks/useAiInsights';
import { useScanner, useTabNavigation } from './src/presentation/hooks/useScanner';
import { documentRepository } from './src/infrastructure/repositories/DocumentRepository';
import { MOCK_DOCUMENTS } from './src/shared/mocks/mockDocuments';

// Components
import ScannerSimulator from './src/presentation/components/ScannerSimulator';
import TrackingTimeline from './src/presentation/components/TrackingTimeline';
import AnalyticsBoard from './src/presentation/components/AnalyticsBoard';
import CreatorPortal from './src/presentation/components/CreatorPortal';

const App: React.FC = () => {
  // Hooks
  const { activeTab, setActiveTab } = useTabNavigation('home');
  const { showScanner, openScanner, closeScanner } = useScanner();
  const [initialDocs, setInitialDocs] = useState<Document[]>(MOCK_DOCUMENTS);

  // Load initial docs - DISABLED FOR MOCK MODE
  /*
  React.useEffect(() => {
    documentRepository.getAll().then(docs => setInitialDocs(docs));
  }, []);
  */

  const {
    documents,
    selectedDoc,
    searchQuery,
    filteredDocs,
    setSearchQuery,
    selectDoc,
    addDocument,
    handleScanResult,
    handleDocAction
  } = useDocuments(initialDocs);

  const { insights: aiInsights, loading: loadingAi } = useDocumentInsights(selectedDoc);

  // Modal state
  const [showActionModal, setShowActionModal] = useState<'receive' | 'transfer' | 'return' | null>(null);
  const [note, setNote] = useState('');

  // Handle scan
  const onScan = (code: string) => {
    closeScanner();
    handleScanResult(code);
  };

  // Handle action
  const onAction = async (type: 'receive' | 'transfer' | 'return') => {
    const result = await handleDocAction(type, note);
    if (!result.success && result.error) {
      alert(result.error);
      return;
    }
    setShowActionModal(null);
    setNote('');
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 relative shadow-2xl overflow-hidden">

      {/* Header */}
      <header className="bg-white px-6 pt-8 pb-4 sticky top-0 z-30 border-b border-slate-100">
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
          <div className="flex gap-2">
            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'home' && !selectedDoc && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Nhập mã hồ sơ hoặc tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/80 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
            />
          </div>
        )}

        {selectedDoc && (
          <button
            onClick={() => selectDoc(null)}
            className="flex items-center gap-2 text-slate-500 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        {selectedDoc ? (
          <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
            {/* Doc Detail Header */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              {selectedDoc.isBottleneck && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                  Điểm nghẽn
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Mã vận đơn: {selectedDoc.id}</p>
                  <h2 className="text-lg font-bold text-slate-800 leading-snug break-words">{selectedDoc.title}</h2>
                  {selectedDoc.description && (
                    <div className="mt-2 flex items-start gap-2 text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <AlignLeft className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                      <p className="text-xs italic leading-relaxed">{selectedDoc.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_CONFIG[selectedDoc.currentStatus].color}`}>
                  {STATUS_ICONS[selectedDoc.currentStatus]}
                  {STATUS_CONFIG[selectedDoc.currentStatus].label}
                </div>
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(STATUS_CONFIG[selectedDoc.currentStatus].step / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Insight Box */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-2xl shadow-xl shadow-blue-200 text-white relative">
              <Sparkles className="absolute top-4 right-4 w-6 h-6 text-white/20" />
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-white/20 rounded-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">AI Phân tích hành trình</span>
              </div>
              {loadingAi ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm italic text-white/60">Đang phân tích thông minh...</span>
                </div>
              ) : (
                <p className="text-sm font-medium leading-relaxed">
                  {aiInsights || "Sẵn sàng phân tích dữ liệu luân chuyển của hồ sơ này."}
                </p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-slate-800">Lịch sử di chuyển</h3>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Cập nhật: {new Date(selectedDoc.lastUpdate).toLocaleTimeString()}</span>
              </div>
              <TrackingTimeline history={selectedDoc.history} />
            </div>

            {/* Action Buttons Floating */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
              <div className="bg-white/80 backdrop-blur-md p-3 rounded-3xl shadow-2xl border border-white/50 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowActionModal('receive')}
                  className="flex-1 min-w-[80px] bg-blue-600 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <PackageCheck className="w-4 h-4" /> NHẬN
                </button>
                <button
                  onClick={() => setShowActionModal('transfer')}
                  className="flex-1 min-w-[80px] bg-slate-800 text-white py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Truck className="w-4 h-4" /> CHUYỂN
                </button>
                <button
                  onClick={() => setShowActionModal('return')}
                  className="flex-1 min-w-[80px] bg-red-50 text-red-600 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" /> TRẢ VỀ
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Hồ sơ luân chuyển</h3>
                  <button className="text-xs font-semibold text-blue-600">Xem tất cả</button>
                </div>

                <div className="space-y-4">
                  {filteredDocs.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => selectDoc(doc)}
                      className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.isBottleneck ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        {doc.isBottleneck ? <AlertCircle className="w-6 h-6" /> : <PackageCheck className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{doc.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-medium">#{doc.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_CONFIG[doc.currentStatus].color}`}>
                            {STATUS_CONFIG[doc.currentStatus].label}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  ))}

                  {filteredDocs.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 text-sm">Không tìm thấy hồ sơ phù hợp</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats Summary */}
                <div className="bg-slate-800 p-6 rounded-3xl text-white relative overflow-hidden mt-8">
                  <div className="relative z-10">
                    <h4 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4">Hiệu quả luân chuyển</h4>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-3xl font-bold">94.2%</div>
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> +2.4% tuần này
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60 mb-1">Xử lý đúng hạn</p>
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-800 overflow-hidden">
                              <img src={`https://picsum.photos/32/32?random=${i}`} alt="user" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && <AnalyticsBoard />}

            {activeTab === 'creator' && (
              <CreatorPortal
                documents={documents}
                onCreate={(d) => addDocument(d)}
                onSelectDoc={selectDoc}
              />
            )}
          </>
        )}
      </main>

      {/* Action Modals */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {showActionModal === 'receive' ? 'Xác nhận nhận hồ sơ' :
                showActionModal === 'transfer' ? 'Chuyển hồ sơ đi' : 'Trả hồ sơ (Cần ghi chú lý do)'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Bạn đang thực hiện thao tác cập nhật trạng thái cho hồ sơ <b>{selectedDoc?.id}</b>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                  {showActionModal === 'return' ? 'Lý do trả hồ sơ (Bắt buộc)' : 'Ghi chú (Tùy chọn)'}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={showActionModal === 'return' ? "Nhập chi tiết lý do trả về (ví dụ: thiếu chữ ký, sai thông tin)..." : "Nhập lý do hoặc thông tin thêm..."}
                  className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 ${showActionModal === 'return' && !note.trim() ? 'border-red-300' : 'border-slate-200'}`}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowActionModal(null); setNote(''); }}
                  className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-600 text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={() => onAction(showActionModal)}
                  className={`flex-1 py-4 rounded-2xl font-bold text-white text-sm ${showActionModal === 'return' ? 'bg-red-600 shadow-lg shadow-red-100' : 'bg-blue-600 shadow-lg shadow-blue-100'}`}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 flex items-center justify-around px-4 pt-3 pb-8 z-40">
        <button
          onClick={() => { setActiveTab('home'); selectDoc(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'home' ? 'bg-blue-50' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Giám sát</span>
        </button>

        <button
          onClick={() => { setActiveTab('analytics'); selectDoc(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'analytics' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'analytics' ? 'bg-blue-50' : ''}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Báo cáo</span>
        </button>

        {/* Floating Scan Button */}
        <div className="relative -mt-16 group">
          <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 group-active:scale-95 transition-all"></div>
          <button
            onClick={openScanner}
            className="relative w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl group-active:scale-95 transition-all"
          >
            <QrCode className="w-7 h-7" />
          </button>
        </div>

        <button
          onClick={() => { setActiveTab('creator'); selectDoc(null); }}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'creator' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-1.5 rounded-xl ${activeTab === 'creator' ? 'bg-blue-50' : ''}`}>
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Khởi tạo</span>
        </button>

        <button
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <div className="p-1.5">
            <Info className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Hỗ trợ</span>
        </button>
      </nav>

      {/* Scanner Layer */}
      {showScanner && (
        <ScannerSimulator
          onScan={onScan}
          onClose={closeScanner}
        />
      )}
    </div>
  );
};

export default App;
