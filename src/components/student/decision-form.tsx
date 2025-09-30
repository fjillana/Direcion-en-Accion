"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export function DecisionForm() {
  const [finance, setFinance] = useState(50);
  const [reputation, setReputation] = useState(30);
  const [personal, setPersonal] = useState(20);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario de Decisiones</CardTitle>
        <CardDescription>
          Asigna tus fondos y recursos para esta ronda. Tus decisiones
          impactarán tus KPIs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="space-y-4">
          <Label className="text-lg font-medium">Finanzas</Label>
          <div className="space-y-2">
            <Label>Inversión en I+D (%): {finance}</Label>
            <Slider
              defaultValue={[finance]}
              max={100}
              step={1}
              onValueChange={(v) => setFinance(v[0])}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label className="text-lg font-medium">Reputación</Label>
          <div className="space-y-2">
            <Label>Inversión en Marketing (%): {reputation}</Label>
            <Slider
              defaultValue={[reputation]}
              max={100}
              step={1}
              onValueChange={(v) => setReputation(v[0])}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label className="text-lg font-medium">Personal</Label>
          <div className="space-y-2">
            <Label>Inversión en Formación (%): {personal}</Label>
            <Slider
              defaultValue={[personal]}
              max={100}
              step={1}
              onValueChange={(v) => setPersonal(v[0])}
            />
          </div>
        </div>
        <Button className="w-full" size="lg">
          Confirmar Decisiones
        </Button>
      </CardContent>
    </Card>
  );
}
