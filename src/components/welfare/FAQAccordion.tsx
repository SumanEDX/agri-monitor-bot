import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQAccordion = ({ items }: { items: { q: string; a: string }[] }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#22223b] overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between text-left px-4 py-3 font-medium text-slate-800 dark:text-slate-100 hover:bg-[#52b788]/5"
              aria-expanded={isOpen}
            >
              <span>{it.q}</span>
              <ChevronDown className={`w-5 h-5 text-[#2d6a4f] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div className="grid transition-all duration-300 ease-in-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <p className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;