import AppSidebar from "./AppSidebar";
import FarmerChatbot from "./FarmerChatbot";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-8">{children}</main>
      <FarmerChatbot />
    </div>
  );
};

export default AppLayout;
