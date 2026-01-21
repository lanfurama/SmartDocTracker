
import React, { useState } from 'react';
import { Plus, Printer, QrCode, Search, CheckCircle2, ChevronRight, MapPin, Clock, AlignLeft } from 'lucide-react';
import { Document } from '../../../domain/entities/Document';
import { DocStatus, DEPARTMENTS, CATEGORIES, STATUS_CONFIG } from '../../../shared/constants';
import { STATUS_ICONS } from '../../../shared/config/statusUI';

interface CreatorPortalProps {
  documents: Document[];
  onCreate: (doc: Document) => void;
  onSelectDoc: (doc: Document) => void;
}

const CreatorPortal: React.FC<CreatorPortalProps> = ({ documents, onCreate, onSelectDoc }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: DEPARTMENTS[0].id,
    category: CATEGORIES[0].id
  });
  const [showPrintModal, setShowPrintModal] = useState<Document | null>(null);

  const generateId = () => {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    const serial = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `${formData.department}-${formData.category}-${mm}${yy}-${serial}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = generateId();
    const newDoc: Document = {
      id: newId,
      qrCode: newId,
      title: formData.title,
      description: formData.description,
      department: formData.department,
      category: formData.category,
      currentStatus: DocStatus.SENDING,
      currentHolder: 'Người khởi tạo',
      lastUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isBottleneck: false,
      history: [{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: 'Khởi tạo hồ sơ',
        location: 'Điểm khởi tạo',
        user: 'Người dùng hiện tại',
        notes: formData.description || 'Khởi tạo hồ sơ mới',
        type: 'in'
      }]
    };
    onCreate(newDoc);
    setIsCreating(false);
    setShowPrintModal(newDoc);
    setFormData({ title: '', description: '', department: DEPARTMENTS[0].id, category: CATEGORIES[0].id });
  };

  const myDocs = documents.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-4 space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <h2 className="text-xl font-bold text-slate-800">Quản lý Khởi tạo</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Creation Form Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
          <div className="bg-white w-full rounded-3xl p-6 animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Tạo hồ sơ mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tên hồ sơ</label>
                <input
                  autoFocus
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ví dụ: Hợp đồng đại lý X"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Ghi chú ban đầu</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Nhập nội dung ghi chú cho hồ sơ..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Phòng ban</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl p-4 text-sm"
                  >
                    {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Loại chứng từ</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl p-4 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-400 hover:text-slate-600"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-bold shadow-xl shadow-blue-100"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-blue-600/90 p-6 backdrop-blur-sm">
          <div className="bg-white w-full rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-50 p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <QrCode className="w-32 h-32 text-white" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 opacity-50 animate-pulse"></div>
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-1">{showPrintModal.id}</h4>
              <p className="text-slate-500 text-sm">{showPrintModal.title}</p>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(null);
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl"
              >
                <Printer className="w-5 h-5" /> In mã QR (Mini Printer)
              </button>
              <button
                onClick={() => setShowPrintModal(null)}
                className="w-full py-4 text-slate-400 font-bold text-sm"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Documents List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">Theo dõi hiện trạng</h3>
        {myDocs.map(doc => (
          <div
            key={doc.id}
            onClick={() => onSelectDoc(doc)}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 active:bg-slate-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-blue-600 mb-1">{doc.id}</p>
                <h4 className="font-bold text-slate-800 truncate">{doc.title}</h4>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${STATUS_CONFIG[doc.currentStatus].color}`}>
                {STATUS_CONFIG[doc.currentStatus].label}
              </div>
            </div>

            {doc.description && (
              <div className="flex items-start gap-2 bg-slate-50/50 p-2 rounded-xl">
                <AlignLeft className="w-3 h-3 text-slate-400 mt-1 shrink-0" />
                <p className="text-[10px] text-slate-500 italic line-clamp-2">{doc.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Vị trí hiện tại</p>
                  <p className="text-[10px] font-bold text-slate-700">{doc.currentHolder}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Cập nhật lúc</p>
                  <p className="text-[10px] font-bold text-slate-700">
                    {new Date(doc.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden mr-4">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${(STATUS_CONFIG[doc.currentStatus].step / 5) * 100}%` }}
                />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}

        {myDocs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm px-8">Bạn chưa khởi tạo hồ sơ nào. Bấm nút + để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorPortal;
