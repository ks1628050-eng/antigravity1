import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
  };

  const bgColors = {
    success: 'border-emerald-500/30 bg-slate-900/95 text-emerald-200 shadow-emerald-950/50',
    error: 'border-rose-500/30 bg-slate-900/95 text-rose-200 shadow-rose-950/50',
    info: 'border-indigo-500/30 bg-slate-900/95 text-indigo-200 shadow-indigo-950/50'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-xl ${bgColors[toast.type || 'info']}`}>
        {icons[toast.type || 'info']}
        <p className="text-sm font-medium text-slate-100">{toast.message}</p>
      </div>
    </div>
  );
};
