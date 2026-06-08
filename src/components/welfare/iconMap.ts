import {
  Sprout,
  ShieldCheck,
  CreditCard,
  Droplets,
  Leaf,
  BadgeIndianRupee,
  CloudSun,
  Waves,
  TreePine,
  Sun,
  Users,
  Wallet,
  FileCheck,
  Activity,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Sprout,
  ShieldCheck,
  CreditCard,
  Droplets,
  Leaf,
  BadgeIndianRupee,
  CloudSun,
  Waves,
  TreePine,
  Sun,
  Users,
  Wallet,
  FileCheck,
  Activity,
};

export const getIcon = (name: string): LucideIcon => iconMap[name] ?? Sprout;