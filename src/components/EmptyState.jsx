// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: CustomIcon,
  title,
  description,
  action
}) {
  const Icon = CustomIcon || Inbox;
  return <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1 text-center max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>;
}