
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CenterDataFormProps {
  disabled?: boolean;
}

const personnelActions = [
  { id: 'P2', name: 'Contratar Docente', cost: 7500, effect: '+10 XP Personal, +15 moral' },
  { id: 'P7', name: 'Despedir Docente', cost: 7500, effect: '−15 XP Personal, −25 moral' },
];

const capacityActions = [
    { id: 'F5', name: 'Ampliación de Aulas', cost: 50000, effect: '+10 XP Finanzas' },
];

export function CenterDataForm({ disabled = false }: CenterDataFormProps) {
  // This state would be lifted up to the parent component
  // const [selectedActions, setSelectedActions] = useState<string[]>([]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del Centro</CardTitle>
        <CardDescription>
          Gestiona el personal y la capacidad de tu centro.
        </CardDescription>
      </CardHeader>
      <fieldset disabled={disabled} className="group">
        <CardContent className="space-y-6 group-disabled:opacity-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Center Data Display */}
            <div className="md:col-span-1 space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Nº de Alumnos</p>
                    <p className="text-2xl font-bold">810</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Capacidad Total</p>
                    <p className="text-2xl font-bold">810</p>
                </div>
                 <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Nº de Profesores</p>
                    <p className="text-2xl font-bold">32</p>
                </div>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 space-y-4">
               <div>
                    <h4 className="font-medium mb-2">Personal Docente</h4>
                     {personnelActions.map((action) => (
                        <div key={action.id} className="flex items-start space-x-3 rounded-md border p-4 mb-2">
                             <Checkbox id={action.id} />
                             <div className="grid flex-1 gap-1.5 leading-none">
                                <label htmlFor={action.id} className="font-medium cursor-pointer">{action.name}</label>
                                <p className="text-sm text-muted-foreground">Efecto: {action.effect}</p>
                             </div>
                             <div className="font-mono text-right">{action.cost.toLocaleString('es-ES')} CC</div>
                        </div>
                     ))}
               </div>
               <div>
                    <h4 className="font-medium mb-2">Infraestructura</h4>
                     {capacityActions.map((action) => (
                        <div key={action.id} className="flex items-start space-x-3 rounded-md border p-4">
                             <Checkbox id={action.id} />
                             <div className="grid flex-1 gap-1.5 leading-none">
                                <label htmlFor={action.id} className="font-medium cursor-pointer">{action.name}</label>
                                <p className="text-sm text-muted-foreground">Efecto: {action.effect}</p>
                             </div>
                             <div className="font-mono text-right">{action.cost.toLocaleString('es-ES')} CC</div>
                        </div>
                     ))}
               </div>
            </div>
          </div>
        </CardContent>
      </fieldset>
    </Card>
  );
}
