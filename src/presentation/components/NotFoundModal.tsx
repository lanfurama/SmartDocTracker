import React from 'react';
import { AlertCircle, QrCode, PlusCircle, X } from 'lucide-react';

interface NotFoundModalProps {
    qrCode: string;
    onCreateNew: () => void;
    onScanAgain: () => void;
    onClose: () => void;
}

const NotFoundModal: React.FC<NotFoundModalProps> = ({
    qrCode,
    onCreateNew,
    onScanAgain,
    onClose
}) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="flex flex-col items-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                            <AlertCircle className="w-9 h-9" />
                        </div>
                        <h2 className="text-xl font-bold mb-1">Không tìm thấy hồ sơ</h2>
                        <p className="text-white/80 text-sm">Mã QR chưa được đăng ký trong hệ thống</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* QR Code Display */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <QrCode className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-500 font-medium">Mã đã quét</p>
                                <p className="text-sm font-bold text-slate-800 font-mono">{qrCode}</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                        <h3 className="text-sm font-bold text-blue-900 mb-2">💡 Bạn có thể:</h3>
                        <ul className="space-y-1 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Tạo hồ sơ mới với mã QR này</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Quét lại để kiểm tra lại mã</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={onCreateNew}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-all shadow-lg shadow-blue-200"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Tạo hồ sơ mới
                        </button>

                        <button
                            onClick={onScanAgain}
                            className="w-full bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-98 transition-all"
                        >
                            <QrCode className="w-5 h-5" />
                            Quét lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundModal;
