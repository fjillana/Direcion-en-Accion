

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
import type { Crisis } from "@/components/teacher/catalog-editor";

interface CrisisOption {
  id: string;
  label: string;
  cost: number;
  effect: string; // Keep effect for display purposes in catalog
}

// The component receives the full crisis data, but the options are simplified for the form
interface CrisisProps extends Omit<Crisis, 'options'> {
  options: CrisisOption[];
  disabled?: boolean;
}

interface FullCrisisFormProps extends CrisisProps {
    onResponseChange: (response: { crisisId: string; optionId: string; justification: string; crisisName: string; option: string; cost: number; }) => void;
    currentResponse: { crisisId: string; optionId: string; justification: string; crisisName: string; option: string; cost: number; } | null;
}

export function CrisisForm({ id, name, description, options, disabled = false, onResponseChange, currentResponse }: FullCrisisFormProps) {
  
  const handleOptionChange = (optionId: string) => {
    const selectedOption = options.find(o => o.id === optionId);
    if (!selectedOption) return;
    
    // Construct the response using props from the current crisis to avoid mismatches
    onResponseChange({
      crisisId: id, // Use the ID from props
      crisisName: name, // Use the name from props
      optionId: selectedOption.id,
      option: selectedOption.label,
      cost: selectedOption.cost,
      justification: currentResponse?.justification || "",
    });
  };

  const handleJustificationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const selectedOption = options.find(o => o.id === currentResponse?.optionId);
    
    // Ensure we are building the response object with the correct crisis data from props
    onResponseChange({
      crisisId: id, // Use ID from props
      crisisName: name, // Use name from props
      optionId: currentResponse?.optionId || "",
      option: selectedOption?.label || currentResponse?.option || "",
      cost: selectedOption?.cost || currentResponse?.cost || 0,
      justification: e.target.value,
    });
  };

  return (
    <Card className="bg-destructive/5 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">{name}</CardTitle>
        <CardDescription className="text-destructive/80">
          {description}
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
                <div className="flex-1">
                  <Label htmlFor={option.id} className="font-normal cursor-pointer flex-1">
                    <span className="font-semibold block">{option.label}</span>
                  </Label>
                </div>
                <div className="font-mono text-sm">{option.cost.toLocaleString('es-ES')} CC</div>
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
