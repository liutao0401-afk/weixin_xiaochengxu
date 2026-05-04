// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { FileText, Search, MapPin, Calendar, Filter } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis, useToast } from '@/components/ui';
// @ts-ignore;
import { formatDateTime, getInspectionResultLabel } from '@/lib/utils';

import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import InspectionResultBadge from '@/components/InspectionResultBadge';
import EmptyState from '@/components/EmptyState';
export default function InspectionRecords(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const loadRecords = async () => {
    setLoading(true);
    try {
      const where = {};
      const andConditions = [];
      if (search) {
        andConditions.push({
          $or: [{
            xjbh: {
              $search: search
            }
          }]
        });
      }
      if (resultFilter !== 'all') {
        andConditions.push({
          xjjg: {
            $eq: resultFilter
          }
        });
      }
      if (andConditions.length > 0) {
        where.$and = andConditions;
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'xjd_etu4dhc',
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
            xjsj: 'desc'
          }]
        }
      });
      setRecords(result?.records || []);
      setTotal(result?.total || 0);
    } catch (e) {
      toast({
        title: '加载记录失败',
        description: e.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadRecords();
  }, [page, resultFilter]);
  const handleSearch = () => {
    setPage(1);
    loadRecords();
  };
  const openDetail = record => {
    setSelectedRecord(record);
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
      <Sidebar currentPage="inspection-records" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <PageHeader title="巡检记录" description="查看所有巡检执行记录，支持按结果筛选和搜索" />

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="搜索巡检编号..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-9 h-10 bg-slate-50 border-slate-200 focus:border-brand-amber" />
              </div>
              <Select value={resultFilter} onValueChange={v => {
              setResultFilter(v);
              setPage(1);
            }}>
                <SelectTrigger className="w-[160px] h-10 bg-slate-50 border-slate-200">
                  <Filter size={16} className="mr-2 text-slate-400" />
                  <SelectValue placeholder="巡检结果" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部结果</SelectItem>
                  <SelectItem value="2">正常</SelectItem>
                  <SelectItem value="3">异常</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleSearch} className="h-10 border-brand-amber text-brand-amber hover:bg-amber-50">
                搜索
              </Button>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {loading ? <div className="py-20 text-center text-sm text-slate-400">加载中...</div> : records.length === 0 ? <EmptyState icon={FileText} title="暂无巡检记录" description="执行巡检后记录将显示在此" /> : <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">巡检编号</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">巡检时间</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">定位</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">第几次</th>
                        <th className="text-left px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">结果</th>
                        <th className="text-center px-5 py-3 text-xs font-heading font-semibold text-slate-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map(record => <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <button onClick={() => openDetail(record)} className="text-brand-amber hover:text-amber-600 font-medium text-sm">
                              {record.xjbh}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600">{formatDateTime(record.xjsj)}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-500">{record.dw?.address || '-'}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-500">第 {record.jtdjcxj || '-'} 次</td>
                          <td className="px-5 py-3.5"><InspectionResultBadge result={record.xjjg} /></td>
                          <td className="px-5 py-3.5 text-center">
                            <Button variant="ghost" size="sm" className="hover:text-brand-amber" onClick={() => openDetail(record)}>查看详情</Button>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center px-5 py-4 border-t border-slate-100">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClock={() => setPage(p => Math.max(1, p - 1))} />
                      </PaginationItem>
                      {paginationRange.map(p => <PaginationItem key={p}>
                          <PaginationLink onClock={() => setPage(p)} isActive={page === p}>{p}</PaginationLink>
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>巡检记录详情</DialogTitle>
          </DialogHeader>
          {selectedRecord && <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-400 mb-1">巡检编号</p><p className="text-sm font-medium text-slate-800">{selectedRecord.xjbh}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">巡检时间</p><p className="text-sm font-medium text-slate-800">{formatDateTime(selectedRecord.xjsj)}</p></div>
                <div><p className="text-xs text-slate-400 mb-1">巡检结果</p><InspectionResultBadge result={selectedRecord.xjjg} /></div>
                <div><p className="text-xs text-slate-400 mb-1">第几次巡检</p><p className="text-sm font-medium text-slate-800">第 {selectedRecord.jtdjcxj || '-'} 次</p></div>
                <div><p className="text-xs text-slate-400 mb-1">签到位置</p><p className="text-sm font-medium text-slate-800">{selectedRecord.dw?.address || '-'}</p></div>
              </div>
              {selectedRecord.xjjl && <div>
                  <p className="text-xs text-slate-400 mb-2">巡检记录详情</p>
                  <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">{selectedRecord.xjjl}</div>
                </div>}
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}