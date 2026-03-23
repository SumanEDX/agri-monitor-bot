import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "warning" | "info";
}

const variantStyles = {
  default: "bg-card border border-border",
  primary: "bg-primary/10 border border-primary/20",
  warning: "bg-warning/10 border border-warning/20",
  info: "bg-info/10 border border-info/20",
};

const iconStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/20 text-primary",
  warning: "bg-warning/20 text-warning",
  info: "bg-info/20 text-info",
};

const StatCard = ({ title, value, change, icon: Icon, variant = "default" }: StatCardProps) => {
  return (
    <div className={cn("rounded-xl p-5 transition-all hover:shadow-md", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 text-card-foreground">{value}</p>
          {change && (
            <p className="text-xs mt-2 text-primary font-medium">{change}</p>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
