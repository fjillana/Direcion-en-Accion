
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

interface CrisisFormProps {
  disabled?: boolean;
}

export function CrisisForm({ disabled = false }: CrisisFormProps) {
  const crisisOptions = [
    { id: 'op1', label: 'Aceptar todas las demandas (-25.000 CC)' },
    { id: 'op2', label: 'Negociar un acuerdo parcial (-15.000 CC)' },
    { id: 'op3', label: 'Mantener la postura' },
    { id: 'op4', label: 'Recurrir a mediadores externos (-8.000 CC)' },
    { id: 'op5', label: 'Despedir a los líderes del sindicato (-10.000 CC)' },
  ];
  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">¡Evento de Crisis!</CardTitle>
        <CardDescription className="text-destructive/80">
          C1 - Huelga docente: La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.
        </CardDescription>
      </CardHeader>
      <fieldset disabled={disabled} className="group">
        <CardContent className="space-y-4 group-disabled:opacity-50">
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
        <CardFooter className="group-disabled:opacity-50">
          <Button className="w-full" variant="destructive">
            Confirmar Respuesta a la Crisis
          </Button>
        </CardFooter>
      </fieldset>
    </Card>
  );
}
