
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type CrisisOption = {
  id: string;
  label: string;
  effect: string;
};

export interface CrisisProps {
  id: string;
  title: string;
  description: string;
  options: CrisisOption[];
  disabled?: boolean;
}

interface FullCrisisFormProps extends CrisisProps {
    onResponseChange: (response: { crisisId: string; optionId: string; justification: string }) => void;
    currentResponse: { crisisId: string; optionId: string; justification: string } | null;
}

export function CrisisForm({ id, title, description, options, disabled = false, onResponseChange, currentResponse }: FullCrisisFormProps) {
  
  const handleOptionChange = (optionId: string) => {
    onResponseChange({
      crisisId: id,
      optionId: optionId,
      justification: currentResponse?.justification || "",
    });
  };

  const handleJustificationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onResponseChange({
      crisisId: id,
      optionId: currentResponse?.optionId || "",
      justification: e.target.value,
    });
  };

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
          <RadioGroup 
            className="space-y-2"
            value={currentResponse?.optionId}
            onValueChange={handleOptionChange}
          >
            <Label>Selecciona una opción:</Label>
            {options.map((option) => (
              <div key={option.id} className="flex items-start space-x-2 rounded-md border p-3 bg-background/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                <RadioGroupItem value={option.id} id={option.id} className="mt-1"/>
                <Label htmlFor={option.id} className="font-normal cursor-pointer flex-1">
                  <span className="font-semibold block">{option.label}</span>
                  <span className="text-xs text-muted-foreground">Efecto: {option.effect}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="space-y-2">
            <Label htmlFor="justification">Justifica tu elección:</Label>
            <Textarea
              id="justification"
              placeholder="Explica el razonamiento detrás de tus decisiones..."
              value={currentResponse?.justification || ""}
              onChange={handleJustificationChange}
            />
          </div>
        </CardContent>
      </fieldset>
    </Card>
  );
}
