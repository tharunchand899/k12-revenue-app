import React from 'react';

const StatusBadge = ({ status }) => {
  const s = String(status || '').toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (s.includes('approved') || s.includes('exceeded') || s.includes('high') || s.includes('active')) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (s.includes('pending') || s.includes('review') || s.includes('moderate') || s.includes('on track')) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (s.includes('rejected') || s.includes('leakage') || s.includes('below') || s.includes('critical') || s.includes('inactive')) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (s.includes('overridden') || s.includes('escalated')) {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
