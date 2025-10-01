
"use client";

import { UserNav } from "@/components/shared/user-nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Briefcase, LogOut } from "lucide-react";
import { useGame } from "@/hooks/use-game-context";
import { usePathname } from 'next/navigation';

export function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeGame, clearActiveGame } = useGame();

  const navItems = [
    { href: "/teacher/dashboard", label: "Dashboard" },
    { href: "/teacher/catalog", label: "Catálogos" },
    { href: "/teacher/leaderboard", label: "Leaderboard" },
    { href: "/teacher/inbox", label: "Inbox" },
  ];
  
  const getHref = (baseHref: string) => {
      if (baseHref === '/teacher/dashboard' || baseHref === '/teacher/catalog') {
          return baseHref;
      }
      return activeGame ? `${baseHref}?gameId=${activeGame.id}` : baseHref;
  }
  
  const handleExitGame = () => {
    clearActiveGame();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/teacher/dashboard"
            className="flex items-center gap-2 font-semibold text-foreground"
            onClick={handleExitGame}
          >
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="font-headline text-base">Dirección en acción</span>
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={getHref(item.href)}
              className={`transition-colors hover:text-foreground ${pathname.startsWith(item.href) ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/teacher/dashboard"
                onClick={handleExitGame}
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Briefcase className="h-6 w-6 text-primary" />
                <span>Dirección en acción</span>
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={getHref(item.href)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
           {activeGame && (
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Partida activa: <span className="text-foreground">{activeGame.name}</span></span>
             </div>
           )}
          <UserNav />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
