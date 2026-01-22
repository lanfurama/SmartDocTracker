import React from 'react';
import { Clock, QrCode, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { ScanHistory, ScanHistoryService } from '../../infrastructure/services/ScanHistoryService';

interface RecentScansProps {
    onScanSelect: (qrCode: string) => void;
}

const RecentScans: React.FC<RecentScansProps> = ({ onScanSelect }) => {
    const [history, setHistory] = React.useState<ScanHistory[]>([]);

    React.useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        const recent = ScanHistoryService.getRecent(5);
        setHistory(recent);
    };

    const handleClearHistory = () => {
        if (confirm('Xóa toàn bộ lịch sử quét?')) {
            ScanHistoryService.clear();
            setHistory([]);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Quét gần đây
                </h3>
                <button
                    onClick={handleClearHistory}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                    Xóa
                </button>
            </div>

            <div className="space-y-2">
                {history.map((scan) => (
                    <button
                        key={scan.id}
                        onClick={() => onScanSelect(scan.qrCode)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors text-left"
                    >
                        <div className={`p-2 rounded-lg ${scan.status === 'found' ? 'bg-green-50' : 'bg-orange-50'}`}>
                            {scan.status === 'found' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                                {scan.documentTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <QrCode className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-500 font-mono">{scan.qrCode}</span>
                            </div>
                        </div>

                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatTime(scan.timestamp)}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RecentScans;
