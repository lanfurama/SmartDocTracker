import React from 'react';
import { QrCode, LayoutDashboard, TrendingUp, FileText, Info } from 'lucide-react';
import type { TabType } from '../../hooks/useScanner';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onScan: () => void;
}

const NavButton: React.FC<{ tab: TabType; activeTab: TabType; onSelect: () => void; icon: React.ReactNode; label: string }> = ({ tab, activeTab, onSelect, icon, label }) => (
  <button onClick={onSelect} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab ? 'text-blue-600' : 'text-slate-400'}`}>
    <div className={`p-1.5 rounded-xl ${activeTab === tab ? 'bg-blue-50' : ''}`}>{icon}</div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onScan }) => (
  <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t-2 border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-around px-4 pt-3 pb-8 z-40">
    <NavButton tab="home" activeTab={activeTab} onSelect={() => onTabChange('home')} icon={<LayoutDashboard className="w-5 h-5" />} label="Giám sát" />
    <NavButton tab="analytics" activeTab={activeTab} onSelect={() => onTabChange('analytics')} icon={<TrendingUp className="w-5 h-5" />} label="Báo cáo" />
    <div className="relative -mt-16 group">
      <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-40 group-active:scale-95 transition-all" />
      <button onClick={onScan} className="relative w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl group-active:scale-95 transition-all">
        <QrCode className="w-7 h-7" />
      </button>
    </div>
    <NavButton tab="creator" activeTab={activeTab} onSelect={() => onTabChange('creator')} icon={<FileText className="w-5 h-5" />} label="Khởi tạo" />
    <NavButton tab="support" activeTab={activeTab} onSelect={() => onTabChange('support')} icon={<Info className="w-5 h-5" />} label="Hỗ trợ" />
  </nav>
);

export default BottomNav;
