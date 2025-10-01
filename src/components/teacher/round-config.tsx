
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Investment, Crisis } from "./catalog-editor";

type TeamName = string;

interface RoundConfigProps {
  allTeams: TeamName[];
  fullInvestments: Investment[];
  fullCrises: Crisis[];
  numRounds: number;
}

type RoundInvestment = Investment & { availableTo: TeamName[] };
type RoundCrisis = Crisis;

export function RoundConfig({
  allTeams,
  fullInvestments,
  fullCrises,
}: RoundConfigProps) {
  const [roundInvestments, setRoundInvestments] = useState<RoundInvestment[]>([]);
  const [roundCrises, setRoundCrises] = useState<RoundCrisis[]>([]);

  const [isInvestmentsDialogOpen, setInvestmentsDialogOpen] = useState(false);
  const [isCrisesDialogOpen, setCrisesDialogOpen] = useState(false);

  const [selectedCatalogInvestments, setSelectedCatalogInvestments] = useState<string[]>([]);
  const [selectedCatalogCrisis, setSelectedCatalogCrisis] = useState<string | null>(null);

  const handleAddInvestments = () => {
    const investmentsToAdd = fullInvestments
      .filter((inv) => selectedCatalogInvestments.includes(inv.id))
      .filter(invToAdd => !roundInvestments.some(existingInv => existingInv.id === invToAdd.id)) // Avoid duplicates
      .map((inv) => ({ ...inv, availableTo: allTeams })); // Default to all teams

    setRoundInvestments((prev) => [...prev, ...investmentsToAdd]);
    setSelectedCatalogInvestments([]);
    setInvestmentsDialogOpen(false);
  };
  
  const handleAddCrisis = () => {
    if (!selectedCatalogCrisis) return;
    const crisisToAdd = fullCrises.find(c => c.id === selectedCatalogCrisis);
    if (crisisToAdd) {
        // Only one crisis per round
        setRoundCrises([crisisToAdd]);
    }
    setSelectedCatalogCrisis(null);
    setCrisesDialogOpen(false);
  }

  const toggleTeamForInvestment = (investmentId: string, teamName: TeamName) => {
    setRoundInvestments(prev =>
      prev.map(inv => {
        if (inv.id === investmentId) {
          const newAvailableTo = inv.availableTo.includes(teamName)
            ? inv.availableTo.filter(t => t !== teamName)
            : [...inv.availableTo, teamName];
          return { ...inv, availableTo: newAvailableTo };
        }
        return inv;
      })
    );
  };
  
  const toggleAllTeamsForInvestment = (investmentId: string) => {
    setRoundInvestments(prev =>
      prev.map(inv => {
        if (inv.id === investmentId) {
          const areAllSelected = inv.availableTo.length === allTeams.length;
          return { ...inv, availableTo: areAllSelected ? [] : allTeams };
        }
        return inv;
      })
    );
  };

  const handleInvestmentCheckboxChange = (investmentId: string, checked: boolean) => {
    setSelectedCatalogInvestments(prev =>
      checked ? [...prev, investmentId] : prev.filter(id => id !== investmentId)
    );
  };

  const handleCrisisRadioChange = (crisisId: string) => {
    setSelectedCatalogCrisis(crisisId);
  }

  return (
    <>
      <Card>
        <CardHeader>
            <CardTitle>Configuración de la Ronda</CardTitle>
            <CardDescription>
            Define las inversiones y crisis para la ronda seleccionada.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Inversiones de la Ronda</h3>
            <div className="rounded-lg border">
              <div className="p-4 flex justify-between items-center border-b">
                  <p className="text-sm text-muted-foreground">Define qué inversiones estarán disponibles para qué equipos.</p>
                    <Button variant="outline" size="sm" onClick={() => setInvestmentsDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Añadir Inversión
                  </Button>
              </div>
              {roundInvestments.map(inv => (
                <div key={inv.id} className="p-4 border-b last:border-none">
                  <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{inv.name}</h4>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setRoundInvestments(prev => prev.filter(i => i.id !== inv.id))}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">{inv.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                      <div className="flex items-center space-x-2">
                          <Checkbox
                              id={`all-${inv.id}`}
                              checked={inv.availableTo.length === allTeams.length}
                              onCheckedChange={() => toggleAllTeamsForInvestment(inv.id)}
                          />
                          <Label htmlFor={`all-${inv.id}`} className="font-medium">Todos</Label>
                      </div>
                      <div className="h-6 w-px bg-border" />
                    {allTeams.map(team => (
                      <div key={team} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${inv.id}-${team}`}
                          checked={inv.availableTo.includes(team)}
                          onCheckedChange={() => toggleTeamForInvestment(inv.id, team)}
                        />
                        <Label htmlFor={`${inv.id}-${team}`}>{team}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {roundInvestments.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No hay inversiones configuradas para esta ronda.</p>}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Crisis de la Ronda</h3>
            <div className="rounded-lg border">
              <div className="p-4 flex justify-between items-center border-b">
                  <p className="text-sm text-muted-foreground">Define qué crisis se activará para todos los equipos.</p>
                  <Button variant="outline" size="sm" onClick={() => setCrisesDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {roundCrises.length > 0 ? "Cambiar Crisis" : "Añadir Crisis"}
                  </Button>
              </div>
                {roundCrises.map(crisis => (
                  <div key={crisis.id} className="p-4">
                      <h4 className="font-semibold">{crisis.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{crisis.description}</p>
                  </div>
                ))}
                {roundCrises.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No hay crisis configurada para esta ronda.</p>}
            </div>
          </div>
        </CardContent>
      </Card>

    {/* Investments Dialog */}
    <Dialog open={isInvestmentsDialogOpen} onOpenChange={(open) => { setInvestmentsDialogOpen(open); if(!open) setSelectedCatalogInvestments([]); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir Inversiones desde el Catálogo</DialogTitle>
          <DialogDescription>
            Selecciona las inversiones que quieres habilitar en esta ronda.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="space-y-4 p-4">
            {fullInvestments.map((item) => {
              const isInRound = roundInvestments.some(roundItem => roundItem.id === item.id);
              return (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox 
                  id={`cat-inv-${item.id}`} 
                  className="mt-1"
                  onCheckedChange={(checked) => handleInvestmentCheckboxChange(item.id, !!checked)}
                  checked={selectedCatalogInvestments.includes(item.id)}
                  disabled={isInRound}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={`cat-inv-${item.id}`} className={`font-medium cursor-pointer ${isInRound ? 'text-muted-foreground' : ''}`}>
                    {item.name} {isInRound && "(ya en la ronda)"}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            )})}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setInvestmentsDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAddInvestments} disabled={selectedCatalogInvestments.length === 0}>Añadir Seleccionados</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Crises Dialog */}
     <Dialog open={isCrisesDialogOpen} onOpenChange={(open) => { setCrisesDialogOpen(open); if(!open) setSelectedCatalogCrisis(null); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Añadir Crisis desde el Catálogo</DialogTitle>
          <DialogDescription>
            Selecciona la crisis que se activará en esta ronda. Solo se puede seleccionar una.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="space-y-4 p-4">
            {fullCrises.map((item) => {
              const isInRound = roundCrises.some(roundItem => roundItem.id === item.id);
              return (
              <div key={item.id} className="flex items-start space-x-3">
                <Checkbox 
                  id={`cat-crisis-${item.id}`} 
                  className="mt-1 rounded-full"
                  onCheckedChange={() => handleCrisisRadioChange(item.id)}
                  checked={selectedCatalogCrisis === item.id}
                  disabled={isInRound}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={`cat-crisis-${item.id}`} className={`font-medium cursor-pointer ${isInRound ? 'text-muted-foreground' : ''}`}>
                    {item.name} {isInRound && "(ya en la ronda)"}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            )})}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCrisesDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleAddCrisis} disabled={!selectedCatalogCrisis}>Añadir Crisis</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
