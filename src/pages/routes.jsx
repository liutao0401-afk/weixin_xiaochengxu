// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Route, Plus, Pencil, Trash2, Map } from 'lucide-react';
// @ts-ignore;
import { Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useToast, Input } from '@/components/ui';

import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
export default function Routes(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      areas: '',
      description: ''
    }
  });
  const loadRoutes = async () => {
    setLoading(true);
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                sblx: {
                  $eq: '5'
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
      setRoutes(result?.records || []);
    } catch (e) {
      toast({
        title: '加载线路失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadRoutes();
  }, []);
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
            azdd: values.areas,
            sbzt: '1'
          }
        }
      });
      toast({
        title: '添加成功',
        description: '线路 ' + values.name + ' 已添加'
      });
      setAddOpen(false);
      form.reset();
      loadRoutes();
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
                  $eq: selectedRoute._id
                }
              }]
            }
          },
          data: {
            sbmc: values.name,
            sbbh: values.code,
            azdd: values.areas
          }
        }
      });
      toast({
        title: '修改成功',
        description: '线路 ' + values.name + ' 已更新'
      });
      setEditOpen(false);
      setSelectedRoute(null);
      form.reset();
      loadRoutes();
    } catch (e) {
      toast({
        title: '修改失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async () => {
    if (!routeToDelete) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: routeToDelete._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: '线路 ' + routeToDelete.sbmc + ' 已删除'
      });
      setDeleteOpen(false);
      setRouteToDelete(null);
      loadRoutes();
    } catch (e) {
      toast({
        title: '删除失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const openEdit = route => {
    setSelectedRoute(route);
    form.reset({
      name: route.sbmc || '',
      code: route.sbbh || '',
      areas: route.azdd || '',
      description: ''
    });
    setEditOpen(true);
  };
  const openDelete = route => {
    setRouteToDelete(route);
    setDeleteOpen(true);
  };
  const handleNavigate = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  return <div className="flex h-screen bg-surface-primary">
      <Sidebar currentPage="routes" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="巡检线路" description="管理巡检线路，每条线路包含若干巡检区域" actions={<Button onClick={() => {
          form.reset();
          setAddOpen(true);
        }} className="bg-brand-amber hover:bg-amber-600 text-white">
              <Plus size={16} className="mr-1.5" /> 添加线路
            </Button>} />

          {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : routes.length === 0 ? <EmptyState icon={Route} title="暂无线路" description="点击右上角添加线路开始管理" /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {routes.map(route => <div key={route._id} className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-teal-400 to-emerald-400" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-slate-800">{route.sbmc}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">编码: {route.sbbh}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-amber" onClick={() => openEdit(route)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-red" onClick={() => openDelete(route)}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Map size={14} />
                      <span>{route.azdd || '无区域信息'}</span>
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
      </main>

      {/* Add Route Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>添加线路</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem><FormLabel>线路名称</FormLabel><FormControl><Input placeholder="如：A区巡检线路" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem><FormLabel>线路编码</FormLabel><FormControl><Input placeholder="如：RT-A01" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="areas" render={({
              field
            }) => <FormItem><FormLabel>包含区域</FormLabel><FormControl><Input placeholder="如：东区、西区" {...field} /></FormControl><FormMessage /></FormItem>} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
                <Button type="submit" className="bg-brand-amber hover:bg-amber-600 text-white">确认添加</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Route Dialog */}
      <Dialog open={editOpen} onOpenChange={v => {
      setEditOpen(v);
      if (!v) {
        setSelectedRoute(null);
        form.reset();
      }
    }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>编辑线路</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem><FormLabel>线路名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem><FormLabel>线路编码</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="areas" render={({
              field
            }) => <FormItem><FormLabel>包含区域</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
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
            确定要删除线路 <span className="text-slate-800 font-medium">{routeToDelete?.sbmc}</span> 吗？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}