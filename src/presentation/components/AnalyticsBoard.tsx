
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const DATA_FLOW = [
  { name: 'Thứ 2', sl: 45 },
  { name: 'Thứ 3', sl: 52 },
  { name: 'Thứ 4', sl: 38 },
  { name: 'Thứ 5', sl: 65 },
  { name: 'Thứ 6', sl: 48 },
  { name: 'Thứ 7', sl: 25 },
];

const STATUS_DATA = [
  { name: 'Đúng hạn', value: 85, color: '#10b981' },
  { name: 'Trễ hạn', value: 15, color: '#ef4444' },
];

const AnalyticsBoard: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Tổng hồ sơ</span>
          </div>
          <div className="text-2xl font-bold">1,284</div>
          <div className="text-[10px] text-green-500 font-medium">+12% tháng này</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Điểm nghẽn</span>
          </div>
          <div className="text-2xl font-bold text-red-600">08</div>
          <div className="text-[10px] text-red-400 font-medium">Cần xử lý ngay</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Lưu lượng luân chuyển tuần</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA_FLOW}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8" />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="sl" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Tỷ lệ KPI xử lý</h3>
          <p className="text-xs text-slate-500">Trung bình 1.4 ngày/hồ sơ</p>
        </div>
        <div className="h-24 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={STATUS_DATA}
                innerRadius={25}
                outerRadius={40}
                paddingAngle={5}
                dataKey="value"
              >
                {STATUS_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Hiệu suất phòng ban</h3>
        {[
          { name: 'VP Đà Nẵng', perf: 98, color: 'bg-green-500' },
          { name: 'Phòng Kế toán', perf: 72, color: 'bg-orange-500' },
          { name: 'VP HCM', perf: 92, color: 'bg-green-500' },
        ].map(dept => (
          <div key={dept.name} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">{dept.name}</span>
            <div className="flex items-center gap-3 w-1/2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${dept.color}`} style={{ width: `${dept.perf}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{dept.perf}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsBoard;
