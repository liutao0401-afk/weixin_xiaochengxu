// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { ClipboardList, Plus, Pencil, Trash2, Search, Play, Pause } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useToast } from '@/components/ui';

import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const FREQUENCY_OPTIONS = {
  '1': {
    label: '每天1次',
    timesPerDay: 1
  },
  '2': {
    label: '每天2次',
    timesPerDay: 2
  },
  '3': {
    label: '每天3次',
    timesPerDay: 3
  }
};
const PLAN_STATUS = {
  active: {
    label: '启用',
    color: 'text-brand-green bg-emerald-50'
  },
  paused: {
    label: '暂停',
    color: 'text-brand-amber bg-amber-50'
  },
  completed: {
    label: '已完成',
    color: 'text-slate-400 bg-slate-100'
  }
};
export default function InspectionPlans(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [plans, setPlans] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const form = useForm({
    defaultValues: {
      jhmc: '',
      mtcs: '1'
    }
  });
  const loadPlans = async () => {
    setLoading(true);
    try {
      const where = {};
      if (search) {
        where.$and = [{
          $or: [{
            jhmc: {
              $search: search
            }
          }]
        }];
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'xjjh_yn4ktqm',
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
      setPlans(result?.records || []);
      setTotal(result?.total || 0);
    } catch (e) {
      toast({
        title: '加载计划失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPlans();
  }, [page, pageSize]);
  const handleSearch = () => {
    setPage(1);
    loadPlans();
  };
  const handleCreate = async values => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'xjjh_yn4ktqm',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            jhmc: values.jhmc,
            mtcs: values.mtcs
          }
        }
      });
      toast({
        title: '添加成功',
        description: '计划 ' + values.jhmc + ' 已添加'
      });
      setAddOpen(false);
      form.reset();
      loadPlans();
    } catch (e) {
      toast({
        title: '添加失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const handleEdit = async values => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'xjjh_yn4ktqm',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: selectedPlan._id
                }
              }]
            }
          },
          data: {
            jhmc: values.jhmc,
            mtcs: values.mtcs
          }
        }
      });
      toast({
        title: '修改成功',
        description: '计划 ' + values.jhmc + ' 已更新'
      });
      setEditOpen(false);
      setSelectedPlan(null);
      form.reset();
      loadPlans();
    } catch (e) {
      toast({
        title: '修改失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async () => {
    if (!planToDelete) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'xjjh_yn4ktqm',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: planToDelete._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: '计划 ' + planToDelete.jhmc + ' 已删除'
      });
      setDeleteOpen(false);
      setPlanToDelete(null);
      loadPlans();
    } catch (e) {
      toast({
        title: '删除失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const openEdit = plan => {
    setSelectedPlan(plan);
    form.reset({
      jhmc: plan.jhmc || '',
      mtcs: plan.mtcs || '1'
    });
    setEditOpen(true);
  };
  const openDelete = plan => {
    setPlanToDelete(plan);
    setDeleteOpen(true);
  };
  const goToExecute = planId => {
    $w.utils.navigateTo({
      pageId: 'inspection-execute',
      params: {
        planId
      }
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
      <Sidebar currentPage="inspection-plans" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="巡检计划" description="管理巡检计划，设定巡检频率和关联巡检内容" actions={<Button onClick={() => {
          form.reset();
          setAddOpen(true);
        }} className="bg-brand-amber hover:bg-amber-600 text-white">
              <Plus size={16} className="mr-1.5" /> 添加计划
            </Button>} />

          {/* Search */}
          <div className="bg-white rounded-xl shadow-card p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="搜索计划名称..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-9 h-10 bg-slate-50 border-slate-200 focus:border-brand-amber" />
              </div>
              <Button variant="outline" size="sm" onClick={handleSearch} className="h-10 border-brand-amber text-brand-amber hover:bg-amber-50">搜索</Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : plans.length === 0 ? <EmptyState icon={ClipboardList} title="暂无计划" description="点击右上角添加巡检计划" /> : <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">计划名称</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">每天次数</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                        <th className="text-center px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {plans.map(plan => <tr key={plan._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 text-sm text-slate-800 font-medium">{plan.jhmc}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-600">{FREQUENCY_OPTIONS[plan.mtcs]?.label || plan.mtcs + '次/天'}</td>
                          <td className="px-5 py-3.5">
                            <Badge className={`text-xs ${PLAN_STATUS.active?.color}`}>启用</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-amber" onClick={() => openEdit(plan)}><Pencil size={14} /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-red" onClick={() => openDelete(plan)}><Trash2 size={14} /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-green" onClick={() => goToExecute(plan._id)} title="执行巡检"><Play size={14} /></Button>
                            </div>
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

      {/* Add Plan Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>添加计划</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="jhmc" render={({
              field
            }) => <FormItem><FormLabel>计划名称</FormLabel><FormControl><Input placeholder="如：日常巡检计划" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="mtcs" render={({
              field
            }) => <FormItem><FormLabel>每天次数</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1次</SelectItem>
                      <SelectItem value="2">2次</SelectItem>
                      <SelectItem value="3">3次</SelectItem>
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
                <Button type="submit" className="bg-brand-amber hover:bg-amber-600 text-white">确认添加</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={editOpen} onOpenChange={v => {
      setEditOpen(v);
      if (!v) {
        setSelectedPlan(null);
        form.reset();
      }
    }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>编辑计划</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <FormField control={form.control} name="jhmc" render={({
              field
            }) => <FormItem><FormLabel>计划名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="mtcs" render={({
              field
            }) => <FormItem><FormLabel>每天次数</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1次</SelectItem>
                      <SelectItem value="2">2次</SelectItem>
                      <SelectItem value="3">3次</SelectItem>
                    </SelectContent>
                  </Select>
                <FormMessage /></FormItem>} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
                <Button type="submit" className="bg-brand-amber hover:bg-amber-600 text-white">保存修改</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>确认删除</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 py-2">
            确定要删除计划 <span className="text-slate-800 font-medium">{planToDelete?.jhmc}</span> 吗？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}