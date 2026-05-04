// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { ClipboardCheck, Camera, MapPin, CheckCircle, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';
// @ts-ignore;
import { Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, useToast } from '@/components/ui';

import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';
import DeviceStatusBadge from '@/components/DeviceStatusBadge';
import InspectionResultBadge from '@/components/InspectionResultBadge';
import EmptyState from '@/components/EmptyState';
export default function InspectionExecute(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planDevices, setPlanDevices] = useState([]);
  const [planContent, setPlanContent] = useState(null);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [checkItems, setCheckItems] = useState([]);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [inspectionResult, setInspectionResult] = useState(null);
  const [completedDevices, setCompletedDevices] = useState([]);
  useEffect(() => {
    loadPlans();
  }, []);
  const loadPlans = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'xjjh_yn4ktqm',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {}
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      setPlans(result?.records || []);
    } catch (e) {
      toast({
        title: '加载巡检计划失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const loadPlanDetails = async planId => {
    try {
      // Get devices linked to this plan
      const deviceResult = await $w.cloud.callDataSource({
        dataSourceName: 'sbda_dh6ekro',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                xjjh: {
                  $eq: planId
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      setPlanDevices(deviceResult?.records || []);

      // Get inspection content linked to the first device
      if (deviceResult?.records?.length > 0) {
        const firstDevice = deviceResult.records[0];
        if (firstDevice.xjnr) {
          const contentResult = await $w.cloud.callDataSource({
            dataSourceName: 'xjnr_62apz8x',
            methodName: 'wedaGetItemV2',
            params: {
              filter: {
                where: {
                  $and: [{
                    _id: {
                      $eq: firstDevice.xjnr
                    }
                  }]
                }
              },
              select: {
                $master: true
              }
            }
          });
          setPlanContent(contentResult);
        }
      }
    } catch (e) {
      toast({
        title: '加载计划详情失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  useEffect(() => {
    if (selectedPlan) {
      loadPlanDetails(selectedPlan);
    }
  }, [selectedPlan]);
  const handlePlanChange = planId => {
    setSelectedPlan(planId);
    setCurrentDeviceIndex(0);
    setCompletedDevices([]);
  };
  const handleScanResult = data => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'area') {
        setScanResult(parsed);
        toast({
          title: '扫码成功',
          description: '区域: ' + parsed.name
        });
      } else {
        toast({
          title: '无效二维码',
          description: '此二维码不是区域签到码',
          variant: 'destructive'
        });
      }
    } catch (e) {
      toast({
        title: '解析失败',
        description: '无法识别二维码内容',
        variant: 'destructive'
      });
    }
    setScanOpen(false);
  };
  const parseCheckItems = content => {
    if (!content?.xjnr) return [];
    const lines = content.xjnr.split('\n').filter(l => l.trim());
    return lines.map(line => ({
      text: line.replace(/^[0-9]+[、.]\s*/, '').trim(),
      result: '',
      isNormal: true
    }));
  };
  const startInspection = () => {
    if (!planContent) {
      toast({
        title: '请先选择巡检计划',
        variant: 'destructive'
      });
      return;
    }
    setCheckItems(parseCheckItems(planContent));
    setInspecting(true);
  };
  const toggleItemResult = index => {
    setCheckItems(prev => prev.map((item, i) => i === index ? {
      ...item,
      isNormal: !item.isNormal
    } : item));
  };
  const submitInspection = async () => {
    if (planDevices.length === 0) {
      toast({
        title: '没有巡检设备',
        variant: 'destructive'
      });
      return;
    }
    const device = planDevices[currentDeviceIndex] || planDevices[0];
    if (!device) {
      toast({
        title: '没有选择设备',
        variant: 'destructive'
      });
      return;
    }
    const isAllNormal = checkItems.every(item => item.isNormal);
    const xjjg = isAllNormal ? '2' : '3';
    try {
      const now = Date.now();
      const plan = plans.find(p => p._id === selectedPlan);
      const todayInspections = await $w.cloud.callDataSource({
        dataSourceName: 'xjd_etu4dhc',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                xjjh: {
                  $eq: selectedPlan
                }
              }, {
                xjsb: {
                  $eq: device._id
                }
              }, {
                xjsj: {
                  $gte: new Date().setHours(0, 0, 0, 0)
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      });
      const jtdjcxj = (todayInspections?.total || 0) + 1;
      const xjbh = device.sbbh + device.sbmc + '-' + new Date().toISOString().slice(0, 10) + '-【' + jtdjcxj + '】';
      await $w.cloud.callDataSource({
        dataSourceName: 'xjd_etu4dhc',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            xjbh,
            xjry: $w.auth.currentUser?.userId || '',
            xjjh: selectedPlan,
            xjsb: device._id,
            xjnr: planContent?._id || '',
            xjjl: checkItems.map(item => item.text + ': ' + (item.isNormal ? '正常' : '异常')).join('\n'),
            xjjg,
            xjsj: now,
            jtdjcxj
          }
        }
      });
      setInspectionResult({
        xjbh,
        deviceName: device.sbmc,
        deviceCode: device.sbbh,
        result: xjjg,
        isAllNormal
      });
      setCompletedDevices(prev => [...prev, device._id]);
      setInspecting(false);
      setResultDialogOpen(true);
    } catch (e) {
      toast({
        title: '提交失败',
        description: e.message,
        variant: 'destructive'
      });
    }
  };
  const handleNavigate = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const currentDevice = planDevices[currentDeviceIndex];
  return <div className="flex h-screen bg-surface-primary">
      <Sidebar currentPage="inspection-execute" onNavigate={handleNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <PageHeader title="巡检执行" description="选择巡检计划，扫描区域二维码签到，逐项检查设备并提交巡检结果" />

          {/* Step 1: Select Plan */}
          <div className="bg-white rounded-xl shadow-card p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-amber rounded-lg flex items-center justify-center text-white font-heading font-bold text-sm">1</div>
              <h3 className="font-heading font-semibold text-slate-800">选择巡检计划</h3>
            </div>
            <Select value={selectedPlan} onValueChange={handlePlanChange}>
              <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-200 focus:border-brand-amber">
                <SelectValue placeholder="请选择巡检计划" />
              </SelectTrigger>
              <SelectContent>
                {plans.map(plan => <SelectItem key={plan._id} value={plan._id}>{plan.jhmc} - {plan.mtcs}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedPlan && planDevices.length > 0 && <p className="text-xs text-slate-400 mt-2">该计划关联 {planDevices.length} 台设备</p>}
          </div>

          {/* Step 2: QR Scan */}
          <div className="bg-white rounded-xl shadow-card p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-amber rounded-lg flex items-center justify-center text-white font-heading font-bold text-sm">2</div>
              <h3 className="font-heading font-semibold text-slate-800">区域扫码签到</h3>
            </div>
            {scanResult ? <div className="bg-emerald-50 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-brand-green" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">已签到: {scanResult.name}</p>
                  <p className="text-xs text-emerald-600">编码: {scanResult.code}</p>
                </div>
              </div> : <Button variant="outline" className="w-full h-20 border-dashed border-2 border-brand-amber/30 text-brand-amber hover:bg-amber-50" onClick={() => setScanOpen(true)}>
                <Camera size={24} className="mr-2" />
                点击扫描区域二维码
              </Button>}
          </div>

          {/* QR Scanner Dialog */}
          <Dialog open={scanOpen} onOpenChange={setScanOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>扫描二维码</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="w-full aspect-square max-w-[250px] mx-auto bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <Camera size={48} className="text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">相机预览区域</p>
                    <p className="text-xs text-slate-400 mt-1">请将二维码对准框内</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 bg-brand-amber hover:bg-amber-600 text-white" onClick={() => handleScanResult('{"type":"area","id":"test","code":"A01","name":"东区"}')}>
                    模拟扫码
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setScanOpen(false)}>取消</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Step 3: Inspect Devices */}
          <div className="bg-white rounded-xl shadow-card p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-amber rounded-lg flex items-center justify-center text-white font-heading font-bold text-sm">3</div>
              <h3 className="font-heading font-semibold text-slate-800">设备巡检检查</h3>
            </div>

            {selectedPlan && planDevices.length > 0 ? <>
                {/* Device Progress */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                  {planDevices.map((device, idx) => <button key={device._id} onClick={() => setCurrentDeviceIndex(idx)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${idx === currentDeviceIndex ? 'bg-brand-amber text-white' : completedDevices.includes(device._id) ? 'bg-emerald-100 text-brand-green' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {completedDevices.includes(device._id) && <CheckCircle size={10} className="inline mr-1" />}
                      {device.sbbh}
                    </button>)}
                </div>

                {/* Current Device Info */}
                {currentDevice && <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{currentDevice.sbmc}</p>
                        <p className="text-xs text-slate-400">{currentDevice.sbbh} | {currentDevice.ggxh || '无型号'} | {currentDevice.azdd || '无位置'}</p>
                      </div>
                      <DeviceStatusBadge status={currentDevice.sbzt} />
                    </div>
                  </div>}

                {/* Inspection Content */}
                {planContent && !inspecting && <div className="mb-4">
                    <Button className="w-full bg-brand-amber hover:bg-amber-600 text-white h-12 text-base" onClick={startInspection}>
                      <ClipboardCheck size={20} className="mr-2" /> 开始巡检
                    </Button>
                  </div>}

                {/* Check Items */}
                {inspecting && <div className="space-y-3">
                    <p className="text-xs text-slate-400 font-medium">巡检项目（点击切换正常/异常）</p>
                    {checkItems.map((item, index) => <button key={index} onClick={() => toggleItemResult(index)} className={`w-full text-left p-3 rounded-lg border transition-colors ${item.isNormal ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{item.text}</span>
                          {item.isNormal ? <CheckCircle size={16} className="text-brand-green" /> : <AlertTriangle size={16} className="text-brand-red" />}
                        </div>
                      </button>)}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => {
                  setInspecting(false);
                  setCheckItems([]);
                }}>
                        取消
                      </Button>
                      <Button className="flex-1 bg-brand-amber hover:bg-amber-600 text-white" onClick={submitInspection}>
                        提交巡检
                      </Button>
                    </div>
                  </div>}
              </> : <p className="text-sm text-slate-400 py-4 text-center">{selectedPlan ? '该计划暂无关联设备' : '请先选择巡检计划'}</p>}
          </div>
        </div>
      </main>

      {/* Result Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>巡检结果</DialogTitle>
          </DialogHeader>
          {inspectionResult && <div className="py-4">
              <div className={`rounded-xl p-6 text-center ${inspectionResult.isAllNormal ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {inspectionResult.isAllNormal ? <CheckCircle size={48} className="text-brand-green mx-auto mb-3" /> : <AlertTriangle size={48} className="text-brand-red mx-auto mb-3" />}
                <p className={`text-lg font-heading font-bold ${inspectionResult.isAllNormal ? 'text-emerald-800' : 'text-red-800'}`}>
                  {inspectionResult.isAllNormal ? '全部正常' : '发现异常'}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {inspectionResult.deviceName} ({inspectionResult.deviceCode})
                </p>
                <p className="text-xs text-slate-400 mt-1">{inspectionResult.xjbh}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setResultDialogOpen(false)}>关闭</Button>
                <Button className="flex-1 bg-brand-amber hover:bg-amber-600 text-white" onClick={() => {
              setResultDialogOpen(false);
              if (currentDeviceIndex < planDevices.length - 1) setCurrentDeviceIndex(currentDeviceIndex + 1);
            }}>
                  下一设备
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}