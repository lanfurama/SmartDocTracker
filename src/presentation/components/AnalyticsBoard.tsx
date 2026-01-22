
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

const AnalyticsBoard: React.FC = () => {
  const { overview, timeline, departments, loading, error, lastUpdated, refresh } = useAnalytics();

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return '';
    const minutes = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (minutes === 0) return 'vừa xong';
    if (minutes === 1) return '1 phút trước';
    return `${minutes} phút trước`;
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 bg-slate-200 rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded w-24 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-2 bg-slate-100 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Bar chart skeleton */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-40 mb-4 animate-pulse"></div>
          <div className="h-48 flex items-end justify-around gap-2 px-4">
            {[40, 60, 35, 75, 50, 45, 30].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-slate-200 rounded-t animate-pulse"
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Pie chart skeleton */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded w-28 animate-pulse"></div>
          </div>
          <div className="w-24 h-24 rounded-full bg-slate-200 animate-pulse"></div>
        </div>

        {/* Department list skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded w-36 animate-pulse"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="h-3 bg-slate-200 rounded w-24 animate-pulse"></div>
              <div className="flex items-center gap-3 w-1/2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-8 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button
            onClick={refresh}
            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const STATUS_DATA = [
    { name: 'Đúng hạn', value: overview.completed, color: '#10b981' },
    { name: 'Đang xử lý', value: overview.processing, color: '#f59e0b' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Báo cáo phân tích</h2>
          {lastUpdated && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              Cập nhật {getTimeSinceUpdate()}
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Tổng hồ sơ</span>
          </div>
          <div className="text-2xl font-bold">{overview.totalDocs.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 font-medium">{overview.inTransit} đang luân chuyển</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Điểm nghẽn</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{overview.bottlenecks.toString().padStart(2, '0')}</div>
          <div className="text-[10px] text-red-400 font-medium">Cần xử lý ngay</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Lưu lượng luân chuyển tuần</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} stroke="#94a3b8" />
              <YAxis hide />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Trạng thái xử lý</h3>
          <p className="text-xs text-slate-500">{overview.completed} hoàn thành / {overview.totalDocs} tổng</p>
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
        {departments.map(dept => {
          const performanceColor = dept.performance >= 90 ? 'bg-green-500' : dept.performance >= 70 ? 'bg-orange-500' : 'bg-red-500';
          return (
            <div key={dept.department} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">{dept.department}</span>
              <div className="flex items-center gap-3 w-1/2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${performanceColor}`} style={{ width: `${dept.performance}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-500">{dept.performance}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsBoard;
