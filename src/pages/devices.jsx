// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { Cpu, Search, Plus, Pencil, Trash2, X, Filter } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useToast } from '@/components/ui';
// @ts-ignore;
import { getDeviceTypeLabel, getDeviceStatusLabel, formatDate } from '@/lib/utils';

import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
import EmptyState from '@/components/EmptyState';
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200];
export default function Devices(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [devices, setDevices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const form = useForm({
    defaultValues: {
      sbmc: '',
      sbbh: '',
      sblx: '1',
      ggxh: '',
      azdd: '',
      sccs: '',
      sbzt: '1'
    }
  });
  const loadDevices = async () => {
    setLoading(true);
    try {
      const where = {};
      const andConditions = [];
      if (search) {
        andConditions.push({
          $or: [{
            sbmc: {
              $search: search
            }
          }, {
            sbbh: {
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
      setDevices(result?.records || []);
      setTotal(result?.total || 0);
    } catch (e) {
      toast({
        title: '加载设备失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDevices();
  }, [page, pageSize, typeFilter, statusFilter]);
  const handleSearch = () => {
    setPage(1);
    loadDevices();
  };
  const handleCreate = async values => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            sbmc: values.sbmc,
            sbbh: values.sbbh,
            sblx: values.sblx,
            ggxh: values.ggxh,
            azdd: values.azdd,
            sccs: values.sccs,
            sbzt: values.sbzt
          }
        }
      });
      toast({
        title: '添加成功',
        description: '设备 ' + values.sbmc + ' 已添加'
      });
      setAddOpen(false);
      form.reset();
      loadDevices();
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
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: selectedDevice._id
                }
              }]
            }
          },
          data: {
            sbmc: values.sbmc,
            sbbh: values.sbbh,
            sblx: values.sblx,
            ggxh: values.ggxh,
            azdd: values.azdd,
            sccs: values.sccs,
            sbzt: values.sbzt
          }
        }
      });
      toast({
        title: '修改成功',
        description: '设备 ' + values.sbmc + ' 已更新'
      });
      setEditOpen(false);
      setSelectedDevice(null);
      form.reset();
      loadDevices();
    } catch (e) {
      toast({
        title: '修改失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async () => {
    if (!deviceToDelete) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: deviceToDelete._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: '设备 ' + deviceToDelete.sbmc + ' 已删除'
      });
      setDeleteOpen(false);
      setDeviceToDelete(null);
      loadDevices();
    } catch (e) {
      toast({
        title: '删除失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const openEdit = device => {
    setSelectedDevice(device);
    form.reset({
      sbmc: device.sbmc || '',
      sbbh: device.sbbh || '',
      sblx: device.sblx || '1',
      ggxh: device.ggxh || '',
      azdd: device.azdd || '',
      sccs: device.sccs || '',
      sbzt: device.sbzt || '1'
    });
    setEditOpen(true);
  };
  const openDelete = device => {
    setDeviceToDelete(device);
    setDeleteOpen(true);
  };
  const openDetail = device => {
    setSelectedDevice(device);
    setDetailOpen(true);
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
      <Sidebar currentPage="devices" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="设备台账" description="管理所有巡检设备信息，包括设备类型、状态、巡检计划等" actions={<Button onClick={() => {
          form.reset();
          setAddOpen(true);
        }} className="bg-brand-amber hover:bg-amber-600 text-white">
                <Plus size={16} className="mr-1.5" /> 添加设备
              </Button>} />

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="搜索设备名称或编号..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-9 h-10 bg-slate-50 border-slate-200 focus:border-brand-amber" />
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
              <Button variant="outline" size="sm" onClick={handleSearch} className="h-10 border-brand-amber text-brand-amber hover:bg-amber-50">
                搜索
              </Button>
            </div>
          </div>

          {/* Device Table */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : devices.length === 0 ? <EmptyState icon={Cpu} title="暂无设备" description="点击右上角添加设备按钮开始录入" /> : <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">设备编号</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">设备名称</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">设备类型</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">规格型号</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">安装地点</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">启用日期</th>
                        <th className="text-center px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {devices.map(device => <tr key={device._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <button onClick={() => openDetail(device)} className="text-brand-amber hover:text-amber-600 font-medium text-sm">
                              {device.sbbh}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-800 font-medium">{device.sbmc}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">{getDeviceTypeLabel(device.sblx)}</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600">{device.ggxh || '-'}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-600">{device.azdd || '-'}</td>
                          <td className="px-5 py-3.5"><DeviceStatusBadge status={device.sbzt} /></td>
                          <td className="px-5 py-3.5 text-sm text-slate-500">{formatDate(device.qyrq)}</td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-amber" onClick={() => openEdit(device)}><Pencil size={14} /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-red" onClick={() => openDelete(device)}><Trash2 size={14} /></Button>
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
                      <SelectTrigger className="w-[70px] h-8 border-slate-200 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span>条</span>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClock={() => setPage(p => Math.max(1, p - 1))} />
                      </PaginationItem>
                      {paginationRange.map(p => <PaginationItem key={p}>
                          <PaginationLink onClock={() => setPage(p)} isActive={page === p}>
                            {p}
                          </PaginationLink>
                        </PaginationItem>)}
                      {totalPages > page + 2 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
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

      {/* Add Device Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>添加设备</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="sbmc" render={({
              field
            }) => <FormItem><FormLabel>设备名称</FormLabel><FormControl><Input placeholder="如：压力变送器" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="sbbh" render={({
              field
            }) => <FormItem><FormLabel>设备编号</FormLabel><FormControl><Input placeholder="如：PT-001" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="sblx" render={({
              field
            }) => <FormItem><FormLabel>设备类型</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">灭火器</SelectItem>
                      <SelectItem value="2">电梯</SelectItem>
                      <SelectItem value="3">柴油机</SelectItem>
                      <SelectItem value="4">变压器</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>} />
              <FormField control={form.control} name="ggxh" render={({
              field
            }) => <FormItem><FormLabel>规格型号</FormLabel><FormControl><Input placeholder="如：KSD11-021" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="azdd" render={({
              field
            }) => <FormItem><FormLabel>安装地点</FormLabel><FormControl><Input placeholder="如：1号楼" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="sccs" render={({
              field
            }) => <FormItem><FormLabel>生产厂商</FormLabel><FormControl><Input placeholder="如：上海xxx制造有限公司" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="sbzt" render={({
              field
            }) => <FormItem><FormLabel>设备状态</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">正常</SelectItem>
                      <SelectItem value="2">告警</SelectItem>
                      <SelectItem value="3">故障</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
                <Button type="submit" className="bg-brand-amber hover:bg-amber-600 text-white">确认添加</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={editOpen} onOpenChange={v => {
      setEditOpen(v);
      if (!v) {
        setSelectedDevice(null);
        form.reset();
      }
    }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑设备</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <FormField control={form.control} name="sbmc" render={({
              field
            }) => <FormItem><FormLabel>设备名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="sbbh" render={({
              field
            }) => <FormItem><FormLabel>设备编号</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="sblx" render={({
              field
            }) => <FormItem><FormLabel>设备类型</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">灭火器</SelectItem>
                      <SelectItem value="2">电梯</SelectItem>
                      <SelectItem value="3">柴油机</SelectItem>
                      <SelectItem value="4">变压器</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>} />
              <FormField control={form.control} name="ggxh" render={({
              field
            }) => <FormItem><FormLabel>规格型号</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="azdd" render={({
              field
            }) => <FormItem><FormLabel>安装地点</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="sccs" render={({
              field
            }) => <FormItem><FormLabel>生产厂商</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="sbzt" render={({
              field
            }) => <FormItem><FormLabel>设备状态</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">正常</SelectItem>
                      <SelectItem value="2">告警</SelectItem>
                      <SelectItem value="3">故障</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>} />
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
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 py-2">
            确定要删除设备 <span className="text-slate-800 font-medium">{deviceToDelete?.sbmc}</span>（{deviceToDelete?.sbbh}）吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>设备详情 - {selectedDevice?.sbmc}</DialogTitle>
          </DialogHeader>
          {selectedDevice && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-400 mb-1">设备编号</p><p className="text-sm font-medium text-slate-800">{selectedDevice.sbbh}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">设备类型</p><p className="text-sm font-medium text-slate-800">{getDeviceTypeLabel(selectedDevice.sblx)}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">规格型号</p><p className="text-sm font-medium text-slate-800">{selectedDevice.ggxh || '-'}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">安装地点</p><p className="text-sm font-medium text-slate-800">{selectedDevice.azdd || '-'}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">生产厂商</p><p className="text-sm font-medium text-slate-800">{selectedDevice.sccs || '-'}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">启用日期</p><p className="text-sm font-medium text-slate-800">{formatDate(selectedDevice.qyrq)}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">当前状态</p><DeviceStatusBadge status={selectedDevice.sbzt} size="lg" /></div>
              </div>
              {selectedDevice.sbzp && <div>
                  <p className="text-xs text-slate-400 mb-2">设备照片</p>
                  <img src={selectedDevice.sbzp} alt="设备照片" className="w-full rounded-lg border border-slate-200" />
                </div>}
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}