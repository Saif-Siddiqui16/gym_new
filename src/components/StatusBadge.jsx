import React from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    due: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    expired: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  const normalizedStatus = status?.toLowerCase() || 'expired';
  const styles = statusStyles[normalizedStatus] || statusStyles.expired;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${styles}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
