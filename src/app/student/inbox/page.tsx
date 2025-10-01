
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertTriangle, FileText, MessageSquare, Send } from "lucide-react";
import { StudentGate } from "@/components/student/student-gate";
import { useStudentGame } from "@/hooks/useStudentGame";
import { useGames } from "@/hooks/use-games";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const { markMessageAsRead, addMessage } = useGames();
  const [newMessage, setNewMessage] = useState('');
  
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

  const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);

  const getSenderName = (from: string) => {
    if (from === 'teacher') return 'Profesor';
    if (from === 'system') return 'Sistema';
    return from; // Team name
  }
  
  const handleSendMessage = () => {
    if (!gameId || !teamName || newMessage.trim() === '') return;
    
    addMessage(gameId, {
      from: teamName,
      to: 'teacher',
      content: newMessage,
      type: 'message',
      readBy: [userId],
    });
    setNewMessage('');
  };

  return (
    <StudentGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Bandeja de Entrada</h1>
          <p className="text-muted-foreground">
            Comunicaciones del profesor, otros equipos y notificaciones del sistema.
          </p>
        </div>
        <Card className="flex flex-col h-[calc(100vh-16rem)]">
          <CardHeader>
            <CardTitle>Mensajes Recientes</CardTitle>
            <CardDescription>
              Aquí encontrarás todas las notificaciones y mensajes importantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
              <ScrollArea className="h-full">
                  <div className="space-y-6 pr-4">
                  {sortedMessages.map((msg) => {
                    const isSender = msg.from === teamName;
                    const senderName = getSenderName(msg.from);
                    return (
                      <div
                      key={msg.id}
                      className={cn(
                          "flex items-end gap-3",
                          isSender ? "justify-end" : "justify-start"
                      )}
                      >
                       {!isSender && (
                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                                {msg.from !== 'system' ? (
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarImage src={`https://picsum.photos/seed/${msg.from}/40/40`} alt={senderName} />
                                        <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ) : getIcon(msg.type || 'message')}
                            </div>
                       )}
                       <div className={cn("max-w-md rounded-lg p-3", isSender ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                          <p className="text-sm font-medium leading-none">
                              {msg.title || senderName}
                          </p>
                          <p className="text-sm mt-1">
                              {msg.content}
                          </p>
                          <p className={cn("text-xs mt-2", isSender ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: es })}
                          </p>
                       </div>
                       {isSender && (
                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                               <Avatar className="h-10 w-10 border">
                                   <AvatarImage src={`https://picsum.photos/seed/${teamName}/40/40`} alt={teamName} />
                                   <AvatarFallback>{teamName.charAt(0)}</AvatarFallback>
                               </Avatar>
                           </div>
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
           <CardFooter className="p-4 border-t">
              <div className="flex w-full items-center space-x-2">
                <Input 
                  placeholder="Escribe un mensaje para el profesor..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Enviar</span>
                </Button>
              </div>
            </CardFooter>
        </Card>
      </div>
    </StudentGate>
  );
}
