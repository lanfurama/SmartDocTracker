import { Document, LogEntry } from '../../domain/entities/Document';
import { DocStatus } from '../../shared/constants';
import { generateStatusUpdateNote } from '../../infrastructure/api/geminiService';

export type ActionType = 'receive' | 'transfer' | 'return';

const STATUS_TRANSITIONS: Record<ActionType, DocStatus> = {
    receive: DocStatus.PROCESSING,
    transfer: DocStatus.TRANSIT_DA_NANG,
    return: DocStatus.RETURNED
};

const ACTION_LABELS: Record<ActionType, string> = {
    receive: 'Đã nhận hồ sơ',
    transfer: 'Đang chuyển đi',
    return: 'Trả hồ sơ (Lỗi/Thiếu sót)'
};

export interface ActionResult {
    success: boolean;
    document?: Document;
    error?: string;
}

export const executeDocumentAction = async (
    doc: Document,
    actionType: ActionType,
    note: string
): Promise<ActionResult> => {
    // Validation for return action
    if (actionType === 'return' && !note.trim()) {
        return {
            success: false,
            error: 'Vui lòng nhập lý do trả hồ sơ (lý do lỗi/thiếu sót).'
        };
    }

    const generatedNote = note || await generateStatusUpdateNote(
        ACTION_LABELS[actionType],
        doc.title
    );

    const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: ACTION_LABELS[actionType],
        location: 'Điểm chạm hiện tại',
        user: 'Nhân viên Tiếp nhận',
        notes: generatedNote,
        type: actionType === 'return' ? 'error' : 'in'
    };

    const updatedDoc: Document = {
        ...doc,
        currentStatus: STATUS_TRANSITIONS[actionType],
        lastUpdate: new Date().toISOString(),
        history: [newLog, ...doc.history]
    };

    return {
        success: true,
        document: updatedDoc
    };
};

export const createNewDocumentFromScan = (code: string): Document => {
    return {
        id: code,
        qrCode: code,
        title: 'Hồ sơ quét từ mã lạ',
        currentStatus: DocStatus.SENDING,
        currentHolder: 'Người giao',
        lastUpdate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isBottleneck: false,
        history: [{
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            action: 'Phát hiện mã lạ',
            location: 'Điểm quét',
            user: 'Admin',
            type: 'in'
        }]
    };
};
