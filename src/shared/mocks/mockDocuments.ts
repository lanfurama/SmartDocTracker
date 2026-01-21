import { Document } from '../../domain/entities/Document';
import { DocStatus } from '../constants';

export const MOCK_DOCUMENTS: Document[] = [
    {
        id: 'KTO-HDLD-1025-001',
        qrCode: 'KTO-HDLD-1025-001',
        title: 'Hợp đồng lao động - Nguyễn Văn A',
        description: 'Hợp đồng lao động thử việc cho nhân viên mới bộ phận IT',
        department: 'KTO',
        category: 'HDLD',
        currentStatus: DocStatus.SENDING,
        currentHolder: 'Nguyen Thu Huong (HR)',
        lastUpdate: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isBottleneck: false,
        history: [
            {
                id: '1',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                action: 'Khởi tạo hồ sơ',
                location: 'Văn phòng Đà Nẵng',
                user: 'Nguyen Thu Huong (HR)',
                type: 'in',
                notes: 'Khởi tạo mới'
            }
        ]
    },
    {
        id: 'KDZ-HDDV-1025-042',
        qrCode: 'KDZ-HDDV-1025-042',
        title: 'Hợp đồng dịch vụ CleanHouse',
        description: 'Gia hạn hợp đồng dịch vụ vệ sinh năm 2025',
        department: 'KDZ',
        category: 'HDDV',
        currentStatus: DocStatus.TRANSIT_HCM,
        currentHolder: 'Dịch vụ vận chuyển',
        lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        isBottleneck: false,
        history: [
            {
                id: '1',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                action: 'Khởi tạo hồ sơ',
                location: 'Văn phòng Đà Nẵng',
                user: 'Tran Thi B (Sales)',
                type: 'in'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
                action: 'Chuyển đi HCM',
                location: 'Văn phòng Đà Nẵng',
                user: 'Le Van C (Admin)',
                type: 'out',
                notes: 'Gửi chuyển phát nhanh'
            }
        ]
    },
    {
        id: 'TKT-YCMU-1025-112',
        qrCode: 'TKT-YCMU-1025-112',
        title: 'Mua sắm thiết bị Dell Server',
        description: 'Đề xuất mua sắm server mới cho dự án Data Center',
        department: 'TKT',
        category: 'YCMU',
        currentStatus: DocStatus.PROCESSING,
        currentHolder: 'Truong Phong IT',
        lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        isBottleneck: true,
        history: [
            {
                id: '1',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
                action: 'Khởi tạo',
                location: 'Phòng IT',
                user: 'Dev A',
                type: 'in'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
                action: 'Nhận hồ sơ',
                location: 'Phòng IT',
                user: 'Manager B',
                type: 'in',
                notes: 'Đang xem xét báo giá'
            }
        ]
    }
];
