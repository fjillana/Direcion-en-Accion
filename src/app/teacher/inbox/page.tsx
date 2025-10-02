
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/hooks/use-game-context';
import { useGames, type GameMessage } from '@/hooks/use-games';
import { useAuth } from '@/hooks/use-auth';

export default function InboxPage() {
  const { activeGame } = useGame();
  const { addMessage, markMessageAsRead } = useGames();
  const { user } = useAuth();

  const teams = useMemo(() => activeGame?.teamNames.map(name => ({ id: name, name, avatar: `https://picsum.photos/seed/${name}/40/40` })) || [], [activeGame]);
  
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  const unreadMessagesByTeam = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!activeGame || !activeGame.messages || !user) return counts;
    
    activeGame.teamNames.forEach(teamId => {
      counts[teamId] = activeGame.messages.filter(msg => msg.from === teamId && !msg.readBy.includes('teacher-user-id')).length;
    });

    return counts;
  }, [activeGame, user]);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
    if(teams.length === 0 && selectedTeamId) {
        setSelectedTeamId(null);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    if(selectedTeamId && activeGame?.id) {
        const teamMessages = activeGame.messages?.filter(msg => msg.from === selectedTeamId && !msg.readBy.includes('teacher-user-id')) || [];
        if(teamMessages.length > 0) {
            teamMessages.forEach(msg => {
                markMessageAsRead(activeGame.id, msg.id, 'teacher-user-id');
            });
        }
    }
  }, [selectedTeamId, activeGame, markMessageAsRead]);

  const messages = useMemo(() => {
    if (!activeGame || !activeGame.messages || !selectedTeamId) return [];
    return activeGame.messages.filter(msg => 
      (msg.from === selectedTeamId && msg.to === 'teacher') ||
      (msg.from === 'teacher' && msg.to === selectedTeamId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  }, [activeGame, selectedTeamId]);


  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !activeGame || !selectedTeamId) return;
    addMessage(activeGame.id, {
      from: 'teacher',
      to: selectedTeamId,
      content: newMessage,
    });
    setNewMessage('');
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  if (!activeGame) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inbox</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-muted-foreground">Por favor, selecciona una partida para ver los mensajes.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-10rem)]">
      <Card>
        <CardHeader>
          <CardTitle>Equipos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="space-y-1">
              {teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={cn(
                    'flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors relative',
                    selectedTeamId === team.id && 'bg-muted'
                  )}
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={`https://picsum.photos/seed/${team.id}/40/40`} alt={team.name} />
                    <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="font-semibold">{team.name}</p>
                  </div>
                  {unreadMessagesByTeam[team.id] > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {unreadMessagesByTeam[team.id]}
                      </div>
                  )}
                </button>
              ))}
              {teams.length === 0 && <p className="text-center py-4 text-sm text-muted-foreground">No hay equipos en esta partida.</p>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        {selectedTeam ? (
          <>
            <CardHeader className="flex-row items-center gap-3 space-y-0 border-b">
               <Avatar className="h-10 w-10 border">
                  <AvatarImage src={`https://picsum.photos/seed/${selectedTeam.id}/40/40`} alt={selectedTeam.name} />
                  <AvatarFallback>{selectedTeam.name.charAt(0)}</AvatarFallback>
                </Avatar>
              <CardTitle>{selectedTeam.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 overflow-y-auto">
              <ScrollArea className="h-full pr-4">
                 <div className="space-y-4">
                 {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                      msg.from === 'teacher' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                 </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t">
              <div className="flex w-full items-center space-x-2">
                <Input 
                  placeholder="Escribe un mensaje..."
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
          </>
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Selecciona un equipo para ver los mensajes.</p>
            </div>
        )}
      </Card>
    </div>
  );
}
