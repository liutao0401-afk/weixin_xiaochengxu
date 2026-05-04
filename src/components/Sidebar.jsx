// @ts-ignore;
import React, { useEffect, useState } from 'react';
// @ts-ignore;
import { LayoutDashboard, Cpu, Map, Route, Users, User, ClipboardList, ClipboardCheck, FileText, Wrench, Settings, Bell, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [{
  id: 'dashboard',
  label: '首页仪表盘',
  icon: LayoutDashboard
}, {
  divider: true,
  label: '设备管理'
}, {
  id: 'devices',
  label: '设备台账',
  icon: Cpu
}, {
  divider: true,
  label: '巡检管理'
}, {
  id: 'areas',
  label: '巡检区域',
  icon: Map
}, {
  id: 'routes',
  label: '巡检线路',
  icon: Route
}, {
  id: 'teams',
  label: '巡检班组',
  icon: Users
}, {
  id: 'staffs',
  label: '巡检人员',
  icon: User
}, {
  id: 'inspection-plans',
  label: '巡检计划',
  icon: ClipboardList
}, {
  id: 'inspection-execute',
  label: '巡检执行',
  icon: ClipboardCheck
}, {
  id: 'inspection-records',
  label: '巡检记录',
  icon: FileText
}, {
  divider: true,
  label: '维修管理'
}, {
  id: 'repairs',
  label: '报修管理',
  icon: Wrench
}, {
  id: 'maintenance',
  label: '维修管理',
  icon: Settings
}];
export default function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse
}) {
  const [hoveredItem, setHoveredItem] = useState(null);
  return <aside className={`${collapsed ? 'w-[68px]' : 'w-[260px]'} h-screen bg-brand-dark flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
      {/* Logo Area */}
      <div className={`h-16 flex items-center ${collapsed ? 'justify-center px-2' : 'px-5'} border-b border-white/10`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-amber rounded-lg flex items-center justify-center flex-shrink-0">
            <Cpu size={18} className="text-white" />
          </div>
          {!collapsed && <div className="animate-fade-in">
              <h1 className="text-white font-heading text-lg font-semibold leading-tight">设备巡检</h1>
              <p className="text-brand-amber text-xs font-heading tracking-wider">INSPECTION</p>
            </div>}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item, index) => {
        if (item.divider) {
          if (collapsed) return null;
          return <div key={index} className="px-3 pt-4 pb-2">
                <p className="text-xs font-heading font-medium text-slate-500 uppercase tracking-wider">
                  {item.label}
                </p>
              </div>;
        }
        const isActive = currentPage === item.id;
        const Icon = item.icon;
        const isHovered = hoveredItem === item.id;
        return <button key={item.id} onClick={() => onNavigate(item.id)} onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)} className={`
                w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start px-3'}
                h-10 rounded-lg relative group transition-all duration-200
                ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `} title={collapsed ? item.label : undefined}>
              <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-brand-amber' : ''}`} />
              {!collapsed && <span className="ml-3 text-sm font-medium animate-fade-in">{item.label}</span>}
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-amber rounded-r-full" />}
            </button>;
      })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/10">
        <button onClick={onToggleCollapse} className="w-full flex items-center justify-center h-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          {collapsed ? <ChevronRight size={18} /> : <>
            <ChevronLeft size={18} />
            <span className="ml-2 text-sm">收起菜单</span>
          </>}
        </button>
      </div>
    </aside>;
}