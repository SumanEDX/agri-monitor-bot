import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import Farmers from "./pages/Farmers";
import Plots from "./pages/Plots";
import Tasks from "./pages/Tasks";
import Weather from "./pages/Weather";
import CropWaterProductivity from "./pages/CropWaterProductivity";
import WaterSources from "./pages/WaterSources";
import NashikDashboard from "./components/Dashboard";
import HelloKisaanMandi from "./pages/HelloKisaanMandi";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import WelfareHome from "./pages/welfare/Home";
import CentralSchemes from "./pages/welfare/CentralSchemes";
import MaharashtraSchemes from "./pages/welfare/MaharashtraSchemes";
import SchemeDetail from "./pages/welfare/SchemeDetail";
import Compare from "./pages/welfare/Compare";
import Updates from "./pages/welfare/Updates";
import FAQ from "./pages/welfare/FAQ";
import Contact from "./pages/welfare/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <I18nProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/farmers" element={<Farmers />} />
              <Route path="/plots" element={<Plots />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/crop-water" element={<CropWaterProductivity />} />
              <Route path="/water-sources" element={<WaterSources />} />
              <Route path="/mandi-prices" element={<HelloKisaanMandi />} />
              <Route path="/nashik-mandi" element={<NashikDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/welfare" element={<WelfareHome />} />
              <Route path="/welfare/central-schemes" element={<CentralSchemes />} />
              <Route path="/welfare/maharashtra-schemes" element={<MaharashtraSchemes />} />
              <Route path="/welfare/scheme/:id" element={<SchemeDetail />} />
              <Route path="/welfare/compare" element={<Compare />} />
              <Route path="/welfare/updates" element={<Updates />} />
              <Route path="/welfare/faq" element={<FAQ />} />
              <Route path="/welfare/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
