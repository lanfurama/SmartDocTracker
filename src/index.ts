// Domain
export { Document, LogEntry, PerformanceStats } from './domain/entities/Document';
export { isDocumentBottleneck, canReceiveDocument, canReturnDocument, canTransferDocument } from './domain/entities/Document';

// Shared
export { DocStatus, DEPARTMENTS, CATEGORIES, STATUS_CONFIG } from './shared/constants';
export { STATUS_ICONS } from './shared/config/statusUI';
export { generateDocId, formatTimestamp, formatTimeOnly, hoursAgo } from './shared/utils';

// Application
export { documentService } from './application/services/DocumentService';
export type { ActionType } from './application/useCases/documentActions';

// Presentation Hooks
export { useDocuments } from './presentation/hooks/useDocuments';
export { useAiInsights, useDocumentInsights } from './presentation/hooks/useAiInsights';
export { useScanner, useTabNavigation } from './presentation/hooks/useScanner';
export type { TabType } from './presentation/hooks/useScanner';
