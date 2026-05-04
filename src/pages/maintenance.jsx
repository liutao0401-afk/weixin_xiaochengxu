// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { Settings, Search, Filter, Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis, useToast } from '@/components/ui';

import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const MAINT_STATUS = {
  in_progress: {
    label: '维修中',
    color: 'text-sky-500 bg-sky-50',
    icon: Clock
  },
  completed: {
    label: '已完成',
    color: 'text-brand-green bg-emerald-50',
    icon: CheckCircle
  }
};
export default function Maintenance(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [maintenances, setMaintenances] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const loadMaintenances = async () => {
    setLoading(true);
    try {
      const where = {};
      const andConditions = [];
      if (search) {
        andConditions.push({
          $or: [{
            sbbh: {
              $search: search
            }
          }, {
            sbmc: {
              $search: search
            }
          }]
        });
      }
      if (typeFilter !== 'all') {
        andConditions.push({
          sblx: {
            $eq: typeFilter
          }
        });
      }
      if (statusFilter !== 'all') {
        andConditions.push({
          sbzt: {
            $eq: statusFilter
          }
        });
      }
      if (andConditions.length > 0) {
        where.$and = andConditions;
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize,
          pageNumber: page,
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      setMaintenances(result?.records || []);
      setTotal(result?.total || 0);
    } catch (e) {
      toast({
        title: '加载维修记录失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadMaintenances();
  }, [page, pageSize, typeFilter, statusFilter]);
  const handleSearch = () => {
    setPage(1);
    loadMaintenances();
  };
  const openDetail = maint => {
    setSelectedMaintenance(maint);
    setDetailOpen(true);
  };
  const goToDevice = deviceId => {
    $w.utils.navigateTo({
      pageId: 'devices',
      params: {}
    });
  };
  const handleNavigate = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const totalPages = Math.ceil(total / pageSize);
  const paginationRange = useMemo(() => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);
  return <div className="flex h-screen bg-surface-primary">
      <Sidebar currentPage="maintenance" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="维修管理" description="跟踪维修任务进度，查看维修记录" />

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="搜索设备编号或名称..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-9 h-10 bg-slate-50 border-slate-200 focus:border-brand-amber" />
              </div>
              <Select value={typeFilter} onValueChange={v => {
              setTypeFilter(v);
              setPage(1);
            }}>
                <SelectTrigger className="w-[140px] h-10 bg-slate-50 border-slate-200">
                  <Filter size={16} className="mr-2 text-slate-400" />
                  <SelectValue placeholder="设备类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="1">灭火器</SelectItem>
                  <SelectItem value="2">电梯</SelectItem>
                  <SelectItem value="3">柴油机</SelectItem>
                  <SelectItem value="4">变压器</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={v => {
              setStatusFilter(v);
              setPage(1);
            }}>
                <SelectTrigger className="w-[140px] h-10 bg-slate-50 border-slate-200">
                  <SelectValue placeholder="设备状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="1">正常</SelectItem>
                  <SelectItem value="2">告警</SelectItem>
                  <SelectItem value="3">故障</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleSearch} className="h-10 border-brand-amber text-brand-amber hover:bg-amber-50">搜索</Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : maintenances.length === 0 ? <EmptyState icon={Settings} title="暂无维修记录" description="维修记录将从报修单自动创建" /> : <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">设备编号</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">设备名称</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">设备类型</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">规格型号</th>
                        <th className="text-center px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {maintenances.map(maint => <tr key={maint._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <button onClick={() => goToDevice(maint._id)} className="text-brand-amber hover:text-amber-600 font-medium text-sm">
                              {maint.sbbh}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-800 font-medium">{maint.sbmc}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">{maint.sblx === '1' ? '灭火器' : maint.sblx === '2' ? '电梯' : maint.sblx === '3' ? '柴油机' : '变压器'}</Badge>
                          </td>
                          <td className="px-5 py-3.5"><DeviceStatusBadge status={maint.sbzt} /></td>
                          <td className="px-5 py-3.5 text-sm text-slate-500">{maint.ggxh || '-'}</td>
                          <td className="px-5 py-3.5 text-center">
                            <Button variant="ghost" size="sm" className="text-xs hover:text-brand-amber" onClick={() => openDetail(maint)}>详情</Button>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>每页</span>
                    <Select value={String(pageSize)} onValueChange={v => {
                  setPageSize(Number(v));
                  setPage(1);
                }}>
                      <SelectTrigger className="w-[70px] h-8 border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span>条</span>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious onClock={() => setPage(p => Math.max(1, p - 1))} /></PaginationItem>
                      {paginationRange.map(p => <PaginationItem key={p}>
                          <PaginationLink onClock={() => setPage(p)} isActive={page === p}>{p}</PaginationLink>
                        </PaginationItem>)}
                      {totalPages > page + 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                      <PaginationItem><PaginationNext onClock={() => setPage(p => Math.min(totalPages, p + 1))} /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>}
          </div>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>维修详情 - {selectedMaintenance?.sbmc}</DialogTitle>
          </DialogHeader>
          {selectedMaintenance && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-400 mb-1">设备编号</p><p className="text-sm font-medium text-slate-800">{selectedMaintenance.sbbh}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">设备类型</p><p className="text-sm font-medium text-slate-800">{selectedMaintenance.sblx === '1' ? '灭火器' : selectedMaintenance.sblx === '2' ? '电梯' : selectedMaintenance.sblx === '3' ? '柴油机' : '变压器'}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">规格型号</p><p className="text-sm font-medium text-slate-800">{selectedMaintenance.ggxh || '-'}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">当前状态</p><DeviceStatusBadge status={selectedMaintenance.sbzt} size="lg" /></div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 mb-2">维修操作</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                toast({
                  title: '操作成功',
                  description: '已标记为维修完成'
                });
                setDetailOpen(false);
                loadMaintenances();
              }}>标记完成</Button>
                  <Button variant="outline" size="sm" className="text-xs" onClick={goToDevice.bind(null, selectedMaintenance._id)}>查看设备</Button>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}