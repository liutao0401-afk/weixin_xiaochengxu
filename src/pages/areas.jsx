// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Map, Plus, Pencil, Trash2, QrCode, Download, Printer } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useToast } from '@/components/ui';

import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
export default function Areas(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrArea, setQrArea] = useState(null);
  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      location: '',
      description: ''
    }
  });
  const loadAreas = async () => {
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
      setAreas(result?.records || []);
    } catch (e) {
      toast({
        title: '加载区域失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAreas();
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
            azdd: values.location,
            sbzt: '1'
          }
        }
      });
      toast({
        title: '添加成功',
        description: '区域 ' + values.name + ' 已添加'
      });
      setAddOpen(false);
      form.reset();
      loadAreas();
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
                  $eq: selectedArea._id
                }
              }]
            }
          },
          data: {
            sbmc: values.name,
            sbbh: values.code,
            azdd: values.location
          }
        }
      });
      toast({
        title: '修改成功',
        description: '区域 ' + values.name + ' 已更新'
      });
      setEditOpen(false);
      setSelectedArea(null);
      form.reset();
      loadAreas();
    } catch (e) {
      toast({
        title: '修改失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async () => {
    if (!areaToDelete) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: areaToDelete._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: '区域 ' + areaToDelete.sbmc + ' 已删除'
      });
      setDeleteOpen(false);
      setAreaToDelete(null);
      loadAreas();
    } catch (e) {
      toast({
        title: '删除失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const openEdit = area => {
    setSelectedArea(area);
    form.reset({
      name: area.sbmc || '',
      code: area.sbbh || '',
      location: area.azdd || '',
      description: ''
    });
    setEditOpen(true);
  };
  const openDelete = area => {
    setAreaToDelete(area);
    setDeleteOpen(true);
  };
  const showQrCode = area => {
    setQrArea(area);
    setQrOpen(true);
  };
  const handleNavigate = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const qrData = qrArea ? JSON.stringify({
    type: 'area',
    id: qrArea._id,
    code: qrArea.sbbh,
    name: qrArea.sbmc
  }) : '';
  return <div className="flex h-screen bg-surface-primary">
      <Sidebar currentPage="areas" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="巡检区域" description="管理巡检区域，生成区域专属二维码供巡检扫码签到" actions={<Button onClick={() => {
          form.reset();
          setAddOpen(true);
        }} className="bg-brand-amber hover:bg-amber-600 text-white">
                <Plus size={16} className="mr-1.5" /> 添加区域
              </Button>} />

          {/* Area Cards */}
          {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : areas.length === 0 ? <EmptyState icon={Map} title="暂无区域" description="点击右上角添加区域开始管理" /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {areas.map(area => <div key={area._id} className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-brand-amber to-brand-amber-light" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-slate-800">{area.sbmc}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">编码: {area.sbbh}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-amber" onClick={() => openEdit(area)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-red" onClick={() => openDelete(area)}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{area.azdd || '无位置信息'}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs border-brand-amber/30 text-brand-amber hover:bg-amber-50" onClick={() => showQrCode(area)}>
                        <QrCode size={14} className="mr-1" /> 二维码
                      </Button>
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
      </main>

      {/* Add Area Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加区域</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem><FormLabel>区域名称</FormLabel><FormControl><Input placeholder="如：东区" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem><FormLabel>区域编码</FormLabel><FormControl><Input placeholder="如：A01" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="location" render={({
              field
            }) => <FormItem><FormLabel>位置描述</FormLabel><FormControl><Input placeholder="如：1号楼一层" {...field} /></FormControl><FormMessage /></FormItem>} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
                <Button type="submit" className="bg-brand-amber hover:bg-amber-600 text-white">确认添加</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Area Dialog */}
      <Dialog open={editOpen} onOpenChange={v => {
      setEditOpen(v);
      if (!v) {
        setSelectedArea(null);
        form.reset();
      }
    }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑区域</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem><FormLabel>区域名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem><FormLabel>区域编码</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="location" render={({
              field
            }) => <FormItem><FormLabel>位置描述</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
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
            确定要删除区域 <span className="text-slate-800 font-medium">{areaToDelete?.sbmc}</span> 吗？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>区域二维码 - {qrArea?.sbmc}</DialogTitle>
          </DialogHeader>
          {qrArea && <div className="flex flex-col items-center py-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-md">
                {/* QR Code would be rendered here */}
                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                  <QrCode size={64} className="text-slate-400" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">扫描此二维码可进入该区域巡检签到</p>
              <p className="text-xs text-slate-500 mt-2 break-all">数据: {qrData}</p>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download size={14} className="mr-1" /> 下载PNG
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Printer size={14} className="mr-1" /> 打印
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}