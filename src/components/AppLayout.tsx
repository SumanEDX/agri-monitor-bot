import { useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isWelfare = pathname.startsWith("/welfare");

  if (isWelfare) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
};

export default AppLayout;
