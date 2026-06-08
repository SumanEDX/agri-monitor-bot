import { SearchX } from "lucide-react";

const EmptyState = ({ message = "No schemes match your search." }: { message?: string }) => (
  <div className="text-center py-16 text-slate-500 dark:text-slate-400">
    <SearchX className="w-10 h-10 mx-auto mb-3 text-[#52b788]" />
    <p className="text-sm">{message}</p>
  </div>
);

export default EmptyState;