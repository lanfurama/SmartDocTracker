export enum DocStatus {
    SENDING = 'SENDING',
    TRANSIT_DA_NANG = 'TRANSIT_DA_NANG',
    TRANSIT_HCM = 'TRANSIT_HCM',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    RETURNED = 'RETURNED'
}

export const DEPARTMENTS = [
    { id: 'KTO', label: 'Kế toán' },
    { id: 'HCH', label: 'Hành chính' },
    { id: 'NNS', label: 'Nhân sự' },
    { id: 'KDZ', label: 'Kinh doanh' },
    { id: 'TKT', label: 'Thiết kế' },
] as const;

export const CATEGORIES = [
    { id: 'HDLD', label: 'Hợp đồng lao động' },
    { id: 'HDDV', label: 'Hợp đồng dịch vụ' },
    { id: 'QTTX', label: 'Quyết toán thuế' },
    { id: 'TTRH', label: 'Tạm ứng/Hoàn ứng' },
    { id: 'YCMU', label: 'Yêu cầu mua sắm' },
] as const;

export const STATUS_CONFIG: Record<DocStatus, {
    label: string;
    color: string;
    step: number;
}> = {
    [DocStatus.SENDING]: {
        label: 'Đang gửi đi',
        color: 'text-blue-600 bg-blue-50',
        step: 1
    },
    [DocStatus.TRANSIT_DA_NANG]: {
        label: 'Đã đến Đà Nẵng',
        color: 'text-orange-600 bg-orange-50',
        step: 2
    },
    [DocStatus.TRANSIT_HCM]: {
        label: 'Đã đến HCM',
        color: 'text-purple-600 bg-purple-50',
        step: 3
    },
    [DocStatus.PROCESSING]: {
        label: 'Đang xử lý',
        color: 'text-indigo-600 bg-indigo-50',
        step: 4
    },
    [DocStatus.COMPLETED]: {
        label: 'Hoàn thành',
        color: 'text-green-600 bg-green-50',
        step: 5
    },
    [DocStatus.RETURNED]: {
        label: 'Đã trả về',
        color: 'text-red-600 bg-red-50',
        step: 0
    },
};
