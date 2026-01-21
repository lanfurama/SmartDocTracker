import React from 'react';
import {
    Send,
    MapPin,
    Settings,
    CheckCircle,
    RefreshCcw
} from 'lucide-react';
import { DocStatus } from '../constants';

export const STATUS_ICONS: Record<DocStatus, React.ReactNode> = {
    [DocStatus.SENDING]: <Send className="w-4 h-4" />,
    [DocStatus.TRANSIT_DA_NANG]: <MapPin className="w-4 h-4" />,
    [DocStatus.TRANSIT_HCM]: <MapPin className="w-4 h-4" />,
    [DocStatus.PROCESSING]: <Settings className="w-4 h-4" />,
    [DocStatus.COMPLETED]: <CheckCircle className="w-4 h-4" />,
    [DocStatus.RETURNED]: <RefreshCcw className="w-4 h-4" />,
};
