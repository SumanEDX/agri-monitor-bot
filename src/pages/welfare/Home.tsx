import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import WelfareLayout from "./WelfareLayout";
import SchemeCard from "@/components/welfare/SchemeCard";
import SearchBar from "@/components/welfare/SearchBar";
import StatCardW from "@/components/welfare/StatCardW";
import NewsCard from "@/components/welfare/NewsCard";
import FAQAccordion from "@/components/welfare/FAQAccordion";
import SkeletonGrid from "@/components/welfare/SkeletonGrid";
import { schemes, updates, faqs } from "@/data/schemes";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const central = useMemo(
    () => schemes.filter((s) => s.category === "central" && s.title.toLowerCase().includes(q1.toLowerCase())),
    [q1]
  );
  const maharashtra = useMemo(
    () => schemes.filter((s) => s.category === "maharashtra" && s.title.toLowerCase().includes(q2.toLowerCase())),
    [q2]
  );

  return (
    <WelfareLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d6a4f] via-[#1b4332] to-[#52b788]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #f4a261 0, transparent 40%), radial-gradient(circle at 80% 60%, #52b788 0, transparent 50%)" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight max-w-3xl">
            Empowering Farmers,<br />Enriching Lives
          </h1>
          <p className="mt-5 text-lg text-white/90 max-w-2xl">
            Discover every central and Maharashtra government welfare scheme designed to support, protect and grow India's farming community.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/welfare/central-schemes" className="inline-flex items-center gap-2 bg-white text-[#2d6a4f] font-semibold px-5 py-3 rounded-xl hover:bg-[#f4a261] hover:text-white transition-colors">
              Explore Central Schemes <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/welfare/maharashtra-schemes" className="inline-flex items-center gap-2 bg-[#f4a261] text-white font-semibold px-5 py-3 rounded-xl hover:bg-white hover:text-[#2d6a4f] transition-colors">
              Explore Maharashtra Schemes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardW label="Total Schemes" value="10+" icon="Sprout" color="#2d6a4f" />
            <StatCardW label="Farmers Benefited" value="12 Cr+" icon="Users" color="#f4a261" />
            <StatCardW label="Funds Distributed" value="Rs 2 L Cr+" icon="Wallet" color="#52b788" />
            <StatCardW label="Active Applications" value="Open" icon="FileCheck" color="#0ea5e9" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Central Government Schemes</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Nationwide schemes available to every Indian farmer.</p>
          </div>
          <SearchBar value={q1} onChange={setQ1} placeholder="Search central schemes..." />
        </div>
        {loading ? <SkeletonGrid count={5} /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {central.map((s) => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Maharashtra Government Schemes</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">State schemes designed for Maharashtra's farming community.</p>
          </div>
          <SearchBar value={q2} onChange={setQ2} placeholder="Search Maharashtra schemes..." />
        </div>
        {loading ? <SkeletonGrid count={5} /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {maharashtra.map((s) => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Latest Updates</h2>
          <Link to="/welfare/updates" className="text-sm font-medium text-[#2d6a4f] dark:text-[#52b788] hover:underline">View all</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {updates.slice(0, 3).map((u) => <NewsCard key={u.id} {...u} />)}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked</h2>
          <Link to="/welfare/faq" className="text-sm font-medium text-[#2d6a4f] dark:text-[#52b788] hover:underline">All FAQs</Link>
        </div>
        <FAQAccordion items={faqs.slice(0, 3)} />
      </section>
    </WelfareLayout>
  );
};

export default Home;