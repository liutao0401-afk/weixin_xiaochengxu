// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { User, Plus, Pencil, Trash2, Search, Phone, Mail } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useToast } from '@/components/ui';

import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
const PAGE_SIZE_OPTIONS = [10, 20, 50];
export default function Staffs(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      phone: '',
      team: ''
    }
  });
  const loadStaffs = async () => {
    setLoading(true);
    try {
      const where = {};
      const andConditions = [];
      andConditions.push({
        sblx: {
          $eq: '5'
        }
      });
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
      setStaffs(result?.records || []);
      setTotal(result?.total || 0);
    } catch (e) {
      toast({
        title: '加载人员失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadStaffs();
  }, [page, pageSize]);
  const handleSearch = () => {
    setPage(1);
    loadStaffs();
  };
  const handleCreate = async values => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            sbmc: values.name,
            sbbh: values.code,
            sblx: '5',
            ggxh: values.phone,
            sccs: values.team,
            sbzt: '1'
          }
        }
      });
      toast({
        title: '添加成功',
        description: '人员 ' + values.name + ' 已添加'
      });
      setAddOpen(false);
      form.reset();
      loadStaffs();
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
                  $eq: selectedStaff._id
                }
              }]
            }
          },
          data: {
            sbmc: values.name,
            sbbh: values.code,
            ggxh: values.phone,
            sccs: values.team
          }
        }
      });
      toast({
        title: '修改成功',
        description: '人员 ' + values.name + ' 已更新'
      });
      setEditOpen(false);
      setSelectedStaff(null);
      form.reset();
      loadStaffs();
    } catch (e) {
      toast({
        title: '修改失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async () => {
    if (!staffToDelete) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: staffToDelete._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: '人员 ' + staffToDelete.sbmc + ' 已删除'
      });
      setDeleteOpen(false);
      setStaffToDelete(null);
      loadStaffs();
    } catch (e) {
      toast({
        title: '删除失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const openEdit = staff => {
    setSelectedStaff(staff);
    form.reset({
      name: staff.sbmc || '',
      code: staff.sbbh || '',
      phone: staff.ggxh || '',
      team: staff.sccs || ''
    });
    setEditOpen(true);
  };
  const openDelete = staff => {
    setStaffToDelete(staff);
    setDeleteOpen(true);
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
      <Sidebar currentPage="staffs" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="巡检人员" description="管理巡检人员信息，分配巡检班组" actions={<Button onClick={() => {
          form.reset();
          setAddOpen(true);
        }} className="bg-brand-amber hover:bg-amber-600 text-white">
              <Plus size={16} className="mr-1.5" /> 添加人员
            </Button>} />

          {/* Search */}
          <div className="bg-white rounded-xl shadow-card p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="搜索姓名或编号..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-9 h-10 bg-slate-50 border-slate-200 focus:border-brand-amber" />
              </div>
              <Button variant="outline" size="sm" onClick={handleSearch} className="h-10 border-brand-amber text-brand-amber hover:bg-amber-50">搜索</Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : staffs.length === 0 ? <EmptyState icon={User} title="暂无人员" description="点击右上角添加巡检人员" /> : <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">编号</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">姓名</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">电话</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">班组</th>
                        <th className="text-center px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffs.map(staff => <tr key={staff._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5 text-sm text-slate-500 font-medium">{staff.sbbh}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-800 font-medium">{staff.sbmc}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-600">{staff.ggxh || '-'}</td>
                          <td className="px-5 py-3.5">
                            <Badge variant="outline" className="text-xs border-slate-200 text-slate-600">{staff.sccs || '未分配'}</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-amber" onClick={() => openEdit(staff)}><Pencil size={14} /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-red" onClick={() => openDelete(staff)}><Trash2 size={14} /></Button>
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

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>添加人员</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem><FormLabel>姓名</FormLabel><FormControl><Input placeholder="如：张三" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem><FormLabel>人员编号</FormLabel><FormControl><Input placeholder="如：IP-001" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="phone" render={({
              field
            }) => <FormItem><FormLabel>联系电话</FormLabel><FormControl><Input placeholder="如：138xxxx" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="team" render={({
              field
            }) => <FormItem><FormLabel>所属班组</FormLabel><FormControl><Input placeholder="如：早班巡检组" {...field} /></FormControl><FormMessage /></FormItem>} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
                <Button type="submit" className="bg-brand-amber hover:bg-amber-600 text-white">确认添加</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editOpen} onOpenChange={v => {
      setEditOpen(v);
      if (!v) {
        setSelectedStaff(null);
        form.reset();
      }
    }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>编辑人员</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem><FormLabel>姓名</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem><FormLabel>人员编号</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="phone" render={({
              field
            }) => <FormItem><FormLabel>联系电话</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="team" render={({
              field
            }) => <FormItem><FormLabel>所属班组</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
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
            确定要删除人员 <span className="text-slate-800 font-medium">{staffToDelete?.sbmc}</span> 吗？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}