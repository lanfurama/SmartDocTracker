import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, Loader } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerSimulatorProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const ScannerSimulator: React.FC<ScannerSimulatorProps> = ({ onScan, onClose }) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = useRef(false);
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    // Prevent double initialization
    if (isScanning.current) return;

    const startScanner = async () => {
      try {
        isScanning.current = true;
        setIsLoading(true);
        setCameraError(null);

        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create Html5Qrcode instance
        const html5QrCode = new Html5Qrcode(qrCodeRegionId);
        scannerRef.current = html5QrCode;

        // Configuration for scanner
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        };

        // Success callback
        const qrCodeSuccessCallback = (decodedText: string) => {
          console.log(`QR Code detected: ${decodedText}`);

          // Haptic feedback (vibration on mobile)
          if ('vibrate' in navigator) {
            navigator.vibrate(200); // 200ms vibration
          }

          // Visual success feedback
          setIsLoading(true); // Show success state

          // Stop scanner and close
          if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
              // Small delay to show success feedback
              setTimeout(() => {
                onScan(decodedText);
              }, 300);
            }).catch(console.error);
          }
        };

        // Start scanning with back camera
        await html5QrCode.start(
          { facingMode: "environment" }, // Use back camera
          config,
          qrCodeSuccessCallback,
          undefined // Error callback not needed
        );

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to start scanner:", err);
        setIsLoading(false);
        isScanning.current = false;

        const errorMessage = err instanceof Error ? err.message : String(err);

        if (errorMessage.includes('Permission') || errorMessage.includes('NotAllowed')) {
          setCameraError('📷 Chưa cấp quyền camera\n\nVào Cài đặt → Quyền ứng dụng → Bật Camera');
        } else if (errorMessage.includes('NotFound')) {
          setCameraError('📷 Không tìm thấy camera\n\nThiết bị của bạn có thể không có camera hoặc camera đang được ứng dụng khác sử dụng');
        } else {
          setCameraError('⚠️ Không thể khởi động camera\n\nVui lòng thử lại hoặc nhập mã QR thủ công bên dưới');
        }
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      if (scannerRef.current && isScanning.current) {
        scannerRef.current.stop().catch(err => {
          console.error("Failed to stop scanner:", err);
        });
        isScanning.current = false;
      }
    };
  }, []); // Empty dependency array

  const handleClose = () => {
    if (scannerRef.current && isScanning.current) {
      scannerRef.current.stop().then(() => {
        onClose();
      }).catch(() => {
        onClose();
      });
    } else {
      onClose();
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
      {/* Close button */}
      <div className="absolute top-6 right-6 z-10">
        <button onClick={handleClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scanner container */}
      <div className="flex flex-col items-center justify-center w-full max-w-md px-4">
        {/* QR Reader element */}
        <div
          id={qrCodeRegionId}
          className="w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{ display: cameraError ? 'none' : 'block' }}
        ></div>

        {/* Loading state */}
        {isLoading && !cameraError && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-12 h-12 animate-spin mb-4 text-blue-500" />
            <p className="text-white/80">Đang khởi động camera...</p>
          </div>
        )}

        {/* Error state */}
        {cameraError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-white font-medium mb-4 whitespace-pre-line">{cameraError}</p>

            {/* Manual input fallback */}
            <div className="mb-4">
              <input
                id="manual-qr-input"
                type="text"
                placeholder="QR001"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-blue-500 mb-3"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('manual-qr-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    onScan(input.value.trim());
                  }
                }}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors active:scale-95"
              >
                Quét
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!cameraError && !isLoading && (
          <div className="mt-8 text-center px-8">
            <h3 className="text-xl font-bold mb-2">Quét mã QR/Barcode</h3>
            <p className="text-white/60 text-sm">Đặt mã trong khung hình để quét tự động</p>
          </div>
        )}
      </div>

      {/* Camera icon decoration */}
      {!cameraError && (
        <div className="absolute bottom-12 flex items-center gap-2 text-white/40">
          <Camera className="w-4 h-4" />
          <span className="text-xs">Camera đang hoạt động</span>
        </div>
      )}
    </div>
  );
};

export default ScannerSimulator;
