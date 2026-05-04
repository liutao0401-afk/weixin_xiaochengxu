// @ts-ignore;
import React from 'react';

export default function PageHeader({
  title,
  description,
  actions
}) {
  return <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>;
}