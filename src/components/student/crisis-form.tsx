"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CrisisForm() {
  const crisisOptions = [
    { id: 'op1', label: 'Aceptar todas las demandas (+30 moral, -25k CC)' },
    { id: 'op2', label: 'Negociar un acuerdo parcial (+20 moral, -15k CC)' },
    { id: 'op3', label: 'Mantener la postura (huelga 2 rondas, -20 XP all)' },
    { id: 'op4', label: 'Recurrir a mediadores externos (+15 moral, -8k CC)' },
    { id: 'op5', label: 'Despedir a los líderes del sindicato (-30 moral, -10k CC)' },
  ];
  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">¡Evento de Crisis!</CardTitle>
        <CardDescription className="text-destructive/80">
          C1 - Huelga docente: La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Selecciona una opción:</Label>
          {crisisOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox id={option.id} />
              <Label htmlFor={option.id} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="justification">Justifica tu elección:</Label>
          <Textarea
            id="justification"
            placeholder="Explica el razonamiento detrás de tus decisiones..."
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="destructive">
          Confirmar Respuesta a la Crisis
        </Button>
      </CardFooter>
    </Card>
  );
}
