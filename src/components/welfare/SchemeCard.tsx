import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ArrowRight, icons } from "lucide-react";
import type { Scheme } from "@/data/schemes";

const SchemeCard = ({ scheme }: { scheme: Scheme }) => {
  const [saved, setSaved] = useState(false);
  const Icon = (icons as Record<string, React.ComponentType<{ className?: string }>>)[scheme.icon] ?? icons.Sprout;

  return (
    <div className="group relative bg-white dark:bg-[#22223b] rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <div className="h-1.5" style={{ backgroundColor: scheme.color }} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${scheme.color}1a`, color: scheme.color }}>
            <Icon className="w-6 h-6" />
          </div>
          <button aria-label="Bookmark scheme" onClick={() => setSaved((s) => !s)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            <Bookmark className={`w-5 h-5 ${saved ? "fill-[#f4a261] text-[#f4a261]" : "text-slate-400"}`} />
          </button>
        </div>
        <span className={`inline-block self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${scheme.category === "central" ? "bg-[#2d6a4f]/10 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]" : "bg-[#f4a261]/15 text-[#b45309]"}`}>
          {scheme.category === "central" ? "Central" : "Maharashtra"}
        </span>
        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">{scheme.shortTitle}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{scheme.overview}</p>
        <ul className="mt-3 space-y-1">
          {scheme.benefits.slice(0, 2).map((b) => (
            <li key={b} className="text-xs text-slate-700 dark:text-slate-300 flex gap-2">
              <span className="text-[#52b788] mt-0.5">✔</span>
              <span className="line-clamp-1">{b}</span>
            </li>
          ))}
        </ul>
        <Link to={`/welfare/scheme/${scheme.id}`} className="mt-4 inline-flex items-center justify-center gap-1 text-sm font-semibold text-white bg-[#2d6a4f] hover:bg-[#1b4332] py-2 rounded-lg transition-colors">
          View Details <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default SchemeCard;