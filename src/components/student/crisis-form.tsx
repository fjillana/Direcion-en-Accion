
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

type CrisisOption = {
  id: string;
  label: string;
};

export interface CrisisProps {
  id: string;
  title: string;
  description: string;
  options: CrisisOption[];
  disabled?: boolean;
}

export function CrisisForm({ id, title, description, options, disabled = false }: CrisisProps) {
  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">{title}</CardTitle>
        <CardDescription className="text-destructive/80">
          {id} - {description}
        </CardDescription>
      </CardHeader>
      <fieldset disabled={disabled} className="group">
        <CardContent className="space-y-4 group-disabled:opacity-50">
          <div className="space-y-2">
            <Label>Selecciona una opción:</Label>
            {options.map((option) => (
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
