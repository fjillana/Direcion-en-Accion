
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AlertTriangle, FileText, MessageSquare } from "lucide-react";

const messages = [
  {
    type: "crisis",
    title: "¡Evento de Crisis! - Huelga docente",
    from: "Sistema",
    content: "La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza. Debes tomar una decisión en el Dashboard.",
    timestamp: "Hace 5 minutos",
    read: false,
  },
  {
    type: "report",
    title: "Nuevo Reporte de Ronda 2 Disponible",
    from: "Sistema",
    content: "El reporte de la Ronda 2 ya está disponible. Consulta tu rendimiento y las sugerencias del profesor en la sección 'Reporte de Ronda'.",
    timestamp: "Hace 1 hora",
    read: false,
  },
  {
    type: "message",
    title: "Duda sobre inversiones",
    from: "Profesor",
    fromAvatar: "https://picsum.photos/seed/teacher-avatar/40/40",
    content: "Equipo Beta, revisad vuestra asignación a 'Inversión en TIC'. El coste es mayor de lo que habéis presupuestado en el plan inicial. ¿Estáis seguros?",
    timestamp: "Hace 3 horas",
    read: true,
  },
  {
    type: "message",
    title: "Propuesta de alianza",
    from: "Equipo Gamma",
    fromAvatar: "https://picsum.photos/seed/gamma/40/40",
    content: "Hola Equipo Beta, hemos visto vuestro buen desempeño en reputación. ¿Estaríais interesados en no competir en el próximo contrato de publicidad?",
    timestamp: "Ayer",
    read: true,
  },
];

const getIcon = (type: string) => {
    switch (type) {
        case "crisis": return <AlertTriangle className="h-5 w-5 text-destructive" />;
        case "report": return <FileText className="h-5 w-5 text-blue-500" />;
        case "message": return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
        default: return null;
    }
}

export default function InboxPage() {
  return (
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
                {messages.map((msg, index) => (
                    <div
                    key={index}
                    className={cn(
                        "flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
                        !msg.read && "bg-muted/40"
                    )}
                    >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {msg.type === 'message' ? (
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={msg.fromAvatar} alt={msg.from} />
                                <AvatarFallback>{msg.from.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ) : getIcon(msg.type)}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                        <p className="font-semibold">
                            {msg.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium text-foreground/80">{msg.from}: </span>
                            {msg.content}
                        </p>
                    </div>
                    {!msg.read && (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                    )}
                    </div>
                ))}
                </div>
            </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

