
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Investment } from "@/components/teacher/catalog-editor";

interface InvestmentFormProps {
  disabled?: boolean;
  availableInvestments: Investment[];
  selectedInvestments: string[];
  onInvestmentChange: (selected: string[]) => void;
  totalOtherCosts: number;
  teamCash: number;
}

export function InvestmentForm({ disabled = false, availableInvestments, selectedInvestments, onInvestmentChange, totalOtherCosts, teamCash }: InvestmentFormProps) {
  const [confirmed, setConfirmed] = useState(false);

  const investmentCost = selectedInvestments.reduce((acc, id) => {
    const investment = availableInvestments.find(inv => inv.id === id);
    // A simple way to get a deterministic cost from a range string for simulation
    const costString = investment?.costRange.split('-')[0].replace(/\D/g, '') || '0';
    return acc + (parseInt(costString, 10));
  }, 0);

  const totalCost = investmentCost + totalOtherCosts;
  const remainingCash = teamCash - totalCost;
  const canAfford = remainingCash >= 0;

  const handleCheckboxChange = (investmentId: string, checked: boolean) => {
    if (confirmed || disabled) return;
    onInvestmentChange(
      checked ? [...selectedInvestments, investmentId] : selectedInvestments.filter(id => id !== investmentId)
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
      <Card>
        <CardHeader>
          <CardTitle>Decisiones de Inversión</CardTitle>
          <CardDescription>
            Selecciona las inversiones que tu equipo realizará en esta ronda. El coste se sumará al de las decisiones de personal y capacidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmed && !disabled && (
            <Alert variant="default" className="mb-6 bg-emerald-50 border-emerald-200">
              <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
              <AlertTitle className="text-emerald-800">Decisiones Confirmadas</AlertTitle>
              <AlertDescription className="text-emerald-700">
                Tus decisiones han sido guardadas. Aún puedes revertir esto antes de que el profesor procese la ronda.
              </AlertDescription>
            </Alert>
          )}
          {!canAfford && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fondos Insuficientes</AlertTitle>
              <AlertDescription>
                El coste total de las decisiones supera tu tesorería disponible.
              </AlertDescription>
            </Alert>
          )}

          <fieldset disabled={isEffectivelyDisabled} className="group">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 group-disabled:opacity-50">
              <div className="lg:col-span-2 space-y-4">
                {availableInvestments.length > 0 ? availableInvestments.map((inv) => (
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
                        {inv.costRange} CC
                    </div>
                  </div>
                )) : (
                    <div className="flex items-center justify-center h-full rounded-lg border border-dashed">
                        <p className="text-muted-foreground text-center p-8">El profesor no ha habilitado ninguna inversión para esta ronda.</p>
                    </div>
                )}
              </div>
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
                              <span className="text-muted-foreground">Coste Total Decisiones:</span>
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
                              <Button onClick={handleConfirm} className="w-full" disabled={!canAfford}>Confirmar Decisiones</Button>
                          )}
                      </CardFooter>
                  </Card>
              </div>
            </div>
          </fieldset>
        </CardContent>
      </Card>
    </>
  );
}
