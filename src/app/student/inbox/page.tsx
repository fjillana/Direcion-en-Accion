
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertTriangle, FileText, MessageSquare } from "lucide-react";
import { StudentGate } from "@/components/student/student-gate";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useGames } from "@/hooks/use-games";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect } from "react";

const getIcon = (type: string) => {
    switch (type) {
        case "crisis": return <AlertTriangle className="h-5 w-5 text-destructive" />;
        case "report": return <FileText className="h-5 w-5 text-blue-500" />;
        case "message": return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
        default: return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
    }
}

export default function InboxPage() {
  const { studentGame } = useStudentGame();
  const { markMessageAsRead } = useGames();
  
  const messages = studentGame?.messages || [];
  const teamName = studentGame?.teamName || '';
  const userId = studentGame?.userId || '';
  const gameId = studentGame?.gameId || '';
  
  useEffect(() => {
    if (gameId && userId && messages.length > 0) {
      messages.forEach(msg => {
        if (!msg.readBy.includes(userId)) {
          markMessageAsRead(gameId, msg.id, userId);
        }
      });
    }
  }, [messages, gameId, userId, markMessageAsRead]);

  const sortedMessages = [...messages].sort((a, b) => b.timestamp - a.timestamp);

  const getSenderName = (from: string) => {
    if (from === 'teacher') return 'Profesor';
    if (from === 'system') return 'Sistema';
    return from; // Team name
  }

  return (
    <StudentGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Bandeja de Entrada</h1>
          <p className="text-muted-foreground">
            Comunicaciones del profesor, otros equipos y notificaciones del sistema.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Mensajes Recientes</CardTitle>
            <CardDescription>
              Aquí encontrarás todas las notificaciones y mensajes importantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <ScrollArea className="h-[60vh]">
                  <div className="space-y-4">
                  {sortedMessages.map((msg) => {
                    const isRead = msg.readBy.includes(userId);
                    const senderName = getSenderName(msg.from);
                    return (
                      <div
                      key={msg.id}
                      className={cn(
                          "flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                          !isRead && "bg-muted/40"
                      )}
                      >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {msg.from !== 'system' ? (
                              <Avatar className="h-10 w-10 border">
                                  <AvatarImage src={`https://picsum.photos/seed/${msg.from}/40/40`} alt={senderName} />
                                  <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                              </Avatar>
                          ) : getIcon(msg.type || 'message')}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center justify-between">
                          <p className="font-semibold">
                              {msg.title || 'Mensaje'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: es })}
                          </p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium text-foreground/80">{senderName}: </span>
                              {msg.content}
                          </p>
                      </div>
                      {!isRead && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                      )}
                      </div>
                  )})}
                  {sortedMessages.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No tienes mensajes nuevos.
                    </div>
                  )}
                  </div>
              </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </StudentGate>
  );
}
