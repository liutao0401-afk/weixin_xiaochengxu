// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Badge } from '@/components/ui';
// @ts-ignore;
import { getInspectionResultLabel, getInspectionResultColor } from '@/lib/utils';

export default function InspectionResultBadge({
  result
}) {
  const label = getInspectionResultLabel(result);
  const color = getInspectionResultColor(result);
  return <Badge variant="outline" className="border-0 gap-1.5 text-xs px-2 py-0.5">
      <span className={color}>{label}</span>
    </Badge>;
}