
"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const availableInvestments = [
  { id: 'F1', name: 'Implantación de ERP', cost: 25000, effect: '+5 a +10 XP Finanzas' },
  { id: 'R1', name: 'Campaña publicitaria en redes', cost: 10000, effect: '+2 a +10 XP Reputación' },
  { id: 'P1', name: 'Formación docente', cost: 7500, effect: '+5 XP Personal, +10-20 moral' },
  { id: 'R2', name: 'Inversión en TIC', cost: 50000, effect: '+3 a +15 XP Reputación, +3 XP Personal' },
];

const teamCash = 65000;

interface InvestmentFormProps {
  disabled?: boolean;
}

export function InvestmentForm({ disabled = false }: InvestmentFormProps) {
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  const totalCost = selectedInvestments.reduce((acc, id) => {
    const investment = availableInvestments.find(inv => inv.id === id);
    return acc + (investment?.cost || 0);
  }, 0);

  const remainingCash = teamCash - totalCost;
  const canAfford = remainingCash >= 0;

  const handleCheckboxChange = (investmentId: string, checked: boolean) => {
    if (confirmed || disabled) return;
    setSelectedInvestments(prev =>
      checked ? [...prev, investmentId] : prev.filter(id => id !== investmentId)
    );
  };

  const handleConfirm = () => {
    if (!canAfford) return;
    setConfirmed(true);
  };
  
  const handleRevert = () => {
    setConfirmed(false);
  };

  const isEffectivelyDisabled = disabled || confirmed;

  return (
    <>
      {confirmed && !disabled && (
        <Alert variant="default" className="mb-6 bg-emerald-50 border-emerald-200">
           <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
          <AlertTitle className="text-emerald-800">Decisiones Confirmadas</AlertTitle>
          <AlertDescription className="text-emerald-700">
            Tus inversiones han sido guardadas. Aún puedes revertir esta decisión antes de que el profesor procese la ronda.
          </AlertDescription>
        </Alert>
      )}
      {!canAfford && (
         <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fondos Insuficientes</AlertTitle>
          <AlertDescription>
            El coste total de las inversiones seleccionadas supera tu tesorería disponible.
          </AlertDescription>
        </Alert>
      )}

      <fieldset disabled={isEffectivelyDisabled} className="group">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 group-disabled:opacity-50">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inversiones de la Ronda</CardTitle>
              <CardDescription>
                Selecciona las inversiones que tu equipo realizará en esta ronda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableInvestments.map((inv) => (
                <div
                  key={inv.id}
                  className={cn("flex items-start space-x-3 rounded-md border p-4", confirmed && 'bg-muted/50')}
                >
                  <Checkbox
                    id={inv.id}
                    checked={selectedInvestments.includes(inv.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(inv.id, !!checked)}
                  />
                  <div className="grid flex-1 gap-1.5 leading-none">
                    <label htmlFor={inv.id} className="font-medium cursor-pointer">
                      {inv.name}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Efecto: {inv.effect}
                    </p>
                  </div>
                  <div className="font-mono text-right">
                      {inv.cost.toLocaleString('es-ES')} CC
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle>Resumen Financiero</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Tesorería Disponible:</span>
                          <span className="font-mono">{teamCash.toLocaleString('es-ES')} CC</span>
                      </div>
                       <div className="flex justify-between">
                          <span className="text-muted-foreground">Coste Total Inversiones:</span>
                          <span className="font-mono text-red-600">- {totalCost.toLocaleString('es-ES')} CC</span>
                      </div>
                       <div className="flex justify-between font-bold text-base pt-2 border-t">
                          <span>Tesorería Restante:</span>
                          <span className={cn("font-mono", !canAfford && "text-destructive")}>{remainingCash.toLocaleString('es-ES')} CC</span>
                      </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                      {confirmed ? (
                          <Button onClick={handleRevert} className="w-full" variant="outline">Revertir Decisiones</Button>
                      ) : (
                          <Button onClick={handleConfirm} className="w-full" disabled={!canAfford || selectedInvestments.length === 0}>Confirmar Decisiones</Button>
                      )}
                  </CardFooter>
              </Card>
          </div>
        </div>
      </fieldset>
    </>
  );
}
