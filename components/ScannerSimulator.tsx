
import React, { useState, useEffect } from 'react';
import { Camera, X, Scan, Zap } from 'lucide-react';

interface ScannerSimulatorProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const ScannerSimulator: React.FC<ScannerSimulatorProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Simulate finding a code after 2 seconds
    const timer = setTimeout(() => {
      // Simulate a random code from our mock data or new
      const codes = ['QR001', 'QR002', 'NEW-DOC-' + Math.floor(Math.random() * 1000)];
      const picked = codes[Math.floor(Math.random() * codes.length)];
      onScan(picked);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
      <div className="absolute top-6 right-6">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-64 h-64 border-2 border-blue-500 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_2s_infinite]" />
        
        {/* Mock Camera Feed */}
        <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
           <Scan className="w-24 h-24 text-white/20" />
        </div>
      </div>

      <div className="mt-12 text-center px-8">
        <h3 className="text-xl font-bold mb-2">Đang quét mã QR/Barcode...</h3>
        <p className="text-white/60 text-sm">Hướng camera về phía mã định danh trên hồ sơ</p>
      </div>

      <div className="absolute bottom-12 flex space-x-8">
        <button className="flex flex-col items-center gap-2">
          <div className="p-4 bg-white/10 rounded-full">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xs">Đèn flash</span>
        </button>
        <button className="flex flex-col items-center gap-2">
          <div className="p-4 bg-white/10 rounded-full">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-xs">Chụp ảnh</span>
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(256px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ScannerSimulator;
