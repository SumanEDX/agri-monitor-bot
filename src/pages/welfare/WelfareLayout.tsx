import { ReactNode, useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Leaf, Moon, Sun, Menu, X } from "lucide-react";
import Chatbot from "@/components/welfare/Chatbot";

const links = [
  { to: "/welfare", label: "Home", end: true },
  { to: "/welfare/central-schemes", label: "Central Schemes" },
  { to: "/welfare/maharashtra-schemes", label: "Maharashtra Schemes" },
  { to: "/welfare/compare", label: "Compare" },
  { to: "/welfare/updates", label: "Updates" },
  { to: "/welfare/faq", label: "FAQ" },
  { to: "/welfare/contact", label: "Contact" },
];

const WelfareLayout = ({ children }: { children: ReactNode }) => {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("welfare-dark") === "1";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const toggleDark = () => {
    const v = !dark;
    setDark(v);
    localStorage.setItem("welfare-dark", v ? "1" : "0");
    document.documentElement.classList.toggle("dark", v);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9f0] text-slate-900 dark:bg-[#1a1a2e] dark:text-slate-100 transition-colors">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-[#1a1a2e]/80 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/welfare" className="flex items-center gap-2 font-bold text-[#2d6a4f] dark:text-[#52b788]">
            <Leaf className="w-6 h-6" />
            <span className="text-lg">KrishiSeva</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#2d6a4f] text-white"
                      : "text-slate-700 dark:text-slate-200 hover:bg-[#52b788]/15 hover:text-[#2d6a4f] dark:hover:text-[#52b788]"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle dark mode"
              onClick={toggleDark}
              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              aria-label="Menu"
              className="lg:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="lg:hidden border-t border-slate-200 dark:border-slate-700 px-4 py-2 flex flex-col">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? "bg-[#2d6a4f] text-white"
                      : "text-slate-700 dark:text-slate-200 hover:bg-[#52b788]/15"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#2d6a4f] text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg">
              <Leaf className="w-5 h-5" /> KrishiSeva
            </div>
            <p className="text-sm mt-3 text-white/80">
              A one-stop portal for Indian farmers to discover and apply for central and state welfare schemes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-1 text-sm text-white/80">
              {links.slice(0, 5).map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-[#f4a261]">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Helpline</h4>
            <p className="text-sm text-white/80">Kisan Call Centre: 1800-180-1551</p>
            <p className="text-sm text-white/80">Maharashtra: 1800-233-4000</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
          © {new Date().getFullYear()} KrishiSeva. For informational use only.
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};

export default WelfareLayout;