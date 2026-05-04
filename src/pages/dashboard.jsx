// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Cpu, ClipboardCheck, AlertTriangle, Wrench, Activity, BarChart3, Eye } from 'lucide-react';
// @ts-ignore;
import { Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { formatDateTime, getDeviceStatusLabel, getDeviceStatusColor, getInspectionResultLabel } from '@/lib/utils';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatsCard from '@/components/StatsCard';
import Sidebar from '@/components/Sidebar';
const TREND_DATA = [{
  day: '周一',
  count: 12
}, {
  day: '周二',
  count: 18
}, {
  day: '周三',
  count: 15
}, {
  day: '周四',
  count: 22
}, {
  day: '周五',
  count: 19
}, {
  day: '周六',
  count: 8
}, {
  day: '周日',
  count: 5
}];
const STATUS_COLORS = ['#10B981', '#F59E0B', '#EF4444'];
export default function Dashboard(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    deviceCount: 0,
    todayInspection: 0,
    warningDevices: 0,
    pendingRepairs: 0
  });
  const [recentInspections, setRecentInspections] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([{
    name: '正常',
    value: 0
  }, {
    name: '告警',
    value: 0
  }, {
    name: '故障',
    value: 0
  }]);
  const [totalInspections, setTotalInspections] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      const deviceResult = await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {}
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 200,
          pageNumber: 1
        }
      });
      const devices = deviceResult?.records || [];
      const deviceCount = deviceResult?.total || devices.length;
      const warningDevices = devices.filter(d => d.sbzt === '2').length;
      const faultDevices = devices.filter(d => d.sbzt === '3').length;
      setStats({
        deviceCount,
        todayInspection: 0,
        warningDevices,
        pendingRepairs: 0
      });
      setStatusDistribution([{
        name: '正常',
        value: devices.filter(d => d.sbzt === '1').length
      }, {
        name: '告警',
        value: warningDevices
      }, {
        name: '故障',
        value: faultDevices
      }]);
      const inspectionResult = await $w.cloud.callDataSource({
        dataSourceName: 'xjd_etu4dhc',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {}
          },
          select: {
            $master: true
          },
          getCount: true,
          orderBy: [{
            xjsj: 'desc'
          }],
          pageSize: 5,
          pageNumber: 1
        }
      });
      const inspections = inspectionResult?.records || [];
      setTotalInspections(inspectionResult?.total || 0);
      setRecentInspections(inspections);
      setStats(prev => ({
        ...prev,
        todayInspection: inspectionResult?.total || 0
      }));
    } catch (e) {
      toast({
        title: '数据加载失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleNavigate = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  return <div className="flex h-screen bg-surface-primary">
      <Sidebar currentPage="dashboard" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="mb-8 bg-gradient-to-r from-brand-dark to-slate-750 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581094271901-2d3a6a6e0e6a?w=800&q=80')] opacity-10 bg-cover bg-center" />
            <div className="relative z-10">
              <h2 className="text-2xl font-heading font-bold">设备巡检管理系统</h2>
              <p className="text-slate-300 mt-1 text-sm">欢迎回来，{$w.auth.currentUser?.name || '访客'}。今日巡检概览如下。</p>
            </div>
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-brand-amber/20 rounded-full blur-2xl" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="设备总数" value={stats.deviceCount} icon={Cpu} color="amber" trend="up" trendValue="较上周+2" />
            <StatsCard title="累计巡检" value={stats.todayInspection} icon={ClipboardCheck} color="green" />
            <StatsCard title="告警设备" value={stats.warningDevices} icon={AlertTriangle} color="red" />
            <StatsCard title="待处理报修" value={stats.pendingRepairs} icon={Wrench} color="blue" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 7-Day Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-slate-800">7日巡检趋势</h3>
                <Activity size={18} className="text-brand-amber" />
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{
                    fontSize: 12,
                    fill: '#64748B'
                  }} />
                    <YAxis tickLine={false} axisLine={false} tick={{
                    fontSize: 12,
                    fill: '#64748B'
                  }} />
                    <Tooltip contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} />
                    <Area type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-slate-800">设备状态分布</h3>
                <BarChart3 size={18} className="text-brand-amber" />
              </div>
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={2} stroke="#fff">
                      {statusDistribution.map((entry, index) => <Cell key={index} fill={STATUS_COLORS[index]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {statusDistribution.map((item, i) => <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{
                  backgroundColor: STATUS_COLORS[i]
                }} />
                    <span className="text-slate-600">{item.name}</span>
                    <span className="text-slate-400 ml-1">{item.value}</span>
                  </div>)}
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Inspections */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-slate-800">最近巡检记录</h3>
                <Button variant="ghost" size="sm" onClick={() => handleNavigate('inspection-records')}>
                  查看全部
                </Button>
              </div>
              {recentInspections.length === 0 ? <p className="text-sm text-slate-400 py-4 text-center">暂无巡检记录</p> : <div className="space-y-3">
                  {recentInspections.slice(0, 5).map(record => <div key={record._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.xjjg === '2' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                          <ClipboardCheck size={16} className={record.xjjg === '2' ? 'text-brand-green' : 'text-brand-red'} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{record.xjbh}</p>
                          <p className="text-xs text-slate-400">{formatDateTime(record.xjsj)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`border-0 text-xs ${record.xjjg === '2' ? 'text-brand-green bg-emerald-50' : 'text-brand-red bg-red-50'}`}>
                        {getInspectionResultLabel(record.xjjg)}
                      </Badge>
                    </div>)}
                </div>}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-heading font-semibold text-slate-800 mb-4">快捷操作</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-slate-200 hover:border-brand-amber hover:text-brand-amber" onClick={() => handleNavigate('inspection-execute')}>
                  <ClipboardCheck size={20} />
                  <span className="text-xs font-medium">开始巡检</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-slate-200 hover:border-brand-amber hover:text-brand-amber" onClick={() => handleNavigate('repairs')}>
                  <Wrench size={20} />
                  <span className="text-xs font-medium">提交报修</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-slate-200 hover:border-brand-amber hover:text-brand-amber" onClick={() => handleNavigate('devices')}>
                  <Cpu size={20} />
                  <span className="text-xs font-medium">设备台账</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex-col gap-1 border-slate-200 hover:border-brand-amber hover:text-brand-amber" onClick={() => handleNavigate('areas')}>
                  <Eye size={20} />
                  <span className="text-xs font-medium">查看区域</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>;
}