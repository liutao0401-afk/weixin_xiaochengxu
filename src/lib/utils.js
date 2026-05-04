import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

export function getDeviceTypeLabel(type) {
  const map = {
    '1': '灭火器',
    '2': '电梯',
    '3': '柴油机',
    '4': '变压器',
    '5': '中央空调',
  };
  return map[type] || '其他';
}

export function getDeviceStatusLabel(status) {
  const map = {
    '1': '正常',
    '2': '告警',
    '3': '故障',
  };
  return map[status] || '未知';
}

export function getInspectionResultLabel(result) {
  const map = {
    '2': '正常',
    '3': '异常',
  };
  return map[result] || '未知';
}

export function getInspectionResultColor(result) {
  if (result === '2') return 'text-brand-green';
  if (result === '3') return 'text-brand-red';
  return 'text-slate-500';
}

export function getDeviceStatusColor(status) {
  if (status === '1') return 'bg-brand-green';
  if (status === '2') return 'bg-brand-amber';
  if (status === '3') return 'bg-brand-red';
  return 'bg-slate-400';
}

export function getDeviceStatusTextColor(status) {
  if (status === '1') return 'text-brand-green';
  if (status === '2') return 'text-brand-amber';
  if (status === '3') return 'text-brand-red';
  return 'text-slate-500';
}
