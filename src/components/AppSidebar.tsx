import { LayoutDashboard, Users, Map, ClipboardList, Cloud, Settings, Sprout, Droplets, Waves } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Farmers", path: "/farmers" },
  { icon: Map, label: "Plots", path: "/plots" },
  { icon: ClipboardList, label: "Tasks", path: "/tasks" },
  { icon: Cloud, label: "Weather", path: "/weather" },
  { icon: Droplets, label: "Crop Water", path: "/crop-water" },
  { icon: Waves, label: "Water Sources", path: "/water-sources" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
          <Sprout className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-primary-foreground">SmartFarm</h1>
          <p className="text-xs text-sidebar-foreground/60">Farm Management</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sm font-semibold text-sidebar-accent-foreground">
            JD
          </div>
          <div>
            <p className="text-sm font-medium text-sidebar-primary-foreground">John Doe</p>
            <p className="text-xs text-sidebar-foreground/60">Farm Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
