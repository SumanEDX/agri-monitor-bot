import { Calendar, ArrowRight } from "lucide-react";

const NewsCard = ({ title, date, description }: { title: string; date: string; description: string }) => (
  <div className="bg-white dark:bg-[#22223b] rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1">
    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
      <Calendar className="w-3.5 h-3.5" />
      {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
    </div>
    <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">{description}</p>
    <button className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#2d6a4f] dark:text-[#52b788] hover:underline">
      Read More <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

export default NewsCard;