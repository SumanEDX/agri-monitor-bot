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
import { schemes } from "@/data/schemes";
import { useI18n } from "@/lib/i18n";
import { getUpdatesTranslations, getFAQTranslations } from "@/data/schemes-i18n";

const Home = () => {
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");

  const updates = getUpdatesTranslations(language);
  const faqs = getFAQTranslations(language);

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
            {t("empoweringFarmers")}<br />{t("enrichingLives")}
          </h1>
          <p className="mt-5 text-lg text-white/90 max-w-2xl">
            {t("welfareSubtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/welfare/central-schemes" className="inline-flex items-center gap-2 bg-white text-[#2d6a4f] font-semibold px-5 py-3 rounded-xl hover:bg-[#f4a261] hover:text-white transition-colors">
              {t("exploreCentralSchemes")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/welfare/maharashtra-schemes" className="inline-flex items-center gap-2 bg-[#f4a261] text-white font-semibold px-5 py-3 rounded-xl hover:bg-white hover:text-[#2d6a4f] transition-colors">
              {t("exploreMaharashtraSchemes")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardW label={t("totalSchemes")} value="10+" icon="Sprout" color="#2d6a4f" />
            <StatCardW label={t("farmersBenefited")} value="12 Cr+" icon="Users" color="#f4a261" />
            <StatCardW label={t("fundsDistributed")} value="Rs 2 L Cr+" icon="Wallet" color="#52b788" />
            <StatCardW label={t("activeApplications")} value="Open" icon="FileCheck" color="#0ea5e9" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t("centralGovSchemes")}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t("centralGovDesc")}</p>
          </div>
          <SearchBar value={q1} onChange={setQ1} placeholder={t("searchCentralSchemes")} />
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
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t("maharashtraGovSchemes")}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t("maharashtraGovDesc")}</p>
          </div>
          <SearchBar value={q2} onChange={setQ2} placeholder={t("searchMaharashtraSchemes")} />
        </div>
        {loading ? <SkeletonGrid count={5} /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {maharashtra.map((s) => <SchemeCard key={s.id} scheme={s} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t("latestUpdates")}</h2>
          <Link to="/welfare/updates" className="text-sm font-medium text-[#2d6a4f] dark:text-[#52b788] hover:underline">{t("viewAll")}</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {updates.slice(0, 3).map((u, idx) => <NewsCard key={idx} id={idx + 1} title={u.title} date="" description={u.description} />)}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t("frequentlyAsked")}</h2>
          <Link to="/welfare/faq" className="text-sm font-medium text-[#2d6a4f] dark:text-[#52b788] hover:underline">{t("allFAQs")}</Link>
        </div>
        <FAQAccordion items={faqs.slice(0, 3)} />
      </section>
    </WelfareLayout>
  );
};

export default Home;