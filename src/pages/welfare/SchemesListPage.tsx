import { useEffect, useMemo, useState } from "react";
import WelfareLayout from "./WelfareLayout";
import SchemeCard from "@/components/welfare/SchemeCard";
import SearchBar from "@/components/welfare/SearchBar";
import FilterBar from "@/components/welfare/FilterBar";
import SkeletonGrid from "@/components/welfare/SkeletonGrid";
import EmptyState from "@/components/welfare/EmptyState";
import { schemes } from "@/data/schemes";

const SchemesListPage = ({
  category,
  title,
  description,
  filters,
}: {
  category: "central" | "maharashtra";
  title: string;
  description: string;
  filters: string[];
}) => {
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const list = useMemo(() => {
    const base = schemes.filter((s) => s.category === category);
    return base.filter((s) => {
      const ql = q.toLowerCase();
      const matchQ =
        s.title.toLowerCase().includes(ql) ||
        s.tags.join(" ").toLowerCase().includes(ql);
      const fl = filter.toLowerCase();
      const matchF =
        filter === "All" ||
        s.type.some((t) => t.toLowerCase().includes(fl)) ||
        s.tags.some((t) => t.toLowerCase().includes(fl));
      return matchQ && matchF;
    });
  }, [q, filter, category]);

  return (
    <WelfareLayout>
      <section className="bg-gradient-to-br from-[#2d6a4f] to-[#52b788] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
          <p className="mt-2 text-white/90 max-w-2xl">{description}</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <SearchBar value={q} onChange={setQ} />
          <FilterBar filters={filters} active={filter} onChange={setFilter} />
        </div>
        {loading ? (
          <SkeletonGrid count={5} />
        ) : list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((s) => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        )}
      </section>
    </WelfareLayout>
  );
};

export default SchemesListPage;