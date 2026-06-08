import WelfareLayout from "./WelfareLayout";
import FAQAccordion from "@/components/welfare/FAQAccordion";
import { faqs } from "@/data/schemes";

const FAQ = () => (
  <WelfareLayout>
    <section className="bg-gradient-to-br from-[#2d6a4f] to-[#52b788] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="text-white/80 mt-2">Quick answers to the most common farmer queries.</p>
      </div>
    </section>
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <FAQAccordion items={faqs} />
    </section>
  </WelfareLayout>
);

export default FAQ;