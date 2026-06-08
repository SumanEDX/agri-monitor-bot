import { useState } from "react";
import { Phone, MapPin, Send } from "lucide-react";
import WelfareLayout from "./WelfareLayout";
import { helplines, stateContacts } from "@/data/schemes";

const Contact = () => {
  const [form, setForm] = useState({ name: "", mobile: "", district: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", mobile: "", district: "", message: "" });
    setTimeout(() => setSent(false), 3000);
  };

  const input = (key: keyof typeof form, label: string, type = "text") => (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <input
        type={type}
        required
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22223b] text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
      />
    </label>
  );

  return (
    <WelfareLayout>
      <section className="bg-gradient-to-br from-[#2d6a4f] to-[#52b788] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold">Contact & Helplines</h1>
          <p className="text-white/80 mt-2">Get in touch or reach out to official helplines.</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="bg-white dark:bg-[#22223b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Send us a message</h2>
          {input("name", "Full Name")}
          {input("mobile", "Mobile Number", "tel")}
          {input("district", "District")}
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Message</span>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22223b] text-sm focus:outline-none focus:ring-2 focus:ring-[#52b788]"
            />
          </label>
          <button type="submit" className="inline-flex items-center gap-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-5 py-2.5 rounded-xl font-semibold">
            <Send className="w-4 h-4" /> Submit
          </button>
          {sent && <p className="text-sm text-[#2d6a4f] dark:text-[#52b788]">Thanks! Your message has been recorded.</p>}
        </form>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#22223b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Phone className="w-5 h-5 text-[#f4a261]" /> Helpline Numbers</h2>
            <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
              {helplines.map((h) => (
                <li key={h.name} className="py-2 flex justify-between text-sm">
                  <span>{h.name}</span>
                  <span className="font-semibold text-[#2d6a4f] dark:text-[#52b788]">{h.number}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white dark:bg-[#22223b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-[#f4a261]" /> State-wise Contacts</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {stateContacts.map((c) => (
                <li key={c.state}>
                  <div className="font-semibold">{c.state}</div>
                  <div className="text-slate-600 dark:text-slate-300">{c.office}</div>
                  <div className="text-[#2d6a4f] dark:text-[#52b788]">{c.phone}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </WelfareLayout>
  );
};

export default Contact;