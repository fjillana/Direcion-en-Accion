

"use client";
import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Investment } from "@/components/teacher/catalog-editor";
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

interface InvestmentFormProps {
  disabled?: boolean;
  availableInvestments: Investment[];
  selectedActions: string[];
  investmentCosts: Record<string, number>;
  onActionChange: (actionId: string, selected: boolean) => void;
  onCostChange: (investmentId: string, cost: number) => void;
  onSave: () => void;
  isSaving: boolean;
  teamCash: number;
}

const centerActionsCostMap: Record<string, number> = {
    'P2': 0, // Contratar no tiene coste de inversión, es gasto recurrente
    'P7': 7500, // Despedir tiene coste de indemnización
    'F5': 50000, // Ampliación de aulas
};


export function InvestmentForm({ 
  disabled = false, 
  availableInvestments, 
  selectedActions, 
  investmentCosts,
  onActionChange, 
  onCostChange,
  onSave,
  isSaving,
  teamCash 
}: InvestmentFormProps) {

  const totalCost = useMemo(() => {
    // Sum costs from variable investments (sliders)
    const variableCost = selectedActions.reduce((acc, id) => {
      // Only sum if it's a variable investment, not a center action
      if (availableInvestments.some(inv => inv.id === id)) {
        return acc + (investmentCosts[id] || 0);
      }
      return acc;
    }, 0);

    // Sum costs from fixed center actions (checkboxes on dashboard)
    const fixedCost = selectedActions.reduce((acc, id) => {
      if (id in centerActionsCostMap) {
        return acc + centerActionsCostMap[id];
      }
      return acc;
    }, 0);

    return variableCost + fixedCost;
  }, [selectedActions, investmentCosts, availableInvestments]);


  const remainingCash = teamCash - totalCost;
  const canAfford = remainingCash >= 0;
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Decisiones de Inversión</CardTitle>
          <CardDescription>
            Selecciona las inversiones que tu equipo realizará en esta ronda. El coste se sumará al de las decisiones de personal y capacidad.
          </CardDescription>
        </CardHeader>
        <fieldset disabled={disabled} className="group">
          <CardContent className="group-disabled:opacity-50">
            {!canAfford && !disabled && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fondos Insuficientes</AlertTitle>
                <AlertDescription>
                  El coste total de las decisiones supera tu tesorería disponible.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {availableInvestments.length > 0 ? availableInvestments.map((inv) => {
                  const isSelected = selectedActions.includes(inv.id);
                  const isRange = inv.cost.type === 'range';
                  const [minCost, maxCost] = isRange ? inv.cost.value as [number, number] : [inv.cost.value as number, inv.cost.value as number];
                  const currentCost = investmentCosts[inv.id] || maxCost;

                  return (
                    <div key={inv.id} className={cn("rounded-md border p-4", disabled && 'bg-muted/50')}>
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id={inv.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => onActionChange(inv.id, !!checked)}
                            />
                            <div className="grid flex-1 gap-1.5 leading-none">
                                <label htmlFor={inv.id} className="font-medium cursor-pointer">
                                {inv.name}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    {inv.description}
                                </p>
                            </div>
                            <div className="font-mono text-right text-sm">
                                {isRange 
                                  ? `${minCost.toLocaleString('es-ES')} - ${maxCost.toLocaleString('es-ES')} CC`
                                  : `${minCost.toLocaleString('es-ES')} CC`}
                            </div>
                        </div>
                        {isRange && isSelected && (
                            <div className="mt-4 pl-8 pr-2 space-y-2">
                                <Label className="text-xs text-muted-foreground">Ajustar Inversión (Coste actual: {currentCost.toLocaleString('es-ES')} CC)</Label>
                                <Slider
                                    defaultValue={[currentCost]}
                                    min={minCost}
                                    max={maxCost}
                                    step={(maxCost - minCost) / 10 || 1}
                                    onValueChange={(value) => onCostChange(inv.id, value[0])}
                                />
                            </div>
                        )}
                    </div>
                  );
                }) : (
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
                  </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter className="group-disabled:opacity-50">
             <Button onClick={onSave} disabled={isSaving || disabled || !canAfford}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Guardando...' : 'Guardar Decisiones'}
             </Button>
          </CardFooter>
        </fieldset>
      </Card>
    </>
  );
}
