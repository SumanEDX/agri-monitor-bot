import { getIcon } from "./iconMap";

const StatCardW = ({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) => {
  const Icon = getIcon(icon);
  return (
    <div className="bg-white/70 dark:bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/40 dark:border-white/10 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}25`, color }}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-900 dark:text-white leading-none">{value}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCardW;