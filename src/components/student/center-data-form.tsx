

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";

interface CenterDataFormProps {
  disabled?: boolean;
  selectedActions: string[];
  onActionChange: (selected: string[]) => void;
  tuitionPrice: number;
  onPriceChange: (price: number) => void;
  numStudents: number;
  numTeachers: number;
  capacity: number;
  previousTuitionPrice?: number;
}

const personnelActions = [
  { id: 'P2', name: 'Contratar Docente', cost: 7500, effect: '+10 XP Personal, +15 moral' },
  { id: 'P7', name: 'Despedir Docente', cost: 7500, effect: '−15 XP Personal, −25 moral' },
];

const capacityActions = [
    { id: 'F5', name: 'Ampliación de Aulas', cost: 50000, effect: '+10 XP Finanzas, +50 Plazas' },
];

export function CenterDataForm({ 
  disabled = false, 
  selectedActions, 
  onActionChange, 
  tuitionPrice, 
  onPriceChange, 
  numStudents, 
  numTeachers,
  capacity,
  previousTuitionPrice
}: CenterDataFormProps) {
  const { toast } = useToast();

  const handleCheckboxChange = (actionId: string, checked: boolean) => {
    const newActions = checked 
      ? [...selectedActions, actionId]
      : selectedActions.filter(id => id !== actionId);
    onActionChange(newActions);
  };
  
  const handlePriceInputChange = (newPrice: number) => {
    if (previousTuitionPrice !== undefined) {
      const maxAllowedPrice = previousTuitionPrice * 1.30;
      if (newPrice > maxAllowedPrice) {
        toast({
          variant: "destructive",
          title: "Subida de Precio Excesiva",
          description: `No puedes aumentar el precio más de un 30% por ronda. El precio máximo permitido es ${Math.floor(maxAllowedPrice).toLocaleString('es-ES')} CC.`,
        });
        return;
      }
    }
    onPriceChange(newPrice);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Centro</CardTitle>
        <CardDescription>
          Gestiona el personal, la capacidad y los precios de tu centro para esta ronda.
        </CardDescription>
      </CardHeader>
      <fieldset disabled={disabled} className="group">
        <CardContent className="space-y-6 group-disabled:opacity-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 border text-center flex flex-col justify-center">
                  <p className="text-sm text-muted-foreground">Nº de Alumnos</p>
                  <p className="text-2xl font-bold">{numStudents}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border text-center flex flex-col justify-center">
                  <p className="text-sm text-muted-foreground">Capacidad Total</p>
                  <p className="text-2xl font-bold">{capacity}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border text-center flex flex-col justify-center">
                  <p className="text-sm text-muted-foreground">Nº de Profesores</p>
                  <p className="text-2xl font-bold">{numTeachers}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border flex flex-col justify-center">
                <Label htmlFor="tuition-price" className="text-sm text-muted-foreground text-center mb-1">Precio Matrícula (CC)</Label>
                <Input 
                    id="tuition-price" 
                    type="number" 
                    value={tuitionPrice}
                    onChange={(e) => handlePriceInputChange(Number(e.target.value))}
                    className="text-center text-lg font-bold"
                />
              </div>
          </div>
          
          <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-lg">Personal Docente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personnelActions.map((action) => (
                        <div key={action.id} className="flex items-start space-x-3 rounded-md border p-4">
                            <Checkbox 
                                id={action.id} 
                                checked={selectedActions.includes(action.id)}
                                onCheckedChange={(checked) => handleCheckboxChange(action.id, !!checked)}
                            />
                            <div className="grid flex-1 gap-1.5 leading-none">
                                <label htmlFor={action.id} className="font-medium cursor-pointer">{action.name}</label>
                                <p className="text-sm text-muted-foreground">Efecto: {action.effect}</p>
                            </div>
                            <div className="font-mono text-right">{action.cost.toLocaleString('es-ES')} CC</div>
                        </div>
                    ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-lg">Infraestructura</h4>
                {capacityActions.map((action) => (
                    <div key={action.id} className="flex items-start space-x-3 rounded-md border p-4">
                          <Checkbox 
                            id={action.id} 
                            checked={selectedActions.includes(action.id)}
                            onCheckedChange={(checked) => handleCheckboxChange(action.id, !!checked)}
                          />
                          <div className="grid flex-1 gap-1.5 leading-none">
                            <label htmlFor={action.id} className="font-medium cursor-pointer">{action.name}</label>
                            <p className="text-sm text-muted-foreground">Efecto: {action.effect}</p>
                          </div>
                          <div className="font-mono text-right">{action.cost.toLocaleString('es-ES')} CC</div>
                    </div>
                ))}
              </div>
          </div>
        </CardContent>
      </fieldset>
    </Card>
  );
}
