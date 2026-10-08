import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = '8px',
  style,
  className = '',
}) => {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        ...style,
      }}
    />
  );
};

export const AccountCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width={44} height={44} borderRadius="50%" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width={140} height={18} borderRadius={6} />
            <Skeleton width={80} height={12} borderRadius={4} />
          </div>
        </div>
        <Skeleton width={32} height={32} borderRadius="50%" />
      </div>

      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton width={90} height={12} borderRadius={4} />
        <Skeleton width={180} height={26} borderRadius={6} />
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
        <Skeleton width="50%" height={36} borderRadius={48} />
        <Skeleton width="50%" height={36} borderRadius={48} />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = () => {
  return (
    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
      <td style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width={36} height={36} borderRadius="50%" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width={130} height={16} borderRadius={4} />
            <Skeleton width={80} height={12} borderRadius={4} />
          </div>
        </div>
      </td>
      <td style={{ padding: '16px 20px' }}>
        <Skeleton width={90} height={24} borderRadius={48} />
      </td>
      <td style={{ padding: '16px 20px' }}>
        <Skeleton width={100} height={16} borderRadius={4} />
      </td>
      <td style={{ padding: '16px 20px' }}>
        <Skeleton width={85} height={14} borderRadius={4} />
      </td>
      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton width={110} height={18} borderRadius={4} />
        </div>
      </td>
      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Skeleton width={28} height={28} borderRadius="50%" />
        </div>
      </td>
    </tr>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width={110} height={14} borderRadius={4} />
        <Skeleton width={36} height={36} borderRadius="50%" />
      </div>
      <Skeleton width={160} height={28} borderRadius={6} />
      <Skeleton width={90} height={12} borderRadius={4} />
    </div>
  );
};
