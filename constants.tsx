
import React from 'react';
import { DocStatus } from './types';
import { 
  Send, 
  MapPin, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  RefreshCcw 
} from 'lucide-react';

export const DEPARTMENTS = [
  { id: 'KTO', label: 'Kế toán' },
  { id: 'HCH', label: 'Hành chính' },
  { id: 'NNS', label: 'Nhân sự' },
  { id: 'KDZ', label: 'Kinh doanh' },
  { id: 'TKT', label: 'Thiết kế' },
];

export const CATEGORIES = [
  { id: 'HDLD', label: 'Hợp đồng lao động' },
  { id: 'HDDV', label: 'Hợp đồng dịch vụ' },
  { id: 'QTTX', label: 'Quyết toán thuế' },
  { id: 'TTRH', label: 'Tạm ứng/Hoàn ứng' },
  { id: 'YCMU', label: 'Yêu cầu mua sắm' },
];

export const STATUS_MAP: Record<DocStatus, { 
  label: string, 
  color: string, 
  icon: React.ReactNode,
  step: number 
}> = {
  [DocStatus.SENDING]: { 
    label: 'Đang gửi đi', 
    color: 'text-blue-600 bg-blue-50', 
    icon: <Send className="w-4 h-4" />,
    step: 1
  },
  [DocStatus.TRANSIT_DA_NANG]: { 
    label: 'Đã đến Đà Nẵng', 
    color: 'text-orange-600 bg-orange-50', 
    icon: <MapPin className="w-4 h-4" />,
    step: 2
  },
  [DocStatus.TRANSIT_HCM]: { 
    label: 'Đã đến HCM', 
    color: 'text-purple-600 bg-purple-50', 
    icon: <MapPin className="w-4 h-4" />,
    step: 3
  },
  [DocStatus.PROCESSING]: { 
    label: 'Đang xử lý', 
    color: 'text-indigo-600 bg-indigo-50', 
    icon: <Settings className="w-4 h-4" />,
    step: 4
  },
  [DocStatus.COMPLETED]: { 
    label: 'Hoàn thành', 
    color: 'text-green-600 bg-green-50', 
    icon: <CheckCircle className="w-4 h-4" />,
    step: 5
  },
  [DocStatus.RETURNED]: { 
    label: 'Đã trả về', 
    color: 'text-red-600 bg-red-50', 
    icon: <RefreshCcw className="w-4 h-4" />,
    step: 0
  },
};

export const MOCK_DOCS: any[] = [
  {
    id: 'KTO-QTTX-0324-001',
    qrCode: 'KTO-QTTX-0324-001',
    title: 'Hồ sơ quyết toán thuế Q1-2024',
    department: 'KTO',
    category: 'QTTX',
    currentStatus: DocStatus.PROCESSING,
    currentHolder: 'Nguyễn Văn A',
    lastUpdate: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    isBottleneck: true,
    history: [
      { id: '1', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), action: 'Khởi tạo', location: 'VP Hà Nội', user: 'Trần B', type: 'in' },
      { id: '2', timestamp: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(), action: 'Nhập kho', location: 'VP Đà Nẵng', user: 'Lê C', type: 'in' },
      { id: '3', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), action: 'Bàn giao', location: 'Phòng Kế toán', user: 'Nguyễn Văn A', type: 'in', notes: 'Đang đợi kiểm duyệt' },
    ]
  },
  {
    id: 'NNS-HDLD-0424-042',
    qrCode: 'NNS-HDLD-0424-042',
    title: 'Hợp đồng lao động - Trần Nhân',
    department: 'NNS',
    category: 'HDLD',
    currentStatus: DocStatus.TRANSIT_HCM,
    currentHolder: 'Kho HCM',
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    isBottleneck: false,
    history: [
      { id: '1', timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), action: 'Khởi tạo', location: 'VP Hà Nội', user: 'Trần B', type: 'in' },
      { id: '2', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), action: 'Nhập kho', location: 'VP HCM', user: 'Phạm D', type: 'in' },
    ]
  }
];
