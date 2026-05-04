// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Users, Plus, Pencil, Trash2, User } from 'lucide-react';
// @ts-ignore;
import { Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useToast, Input } from '@/components/ui';

import { useForm } from 'react-hook-form';
import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
export default function Teams(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      leader: '',
      memberCount: '',
      description: ''
    }
  });
  const loadTeams = async () => {
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
      setTeams(result?.records || []);
    } catch (e) {
      toast({
        title: '加载班组失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadTeams();
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
            ggxh: values.leader,
            sccs: values.memberCount,
            sbzt: '1'
          }
        }
      });
      toast({
        title: '添加成功',
        description: '班组 ' + values.name + ' 已添加'
      });
      setAddOpen(false);
      form.reset();
      loadTeams();
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
                  $eq: selectedTeam._id
                }
              }]
            }
          },
          data: {
            sbmc: values.name,
            sbbh: values.code,
            ggxh: values.leader,
            sccs: values.memberCount
          }
        }
      });
      toast({
        title: '修改成功',
        description: '班组 ' + values.name + ' 已更新'
      });
      setEditOpen(false);
      setSelectedTeam(null);
      form.reset();
      loadTeams();
    } catch (e) {
      toast({
        title: '修改失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async () => {
    if (!teamToDelete) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: teamToDelete._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: '班组 ' + teamToDelete.sbmc + ' 已删除'
      });
      setDeleteOpen(false);
      setTeamToDelete(null);
      loadTeams();
    } catch (e) {
      toast({
        title: '删除失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const openEdit = team => {
    setSelectedTeam(team);
    form.reset({
      name: team.sbmc || '',
      code: team.sbbh || '',
      leader: team.ggxh || '',
      memberCount: team.sccs || '',
      description: ''
    });
    setEditOpen(true);
  };
  const openDelete = team => {
    setTeamToDelete(team);
    setDeleteOpen(true);
  };
  const handleNavigate = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  return <div className="flex h-screen bg-surface-primary">
      <Sidebar currentPage="teams" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="巡检班组" description="管理巡检班组，每个班组包含班组长和若干巡检人员" actions={<Button onClick={() => {
          form.reset();
          setAddOpen(true);
        }} className="bg-brand-amber hover:bg-amber-600 text-white">
              <Plus size={16} className="mr-1.5" /> 添加班组
            </Button>} />

          {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : teams.length === 0 ? <EmptyState icon={Users} title="暂无班组" description="点击右上角添加班组开始管理" /> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map(team => <div key={team._id} className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group">
                  <div className="h-2 bg-gradient-to-r from-sky-400 to-indigo-400" />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-heading font-semibold text-slate-800">{team.sbmc}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">编码: {team.sbbh}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-amber" onClick={() => openEdit(team)}><Pencil size={14} /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-brand-red" onClick={() => openDelete(team)}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User size={14} />
                        <span>班组长: {team.ggxh || '未指定'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users size={14} />
                        <span>成员: {team.sccs || '0'} 人</span>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>
      </main>

      {/* Add Team Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>添加班组</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem><FormLabel>班组名称</FormLabel><FormControl><Input placeholder="如：早班巡检组" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem><FormLabel>班组编码</FormLabel><FormControl><Input placeholder="如：TM-A01" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="leader" render={({
              field
            }) => <FormItem><FormLabel>班组长</FormLabel><FormControl><Input placeholder="如：张三" {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="memberCount" render={({
              field
            }) => <FormItem><FormLabel>成员数量</FormLabel><FormControl><Input placeholder="如：5" {...field} /></FormControl><FormMessage /></FormItem>} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
                <Button type="submit" className="bg-brand-amber hover:bg-amber-600 text-white">确认添加</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={editOpen} onOpenChange={v => {
      setEditOpen(v);
      if (!v) {
        setSelectedTeam(null);
        form.reset();
      }
    }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>编辑班组</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem><FormLabel>班组名称</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="code" render={({
              field
            }) => <FormItem><FormLabel>班组编码</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="leader" render={({
              field
            }) => <FormItem><FormLabel>班组长</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="memberCount" render={({
              field
            }) => <FormItem><FormLabel>成员数量</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
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
            确定要删除班组 <span className="text-slate-800 font-medium">{teamToDelete?.sbmc}</span> 吗？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDelete}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}