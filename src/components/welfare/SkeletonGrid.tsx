const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-[#22223b] animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 mb-3" />
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-1" />
        <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-9 w-full bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    ))}
  </div>
);

export default SkeletonGrid;