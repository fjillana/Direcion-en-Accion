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
    { id: "op1", label: "Negociar con el sindicato (Costo: $5,000)" },
    { id: "op2", label: "Contratar trabajadores temporales (Costo: $8,000)" },
    {
      id: "op3",
      label: "Ignorar las demandas (Costo: $0, Riesgo de huelga prolongada)",
    },
    { id: "op4", label: "Ofrecer un bono único (Costo: $12,000)" },
    { id: "op5", label: "Mejorar beneficios no salariales (Costo: $6,000)" },
  ];
  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">¡Evento de Crisis!</CardTitle>
        <CardDescription className="text-destructive/80">
          Una huelga de trabajadores amenaza con paralizar la producción. Debes
          tomar decisiones rápidas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Selecciona una o más opciones:</Label>
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
