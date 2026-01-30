import React from 'react';

export type DataFlowLoaderSize = 'sm' | 'md' | 'lg' | 'xl';

interface DataFlowLoaderProps {
  message?: string;
  size?: DataFlowLoaderSize;
  overlay?: boolean;
  variant?: 'default' | 'onDark';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-12 h-12', text: 'text-xs' },
  md: { container: 'w-20 h-20', text: 'text-sm' },
  lg: { container: 'w-28 h-28', text: 'text-base' },
  xl: { container: 'w-36 h-36', text: 'text-lg' }
};

const DataFlowLoader: React.FC<DataFlowLoaderProps> = ({
  message,
  size = 'lg',
  overlay = false,
  variant = 'default',
  className = ''
}) => {
  const { container, text } = sizeMap[size];
  const isOnDark = variant === 'onDark';

  const content = (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className={`relative ${container} data-flow-loader ${isOnDark ? 'data-flow-on-dark' : ''}`}>
        {/* Diagonal bands - flowing ribbons */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="data-flow-band data-flow-band-1" />
          <div className="data-flow-band data-flow-band-2" />
          <div className="data-flow-band data-flow-band-3" />
        </div>
        {/* Circuit lines & nodes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="absolute w-full h-full opacity-60 data-flow-circuit"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 0 50 Q 25 30, 50 50 T 100 50"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="0.8"
              strokeDasharray="4 3"
              className="data-flow-path"
            />
            <path
              d="M 0 60 Q 50 20, 100 60"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="0.5"
              strokeOpacity="0.6"
              strokeDasharray="3 4"
              className="data-flow-path data-flow-path-delay"
            />
            <circle cx="20" cy="45" r="1.5" fill="#06b6d4" opacity="0.9" filter="url(#glow)" className="data-flow-dot" />
            <circle cx="50" cy="50" r="1.5" fill="#3b82f6" opacity="0.9" filter="url(#glow)" className="data-flow-dot data-flow-dot-delay" />
            <circle cx="80" cy="55" r="1.5" fill="#0ea5e9" opacity="0.9" filter="url(#glow)" className="data-flow-dot data-flow-dot-delay-2" />
          </svg>
        </div>
        {/* Document icons - flowing along */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="data-flow-doc data-flow-doc-1">
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none" className="text-cyan-100 drop-shadow-sm">
              <path d="M1 2h12v12H1V2z" stroke="currentColor" strokeWidth="1.2" fill="rgba(255,255,255,0.9)" />
              <path d="M3 5h8M3 8h6M3 11h4" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
            </svg>
          </div>
          <div className="data-flow-doc data-flow-doc-2">
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="text-blue-200 drop-shadow-sm">
              <path d="M0.5 1.5h9v9h-9V1.5z" stroke="currentColor" strokeWidth="1" fill="rgba(255,255,255,0.85)" />
              <path d="M2 4h6M2 6.5h4M2 9h3" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
            </svg>
          </div>
        </div>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 rounded-lg bg-gradient-to-br from-cyan-400/30 to-blue-500/30 flex items-center justify-center data-flow-pulse">
            <svg width="20" height="22" viewBox="0 0 14 16" fill="none" className="text-white drop-shadow-md">
              <path d="M1 2h12v12H1V2z" stroke="currentColor" strokeWidth="1.2" fill="rgba(255,255,255,0.95)" />
              <path d="M3 5h8M3 8h6M3 11h4" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>
      {message && (
        <p className={`font-medium ${text} animate-pulse ${isOnDark ? 'text-white/90' : 'text-slate-600'}`}>
          {message}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-slate-200 max-w-sm mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default DataFlowLoader;
