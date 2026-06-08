import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink, Download, ArrowLeft } from "lucide-react";
import { getIcon } from "@/components/welfare/iconMap";
import WelfareLayout from "./WelfareLayout";
import SchemeCard from "@/components/welfare/SchemeCard";
import { schemes } from "@/data/schemes";

const tabs = ["Overview", "Eligibility", "Benefits", "Documents", "How to Apply"] as const;
type Tab = typeof tabs[number];

const SchemeDetail = () => {
  const { id } = useParams();
  const scheme = useMemo(() => schemes.find((s) => s.id === id), [id]);
  const related = useMemo(() => schemes.filter((s) => s.id !== id && s.category === scheme?.category).slice(0, 3), [id, scheme]);
  const [tab, setTab] = useState<Tab>("Overview");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [id]);

  if (!scheme) {
    return (
      <WelfareLayout>
        <div className="max-w-3xl mx-auto p-10 text-center">
          <h1 className="text-2xl font-bold mb-2">Scheme not found</h1>
          <Link to="/welfare" className="text-[#2d6a4f] underline">Back to Home</Link>
        </div>
      </WelfareLayout>
    );
  }

  const Icon = getIcon(scheme.icon);

  const content = () => {
    switch (tab) {
      case "Overview":
        return <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{scheme.overview}</p>;
      case "Eligibility":
        return (
          <ul className="space-y-2">
            {scheme.eligibility.map((e) => (
              <li key={e} className="flex gap-2 text-slate-700 dark:text-slate-200">
                <span className="text-[#52b788]">✔</span>
                {e}
              </li>
            ))}
          </ul>
        );
      case "Benefits":
        return (
          <ul className="space-y-2">
            {scheme.benefits.map((e) => (
              <li key={e} className="flex gap-2 text-slate-700 dark:text-slate-200">
                <span className="text-[#f4a261]">★</span>
                {e}
              </li>
            ))}
          </ul>
        );
      case "Documents":
        return (
          <ul className="grid sm:grid-cols-2 gap-2">
            {scheme.documents.map((e) => (
              <li key={e} className="flex gap-2 text-slate-700 dark:text-slate-200">
                <span className="text-[#2d6a4f]">•</span>
                {e}
              </li>
            ))}
          </ul>
        );
      case "How to Apply":
        return <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{scheme.howToApply}</p>;
    }
  };

  return (
    <WelfareLayout>
      <section className="relative text-white" style={{ background: `linear-gradient(135deg, ${scheme.color}, #1b4332)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <Link
            to={scheme.category === "central" ? "/welfare/central-schemes" : "/welfare/maharashtra-schemes"}
            className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20">
                {scheme.category === "central" ? "Central Govt" : "Maharashtra Govt"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">{scheme.title}</h1>
              <p className="text-white/80 mt-1 text-sm">{scheme.ministry}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 mb-5">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t
                    ? "border-[#2d6a4f] text-[#2d6a4f] dark:text-[#52b788] dark:border-[#52b788]"
                    : "border-transparent text-slate-500 hover:text-[#2d6a4f]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="bg-white dark:bg-[#22223b] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 min-h-[180px]">
            {loading ? <div className="animate-pulse h-24 bg-slate-200 dark:bg-slate-700 rounded" /> : content()}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white dark:bg-[#22223b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Quick Info</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Ministry</dt>
                <dd className="text-right max-w-[60%]">{scheme.ministry}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Launch Year</dt>
                <dd>{scheme.launchYear}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Budget</dt>
                <dd>{scheme.budget}</dd>
              </div>
            </dl>
          </div>
          <a
            href={scheme.officialWebsite}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white py-2.5 rounded-xl font-semibold"
          >
            Official Website <ExternalLink className="w-4 h-4" />
          </a>
          <button className="flex items-center justify-center gap-2 w-full bg-[#f4a261] hover:bg-[#e76f51] text-white py-2.5 rounded-xl font-semibold">
            Apply Now
          </button>
          <button className="flex items-center justify-center gap-2 w-full border border-[#2d6a4f] text-[#2d6a4f] dark:text-[#52b788] dark:border-[#52b788] py-2.5 rounded-xl font-semibold hover:bg-[#52b788]/10">
            <Download className="w-4 h-4" /> Download Info PDF
          </button>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <h2 className="text-xl font-bold mb-4">Related Schemes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((s) => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        </section>
      )}
    </WelfareLayout>
  );
};

export default SchemeDetail;