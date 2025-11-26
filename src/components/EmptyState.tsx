import { memo } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</p>
      <p style={{ margin: '6px 0 0' }}>{description}</p>
    </div>
  );
}

// Memoizar para evitar re-renders quando props não mudam
export default memo(EmptyState);

