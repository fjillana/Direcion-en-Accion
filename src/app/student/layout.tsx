
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
  Library,
  Users,
  Briefcase,
  Award,
  DollarSign,
  HeartHandshake,
  Inbox,
  Target,
  ClipboardCheck,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStudentGame } from "@/hooks/useStudentGame";
import { StudentGate } from "@/components/student/student-gate";


const teamBadges = [
  { name: "El Financiero", icon: DollarSign, description: "Maestría en la gestión de las finanzas." },
  { name: "El de RR.PP.", icon: HeartHandshake, description: "Excelente reputación y relaciones públicas." },
  { name: "El de Equipo", icon: Award, description: "Gran gestión del personal y alta moral.", unlocked: false },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { studentGame } = useStudentGame();

  const menuItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: Home },
    { href: "/student/decisions", label: "Inversiones", icon: ClipboardList },
    { href: "/student/strategic-plan", label: "Plan Estratégico", icon: Target },
    { href: "/student/report", label: "Reporte de Ronda", icon: Library },
    { href: "/student/leaderboard", label: "Leaderboard", icon: Users },
    { href: "/student/inbox", label: "Inbox", icon: Inbox },
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
          <div className="hidden md:flex items-center gap-3">
             <p className="text-sm font-medium">
                {studentGame?.teamName || 'Equipo'} - Ronda {studentGame?.round || 1}
              </p>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  {teamBadges.map((badge) => (
                      badge.unlocked !== false &&
                      <Tooltip key={badge.name}>
                          <TooltipTrigger>
                              <Badge variant="secondary" className="px-2 py-1"><badge.icon className="h-4 w-4" /></Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p className="font-semibold">{badge.name}</p>
                              <p className="text-sm text-muted-foreground">{badge.description}</p>
                          </TooltipContent>
                      </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
          </div>
          <UserNav userType="student" />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
            <StudentGate>
              {children}
            </StudentGate>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
