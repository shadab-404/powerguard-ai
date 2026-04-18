/**
 * StatusBadge Component
 * Displays meter status with color-coded styling
 * Design: Rounded pill-shaped badges with borders
 */

import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'normal' | 'suspicious' | 'critical';
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClasses = 'inline-flex items-center gap-2 font-semibold rounded-full';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const statusClasses = {
    normal: 'badge-normal',
    suspicious: 'badge-warning',
    critical: 'badge-critical',
  };

  const iconClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const Icon = {
    normal: CheckCircle,
    suspicious: AlertTriangle,
    critical: AlertCircle,
  }[status];

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${statusClasses[status]}`}>
      <Icon className={iconClasses[size]} />
      <span className="capitalize">{status}</span>
    </span>
  );
}
