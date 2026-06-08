import { Search } from "lucide-react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search schemes...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="relative w-full max-w-xl">
    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Search"
      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22223b] text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
    />
  </div>
);

export default SearchBar;