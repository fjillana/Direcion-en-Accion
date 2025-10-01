
"use client";
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Investment } from "@/components/teacher/catalog-editor";
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import type { InvestmentDecision } from '@/hooks/use-games';

interface InvestmentFormProps {
  disabled?: boolean;
  availableInvestments: Investment[];
  selectedInvestments: InvestmentDecision[];
  onInvestmentChange: (selected: InvestmentDecision[]) => void;
  totalOtherCosts: number;
  teamCash: number;
}

const parseCostRange = (costRange: string): [number, number] | [number] => {
  const numbers = costRange.replace(/[^0-9-]/g, '').split('-').map(Number);
  if (numbers.length > 1) {
    return [numbers[0], numbers[1]];
  }
  return [numbers[0]];
};

export function InvestmentForm({ 
  disabled = false, 
  availableInvestments, 
  selectedInvestments, 
  onInvestmentChange, 
  totalOtherCosts, 
  teamCash 
}: InvestmentFormProps) {

  const handleCheckboxChange = (investment: Investment, checked: boolean) => {
    if (disabled) return;
    let newSelected = [...selectedInvestments];
    if (checked) {
      const costRange = parseCostRange(investment.costRange);
      // Default to min cost when first selected
      const cost = costRange[0]; 
      newSelected.push({ id: investment.id, name: investment.name, cost, effect: investment.effect });
    } else {
      newSelected = newSelected.filter(i => i.id !== investment.id);
    }
    onInvestmentChange(newSelected);
  };

  const handleSliderChange = (investmentId: string, value: number[]) => {
    if (disabled) return;
    const newSelected = selectedInvestments.map(inv => 
      inv.id === investmentId ? { ...inv, cost: value[0] } : inv
    );
    onInvestmentChange(newSelected);
  };

  const investmentCost = selectedInvestments.reduce((acc, inv) => acc + inv.cost, 0);

  const totalCost = investmentCost + totalOtherCosts;
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
        <CardContent>
          {!canAfford && !disabled && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Fondos Insuficientes</AlertTitle>
              <AlertDescription>
                El coste total de las decisiones supera tu tesorería disponible.
              </AlertDescription>
            </Alert>
          )}

          <fieldset disabled={disabled} className="group">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 group-disabled:opacity-50">
              <div className="lg:col-span-2 space-y-4">
                {availableInvestments.length > 0 ? availableInvestments.map((inv) => {
                  const isSelected = selectedInvestments.some(si => si.id === inv.id);
                  const selectedValue = selectedInvestments.find(si => si.id === inv.id)?.cost;
                  const costRange = parseCostRange(inv.costRange);
                  const isRange = costRange.length > 1;

                  return (
                    <div key={inv.id} className={cn("rounded-md border p-4", disabled && 'bg-muted/50')}>
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id={inv.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => handleCheckboxChange(inv, !!checked)}
                            />
                            <div className="grid flex-1 gap-1.5 leading-none">
                                <label htmlFor={inv.id} className="font-medium cursor-pointer">
                                {inv.name}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    {inv.effect}
                                </p>
                            </div>
                            <div className="font-mono text-right text-sm">
                                {isRange ? `${(selectedValue || costRange[0]).toLocaleString('es-ES')} CC` : `${costRange[0].toLocaleString('es-ES')} CC`}
                            </div>
                        </div>
                        {isRange && isSelected && (
                            <div className="mt-4 pl-8 pr-2 space-y-2">
                                <Label className="text-xs text-muted-foreground">Ajustar Inversión</Label>
                                <Slider
                                    value={[selectedValue || costRange[0]]}
                                    onValueChange={(value) => handleSliderChange(inv.id, value)}
                                    min={costRange[0]}
                                    max={costRange[1]}
                                    step={(costRange[1] - costRange[0]) / 10} // 10 steps
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
          </fieldset>
        </CardContent>
      </Card>
    </>
  );
}
