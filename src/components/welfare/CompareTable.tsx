import type { Scheme } from "@/data/schemes";

const rows: { label: string; key: (s: Scheme) => string }[] = [
  { label: "Category", key: (s) => (s.category === "central" ? "Central Govt" : "Maharashtra Govt") },
  { label: "Ministry", key: (s) => s.ministry },
  { label: "Launch Year", key: (s) => String(s.launchYear) },
  { label: "Budget", key: (s) => s.budget },
  { label: "Type", key: (s) => s.type.join(", ") },
  { label: "Key Benefit", key: (s) => s.benefits[0] ?? "-" },
  { label: "Eligibility", key: (s) => s.eligibility.slice(0, 2).join("; ") },
  { label: "Documents", key: (s) => s.documents.join(", ") },
  { label: "Application Mode", key: (s) => s.howToApply },
];

const CompareTable = ({ a, b }: { a: Scheme; b: Scheme }) => (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22223b]">
    <table className="min-w-full text-sm">
      <thead className="bg-[#2d6a4f] text-white">
        <tr>
          <th className="text-left p-3 w-40">Attribute</th>
          <th className="text-left p-3">{a.shortTitle}</th>
          <th className="text-left p-3">{b.shortTitle}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.label} className={i % 2 ? "bg-[#f8f9f0] dark:bg-white/5" : ""}>
            <td className="p-3 font-semibold text-slate-700 dark:text-slate-200 align-top">{r.label}</td>
            <td className="p-3 text-slate-700 dark:text-slate-200 align-top">{r.key(a)}</td>
            <td className="p-3 text-slate-700 dark:text-slate-200 align-top">{r.key(b)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CompareTable;