// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { Wrench, Plus, Search, Filter, AlertCircle, Clock, CheckCircle } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useToast } from '@/components/ui';

import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
const PRIORITY_MAP = {
  low: {
    label: '低',
    color: 'text-slate-500 bg-slate-100',
    icon: Clock
  },
  medium: {
    label: '中',
    color: 'text-brand-amber bg-amber-50',
    icon: AlertCircle
  },
  high: {
    label: '高',
    color: 'text-brand-red bg-red-50',
    icon: AlertCircle
  }
};
const STATUS_MAP = {
  pending: {
    label: '待处理',
    color: 'text-brand-amber bg-amber-50'
  },
  processing: {
    label: '处理中',
    color: 'text-sky-500 bg-sky-50'
  },
  completed: {
    label: '已完成',
    color: 'text-brand-green bg-emerald-50'
  },
  cancelled: {
    label: '已取消',
    color: 'text-slate-400 bg-slate-100'
  }
};
export default function Repairs(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const form = useForm({
    defaultValues: {
      deviceCode: '',
      deviceName: '',
      description: '',
      priority: 'medium'
    }
  });

  // Mock data for repairs since there's no dedicated repair data model
  const loadRepairs = async () => {
    setLoading(true);
    try {
      // Fetch fault devices as repair items
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: statusFilter === 'all' ? {} : {
              $and: [{
                sbzt: {
                  $eq: '3'
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 200,
          pageNumber: 1,
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      const devices = result?.records || [];
      const filteredDevices = devices.filter(d => {
        if (search) {
          return d.sbmc && d.sbmc.includes(search) || d.sbbh && d.sbbh.includes(search);
        }
        return true;
      });

      // Map devices to repair-like objects
      const repairItems = filteredDevices.map(d => ({
        _id: d._id,
        code: 'R' + d.sbbh,
        deviceCode: d.sbbh,
        deviceName: d.sbmc,
        description: d.sbzt === '3' ? '设备故障告警' : '设备异常',
        priority: d.sbzt === '3' ? 'high' : 'medium',
        status: d.sbzt === '3' ? 'pending' : 'processing',
        createTime: d.createdAt
      }));
      setRepairs(repairItems);
      setTotal(repairItems.length);
    } catch (e) {
      toast({
        title: '加载报修失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadRepairs();
  }, []);
  const handleNavigate = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const handleCreate = async values => {
    toast({
      title: '报修已提交',
      description: '设备 ' + values.deviceName + ' 的报修单已创建'
    });
    setAddOpen(false);
    form.reset();
  };
  const openDetail = repair => {
    setSelectedRepair(repair);
    setDetailOpen(true);
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
      <Sidebar currentPage="repairs" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="报修管理" description="管理设备报修单，跟踪报修处理进度" actions={<Button onClick={() => {
          form.reset();
          setAddOpen(true);
        }} className="bg-brand-amber hover:bg-amber-600 text-white">
                <Plus size={16} className="mr-1.5" /> 新建报修
              </Button>} />

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="搜索设备编号或名称..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadRepairs()} className="pl-9 h-10 bg-slate-50 border-slate-200 focus:border-brand-amber" />
              </div>
              <Select value={statusFilter} onValueChange={v => {
              setStatusFilter(v);
            }}>
                <SelectTrigger className="w-[140px] h-10 bg-slate-50 border-slate-200">
                  <Filter size={16} className="mr-2 text-slate-400" />
                  <SelectValue placeholder="报修状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待处理</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="completed">已完成</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadRepairs} className="h-10 border-brand-amber text-brand-amber hover:bg-amber-50">
                搜索
              </Button>
            </div>
          </div>

          {/* Repairs Table */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : repairs.length === 0 ? <EmptyState icon={Wrench} title="暂无报修" description="故障设备将显示在此，或点击新建报修" /> : <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">报修编号</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">设备编号</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">设备名称</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">故障描述</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">优先级</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                        <th className="text-center px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {repairs.map(repair => {
                    const priority = PRIORITY_MAP[repair.priority] || PRIORITY_MAP.medium;
                    const status = STATUS_MAP[repair.status] || STATUS_MAP.pending;
                    return <tr key={repair._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              <button onClick={() => openDetail(repair)} className="text-brand-amber hover:text-amber-600 font-medium text-sm">{repair.code}</button>
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600">{repair.deviceCode}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-800 font-medium">{repair.deviceName}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-600">{repair.description}</td>
                            <td className="px-5 py-3.5">
                              <Badge variant="outline" className={`border-0 text-xs ${priority.color}`}>{priority.label}</Badge>
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge variant="outline" className={`border-0 text-xs ${status.color}`}>{status.label}</Badge>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <Button variant="ghost" size="sm" className="hover:text-brand-amber" onClick={() => openDetail(repair)}>查看</Button>
                            </td>
                          </tr>;
                  })}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-center px-5 py-4 border-t border-slate-100">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClock={() => setPage(p => Math.max(1, p - 1))} />
                      </PaginationItem>
                      {paginationRange.map(p => <PaginationItem key={p}>
                          <PaginationLink onClock={() => setPage(p)} isActive={page === p}>{p}</PaginationLink>
                        </PaginationItem>)}
                      <PaginationItem>
                        <PaginationNext onClock={() => setPage(p => Math.min(totalPages, p + 1))} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>}
          </div>
        </div>
      </main>

      {/* Add Repair Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>新建报修单</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="deviceCode" render={({
              field
            }) => <FormItem><FormLabel>设备编号</FormLabel><FormControl><Input placeholder="如：PT-001" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="deviceName" render={({
              field
            }) => <FormItem><FormLabel>设备名称</FormLabel><FormControl><Input placeholder="如：压力变送器" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="description" render={({
              field
            }) => <FormItem><FormLabel>故障描述</FormLabel><FormControl><Textarea placeholder="请描述故障情况..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="priority" render={({
              field
            }) => <FormItem><FormLabel>优先级</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">低</SelectItem>
                      <SelectItem value="medium">中</SelectItem>
                      <SelectItem value="high">高</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
                <Button type="submit" className="bg-brand-amber hover:bg-amber-600 text-white">提交报修</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>报修详情 - {selectedRepair?.code}</DialogTitle>
          </DialogHeader>
          {selectedRepair && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-400 mb-1">报修编号</p><p className="text-sm font-medium text-slate-800">{selectedRepair.code}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">设备编号</p><p className="text-sm font-medium text-slate-800">{selectedRepair.deviceCode}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">设备名称</p><p className="text-sm font-medium text-slate-800">{selectedRepair.deviceName}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">优先级</p>
                  <Badge variant="outline" className={`border-0 text-xs ${(PRIORITY_MAP[selectedRepair.priority] || PRIORITY_MAP.medium).color}`}>
                    {(PRIORITY_MAP[selectedRepair.priority] || PRIORITY_MAP.medium).label}
                  </Badge>
                </div>
                <div><p className="text-xs text-slate-400 mb-1">状态</p>
                  <Badge variant="outline" className={`border-0 text-xs ${(STATUS_MAP[selectedRepair.status] || STATUS_MAP.pending).color}`}>
                    {(STATUS_MAP[selectedRepair.status] || STATUS_MAP.pending).label}
                  </Badge>
                </div>
              </div>
              <div><p className="text-xs text-slate-400 mb-2">故障描述</p><p className="text-sm text-slate-700">{selectedRepair.description}</p></div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}