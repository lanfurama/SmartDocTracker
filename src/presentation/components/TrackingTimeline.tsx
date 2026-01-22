
import React from 'react';
import { LogEntry } from '../../../domain/entities/Document';
import { Circle, Clock, User, MapPin } from 'lucide-react';

interface TrackingTimelineProps {
  history: LogEntry[];
}

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ history }) => {
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-slate-300 before:to-slate-100">
      {sortedHistory.map((log, index) => (
        <div key={log.id} className="relative flex items-start ml-10">
          <div className={`absolute -left-10 mt-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${index === 0 ? 'bg-blue-600 scale-125' : 'bg-slate-400'}`}>
            {index === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
          </div>

          <div className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-slate-800">{log.action}</h4>
              <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-blue-500" />
                <span>{log.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-blue-500" />
                <span>Nhân viên: <b>{log.user}</b></span>
              </div>
              {log.notes && (
                <div className="mt-2 p-2 bg-blue-50/50 rounded-lg text-blue-700 italic border-l-2 border-blue-200">
                  "{log.notes}"
                </div>
              )}
            </div>

            <div className="mt-2 text-[10px] text-slate-400">
              {new Date(log.timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackingTimeline;
