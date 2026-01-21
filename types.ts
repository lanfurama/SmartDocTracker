
export enum DocStatus {
  SENDING = 'SENDING',
  TRANSIT_DA_NANG = 'TRANSIT_DA_NANG',
  TRANSIT_HCM = 'TRANSIT_HCM',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  RETURNED = 'RETURNED'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  location: string;
  user: string;
  notes?: string;
  type: 'in' | 'out' | 'info' | 'error';
}

export interface Document {
  id: string;
  qrCode: string;
  title: string;
  description?: string;
  department?: string;
  category?: string;
  currentStatus: DocStatus;
  currentHolder: string;
  lastUpdate: string;
  createdAt: string;
  history: LogEntry[];
  isBottleneck: boolean;
}

export interface PerformanceStats {
  totalDocs: number;
  completed: number;
  inTransit: number;
  bottlenecks: number;
}
