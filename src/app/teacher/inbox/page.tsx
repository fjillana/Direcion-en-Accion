
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const teams = [
  { id: 'alfa', name: 'Equipo Alfa', avatar: '/avatars/alfa.png', lastMessage: 'Tenemos una duda sobre la inversión F3.' },
  { id: 'beta', name: 'Equipo Beta', avatar: '/avatars/beta.png', lastMessage: 'Ok, entendido. Gracias!' },
  { id: 'gamma', name: 'Equipo Gamma', avatar: '/avatars/gamma.png', lastMessage: '¿Podemos solicitar un préstamo?' },
  { id: 'delta', name: 'Equipo Delta', avatar: '/avatars/delta.png', lastMessage: 'Confirmamos las decisiones.' },
];

const messagesData = {
  alfa: [
    { from: 'team', text: 'Hola profesor, tenemos una duda sobre la inversión F3, ¿cubre cualquier tipo de sanción legal?' },
    { from: 'teacher', text: 'Hola Equipo Alfa. El seguro de responsabilidad civil (F3) cubre las sanciones económicas derivadas de eventos negativos, pero no todas las posibles sanciones. Leed bien la descripción.' },
    { from: 'team', text: 'Tenemos una duda sobre la inversión F3.' },
  ],
  beta: [
    { from: 'teacher', text: 'Equipo Beta, recordad que el plazo para enviar decisiones termina en 1 hora.' },
    { from: 'team', text: 'Ok, entendido. Gracias!' },
  ],
  gamma: [
     { from: 'team', text: '¿Podemos solicitar un préstamo?' },
  ],
  delta: [
     { from: 'team', text: 'Confirmamos las decisiones.' },
  ]
};

type Message = { from: 'team' | 'teacher', text: string };

export default function InboxPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('alfa');
  const [messages, setMessages] = useState<Record<string, Message[]>>(messagesData);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const newMessagesForTeam = [...(messages[selectedTeamId] || []), { from: 'teacher', text: newMessage }];
    setMessages(prev => ({...prev, [selectedTeamId]: newMessagesForTeam}));
    setNewMessage('');
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

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
                    'flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors',
                    selectedTeamId === team.id && 'bg-muted'
                  )}
                >
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={`https://picsum.photos/seed/${team.id}/40/40`} alt={team.name} />
                    <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{team.lastMessage}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        {selectedTeam && (
          <>
            <CardHeader className="flex-row items-center gap-3 space-y-0 border-b">
               <Avatar className="h-10 w-10 border">
                  <AvatarImage src={`https://picsum.photos/seed/${selectedTeam.id}/40/40`} alt={selectedTeam.name} />
                  <AvatarFallback>{selectedTeam.name.charAt(0)}</AvatarFallback>
                </Avatar>
              <CardTitle>{selectedTeam.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 space-y-4 overflow-y-auto">
              <ScrollArea className="h-full pr-4">
                 {(messages[selectedTeamId] || []).map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                      msg.from === 'teacher' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    {msg.text}
                  </div>
                ))}
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
        )}
      </Card>
    </div>
  );
}
