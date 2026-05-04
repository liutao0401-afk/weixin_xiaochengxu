// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Badge } from '@/components/ui';
// @ts-ignore;
import { getDeviceStatusLabel, getDeviceStatusColor, getDeviceStatusTextColor } from '@/lib/utils';

export default function DeviceStatusBadge({
  status,
  size = 'sm'
}) {
  const label = getDeviceStatusLabel(status);
  const dotColor = getDeviceStatusColor(status);
  const textColor = getDeviceStatusTextColor(status);
  return <Badge variant="outline" className={`border-0 gap-1.5 ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
      <span className={textColor}>{label}</span>
    </Badge>;
}