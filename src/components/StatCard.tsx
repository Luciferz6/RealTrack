import { memo, type ReactNode } from 'react';
import { GlassCard } from './ui/GlassCard';

interface StatCardProps {
  title: string;
  value: ReactNode;
  helper?: string;
  icon?: ReactNode;
}

function StatCard({ title, value, helper, icon }: StatCardProps) {
  return (
    <GlassCard className="stat-card">
      <div className="stat-card__header">
        <p className="stat-card__title">{title}</p>
        {icon && <span className="stat-card__icon">{icon}</span>}
      </div>
      <p className="stat-card__value">{value}</p>
      {helper && <p className="stat-card__helper">{helper}</p>}
    </GlassCard>
  );
}

// Memoizar para evitar re-renders desnecessários quando props não mudam
export default memo(StatCard);

