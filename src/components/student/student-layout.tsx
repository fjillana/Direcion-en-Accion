"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/shared/user-nav";
import {
  Home,
  ClipboardList,
  Trophy,
  Users,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: Home },
    { href: "/student/decisions", label: "Decisiones", icon: ClipboardList },
    { href: "/student/achievements", label: "Logros", icon: Trophy },
    { href: "/student/leaderboard", label: "Leaderboard", icon: Users },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/student/dashboard">
                <Briefcase className="h-6 w-6 text-primary" />
              </Link>
            </Button>
            <h2 className="text-lg font-semibold font-headline">
              Dirección en Acción
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <p className="text-sm font-medium">Equipo Beta - Ronda 3</p>
          </div>
          <UserNav userType="student" />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
