// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'amber',
  className = ''
}) {
  const colorMap = {
    amber: {
      bg: 'bg-amber-50',
      icon: 'bg-brand-amber',
      accent: 'border-l-brand-amber',
      trend: 'text-brand-amber'
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'bg-brand-green',
      accent: 'border-l-brand-green',
      trend: 'text-brand-green'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'bg-brand-red',
      accent: 'border-l-brand-red',
      trend: 'text-brand-red'
    },
    blue: {
      bg: 'bg-sky-50',
      icon: 'bg-sky-500',
      accent: 'border-l-sky-500',
      trend: 'text-sky-500'
    }
  };
  const c = colorMap[color] || colorMap.amber;
  return <div className={`bg-white rounded-lg border-l-4 ${c.accent} shadow-card hover:shadow-card-hover transition-shadow duration-300 p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-heading font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && trendValue && <div className={`flex items-center mt-2 text-xs font-medium ${trend === 'up' ? 'text-brand-green' : 'text-brand-red'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1">{trendValue}</span>
            </div>}
        </div>
        {Icon && <div className={`w-11 h-11 ${c.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} className="text-white" />
          </div>}
      </div>
    </div>;
}