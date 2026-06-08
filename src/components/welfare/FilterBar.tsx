const FilterBar = ({
  filters,
  active,
  onChange,
}: {
  filters: string[];
  active: string;
  onChange: (f: string) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {filters.map((f) => (
      <button
        key={f}
        onClick={() => onChange(f)}
        className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors capitalize ${
          active === f
            ? "bg-[#2d6a4f] text-white"
            : "bg-white dark:bg-[#22223b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-[#52b788]"
        }`}
      >
        {f}
      </button>
    ))}
  </div>
);

export default FilterBar;