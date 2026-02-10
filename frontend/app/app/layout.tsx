import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from "@/components/app/sidebar";
import AppMenuBar from "@/components/app/menubar";
import GradientBackground from "@/components/gradient-background";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <AppMenuBar />
      <div className="flex-1 overflow-hidden mb-12 md:mb-0">
        <main>{children}</main>
      </div>
      <GradientBackground
        className="-z-10 fixed"
        color="var(--primary)"
        bgColor="var(--background)"
      />
    </SidebarProvider>
  );
}