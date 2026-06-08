import WelfareLayout from "./WelfareLayout";
import NewsCard from "@/components/welfare/NewsCard";
import { updates } from "@/data/schemes";

const Updates = () => (
  <WelfareLayout>
    <section className="bg-gradient-to-br from-[#2d6a4f] to-[#52b788] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold">Latest Updates</h1>
        <p className="text-white/80 mt-2">News, deadlines and announcements from across India.</p>
      </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {updates.map((u) => <NewsCard key={u.id} {...u} />)}
      </div>
    </section>
  </WelfareLayout>
);

export default Updates;