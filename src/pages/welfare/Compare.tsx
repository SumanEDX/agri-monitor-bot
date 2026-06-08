import { useState } from "react";
import WelfareLayout from "./WelfareLayout";
import CompareTable from "@/components/welfare/CompareTable";
import { schemes } from "@/data/schemes";

const Compare = () => {
  const [a, setA] = useState<string>(schemes[0].id);
  const [b, setB] = useState<string>(schemes[1].id);

  const sA = schemes.find((s) => s.id === a)!;
  const sB = schemes.find((s) => s.id === b)!;

  const select = (val: string, onChange: (v: string) => void, label: string) => (
    <label className="flex-1 min-w-[200px]">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</span>
      <select
        value={val}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22223b] text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
      >
        {schemes.map((s) => (
          <option key={s.id} value={s.id}>{s.shortTitle}</option>
        ))}
      </select>
    </label>
  );

  return (
    <WelfareLayout>
      <section className="bg-gradient-to-br from-[#2d6a4f] to-[#52b788] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold">Compare Schemes</h1>
          <p className="text-white/80 mt-2">Pick any two schemes and compare them side by side.</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-4 items-end mb-6">
          {select(a, setA, "Scheme 1")}
          {select(b, setB, "Scheme 2")}
          <button
            onClick={() => { setA(schemes[0].id); setB(schemes[1].id); }}
            className="px-4 py-2.5 rounded-xl border border-[#2d6a4f] text-[#2d6a4f] dark:text-[#52b788] dark:border-[#52b788] font-medium hover:bg-[#52b788]/10"
          >
            Clear Comparison
          </button>
        </div>
        <CompareTable a={sA} b={sB} />
      </section>
    </WelfareLayout>
  );
};

export default Compare;