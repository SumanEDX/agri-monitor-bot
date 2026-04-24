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
import MandiPrices from "./pages/MandiPrices";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

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
              <Route path="/mandi-prices" element={<MandiPrices />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
