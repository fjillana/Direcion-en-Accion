
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Users,
  Briefcase,
  Award,
  Inbox,
  Target,
  LogOut,
  FileText,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useStudentGame } from "@/hooks/useStudentGame";
import { getAchievementsStatus } from "@/lib/achievements";
import { useMemo } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useGames } from "@/hooks/use-games";


export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { studentGame, abandonGame } = useStudentGame();
  const { getGameById } = useGames();
  const { user, logout } = useAuth();
  
  const performanceHistory = studentGame?.performanceHistory || [];
  
  const teamBadges = useMemo(() => {
    const unlocked = studentGame?.unlockedAchievements || [];
    return getAchievementsStatus(unlocked);
  }, [studentGame?.unlockedAchievements]);
  
  const unreadMessagesCount = useMemo(() => {
    if (!studentGame?.messages || !user) return 0;
    return studentGame.messages.filter(msg => !msg.readBy.includes(user.id)).length;
  }, [studentGame?.messages, user]);

  const menuItems = [
    { href: "/student/dashboard", label: "Dashboard", icon: Home },
    { href: "/student/decisions", label: "Inversiones", icon: ClipboardList },
    { href: "/student/strategic-plan", label: "Plan Estratégico", icon: Target },
    { href: "/student/leaderboard", label: "Leaderboard", icon: Users },
    { href: "/student/achievements", label: "Logros", icon: Award },
    { href: "/student/report", label: "Reporte", icon: FileText },
    { href: "/student/inbox", label: "Inbox", icon: Inbox, badgeCount: unreadMessagesCount },
  ];

  const handleLogout = async () => {
    await logout();
  }

  const game = studentGame?.gameId ? getGameById(studentGame.gameId) : null;
  const displayRound = game?.status === "Finalizado" ? game.numRounds : (studentGame?.round ?? 0) + 1;

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
        <SidebarContent className="flex flex-col">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                  <Link href={item.href} className="relative">
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badgeCount && item.badgeCount > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {item.badgeCount}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <div className="mt-auto flex justify-start p-2">
            {studentGame?.status === 'joined' && (
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="icon" className="w-full">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <LogOut className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>Abandonar Partida</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                          </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro de que quieres abandonar la partida?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminarán todos los datos de tu equipo en esta partida y tendrás que solicitar unirte de nuevo.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              onClick={abandonGame}
                          >
                              Sí, abandonar partida
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              )}
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="/student/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span>Dirección en acción</span>
                  </Link>
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn("hover:text-foreground relative",
                        pathname.startsWith(item.href) ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                       {item.badgeCount && item.badgeCount > 0 && (
                          <span className="absolute left-20 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                            {item.badgeCount}
                          </span>
                      )}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center gap-3">
              <p className="text-sm font-medium">
                  {studentGame?.teamName || 'Equipo'} - Ronda {displayRound}
              </p>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  {teamBadges.map((badge) => (
                      badge.unlocked &&
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
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" passHref>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
            </Link>
            <UserNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
