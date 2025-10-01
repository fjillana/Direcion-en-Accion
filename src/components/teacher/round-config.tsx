
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Eye } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Investment, Crisis } from "./catalog-editor";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type TeamName = string;

interface RoundConfigProps {
  allTeams: TeamName[];
  fullInvestments: Investment[];
  fullCrises: Crisis[];
}

type RoundInvestment = Investment;
type TeamCrisis = { teamName: TeamName; crisisIds: string[] };

export function RoundConfig({
  allTeams,
  fullInvestments,
  fullCrises,
}: RoundConfigProps) {
  const { toast } = useToast();
  const [roundInvestments, setRoundInvestments] = useState<RoundInvestment[]>(
    []
  );
  const [teamCrises, setTeamCrises] = useState<TeamCrisis[]>(() =>
    allTeams.map((teamName) => ({ teamName, crisisIds: [] }))
  );

  const [isInvestmentsDialogOpen, setInvestmentsDialogOpen] = useState(false);
  const [isCrisesDialogOpen, setCrisesDialogOpen] = useState(false);
  const [selectedTeamForCrisis, setSelectedTeamForCrisis] = useState<TeamName | null>(null);
  const [selectedCrisesInDialog, setSelectedCrisesInDialog] = useState<string[]>([]);
  const [detailedCrisis, setDetailedCrisis] = useState<Crisis | null>(null);


  const [selectedCatalogInvestments, setSelectedCatalogInvestments] = useState<
    string[]
  >([]);

  const handleAddInvestments = () => {
    const investmentsToAdd = fullInvestments
      .filter((inv) => selectedCatalogInvestments.includes(inv.id))
      .filter(
        (invToAdd) =>
          !roundInvestments.some((existingInv) => existingInv.id === invToAdd.id)
      );

    setRoundInvestments((prev) => [...prev, ...investmentsToAdd]);
    setSelectedCatalogInvestments([]);
    setInvestmentsDialogOpen(false);
  };
  
  const handleSendInvestments = () => {
    // Here you would typically send the data to your backend
    toast({
        title: "Inversiones Enviadas",
        description: `${roundInvestments.length} inversiones han sido enviadas a los equipos para la ronda actual.`,
    });
  }
  
  const handleSendCrises = () => {
     // Here you would typically send the data to your backend
    toast({
        title: "Crisis Enviadas",
        description: `Las crisis individuales han sido asignadas a los equipos.`,
    });
  }

  const handleInvestmentCheckboxChange = (
    investmentId: string,
    checked: boolean
  ) => {
    setSelectedCatalogInvestments((prev) =>
      checked ? [...prev, investmentId] : prev.filter((id) => id !== investmentId)
    );
  };
  
  const openCrisisDialog = (teamName: TeamName) => {
    const currentCrises = teamCrises.find(tc => tc.teamName === teamName)?.crisisIds || [];
    setSelectedCrisesInDialog(currentCrises);
    setSelectedTeamForCrisis(teamName);
    setCrisesDialogOpen(true);
  };
  
  const handleCrisisSelectionChange = (crisisId: string, checked: boolean) => {
    setSelectedCrisesInDialog(prev => 
      checked ? [...prev, crisisId] : prev.filter(id => id !== crisisId)
    );
  };

  const handleConfirmCrisisSelection = () => {
    if (selectedTeamForCrisis) {
      setTeamCrises(prev => 
        prev.map(tc => 
          tc.teamName === selectedTeamForCrisis ? { ...tc, crisisIds: selectedCrisesInDialog } : tc
        )
      );
    }
    setCrisesDialogOpen(false);
    setSelectedTeamForCrisis(null);
    setSelectedCrisesInDialog([]);
  };


  return (
    <>
      <div className="space-y-8">
        {/* Investments Section */}
        <Card>
          <CardHeader>
            <CardTitle>Inversiones de la Ronda</CardTitle>
            <CardDescription>
              Define las inversiones que estarán disponibles para todos los
              equipos en esta ronda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <div className="p-4 flex justify-between items-center border-b">
                <p className="text-sm text-muted-foreground">
                  Hay {roundInvestments.length} inversiones activas.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvestmentsDialogOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Inversión
                </Button>
              </div>
              <div className="p-4 space-y-3">
                {roundInvestments.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <h4 className="font-semibold">{inv.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {inv.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() =>
                        setRoundInvestments((prev) =>
                          prev.filter((i) => i.id !== inv.id)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {roundInvestments.length === 0 && (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No hay inversiones configuradas para esta ronda.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendInvestments}>Guardar y Enviar Inversiones</Button>
          </CardFooter>
        </Card>

        {/* Crises Section */}
        <Card>
          <CardHeader>
            <CardTitle>Crisis de la Ronda</CardTitle>
            <CardDescription>
              Asigna una o varias crisis específicas para cada equipo en esta ronda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {allTeams.length > 0 ? (
                teamCrises.map(({ teamName, crisisIds }) => (
                <div key={teamName} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-base">{teamName}</h4>
                      <Button variant="outline" size="sm" onClick={() => openCrisisDialog(teamName)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Asignar Crisis
                      </Button>
                    </div>
                    <div className="mt-2 space-x-2">
                        {crisisIds.length > 0 ? (
                          crisisIds.map(id => {
                            const crisis = fullCrises.find(c => c.id === id);
                            return <Badge key={id} variant="secondary">{crisis?.name || id}</Badge>
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">No hay crisis asignadas.</p>
                        )}
                    </div>
                </div>
                ))
            ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                    No hay equipos en la partida para asignar crisis.
                </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendCrises}>Guardar y Enviar Crisis</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Investments Dialog */}
      <Dialog
        open={isInvestmentsDialogOpen}
        onOpenChange={(open) => {
          setInvestmentsDialogOpen(open);
          if (!open) setSelectedCatalogInvestments([]);
        }}
      >
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
                const isInRound = roundInvestments.some(
                  (roundItem) => roundItem.id === item.id
                );
                return (
                  <div key={item.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`cat-inv-${item.id}`}
                      className="mt-1"
                      onCheckedChange={(checked) =>
                        handleInvestmentCheckboxChange(item.id, !!checked)
                      }
                      checked={selectedCatalogInvestments.includes(item.id)}
                      disabled={isInRound}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`cat-inv-${item.id}`}
                        className={`font-medium cursor-pointer ${
                          isInRound ? "text-muted-foreground" : ""
                        }`}
                      >
                        {item.name} {isInRound && "(ya en la ronda)"}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInvestmentsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddInvestments}
              disabled={selectedCatalogInvestments.length === 0}
            >
              Añadir Seleccionados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Crises Dialog */}
       <Dialog open={isCrisesDialogOpen} onOpenChange={setCrisesDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Asignar Crisis para {selectedTeamForCrisis}</DialogTitle>
            <DialogDescription>
              Selecciona una o más crisis del catálogo para este equipo.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96 p-1">
            <div className="space-y-4 p-4">
              {fullCrises.map((crisis) => (
                <div key={crisis.id} className="flex items-start space-x-3 rounded-lg border p-3">
                  <Checkbox
                    id={`crisis-sel-${crisis.id}`}
                    className="mt-1"
                    checked={selectedCrisesInDialog.includes(crisis.id)}
                    onCheckedChange={(checked) => handleCrisisSelectionChange(crisis.id, !!checked)}
                  />
                  <div className="grid flex-1 gap-1.5">
                    <label htmlFor={`crisis-sel-${crisis.id}`} className="font-medium cursor-pointer">
                      {crisis.name}
                    </label>
                    <p className="text-sm text-muted-foreground">{crisis.description}</p>
                  </div>
                  <Dialog>
                     <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                        </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{crisis.name}</DialogTitle>
                            <DialogDescription>{crisis.description}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-4">
                            <h4 className="font-semibold">Opciones de Respuesta:</h4>
                            {crisis.options.map((option, index) => (
                                <div key={index} className="p-3 bg-muted/50 rounded-md">
                                    <p className="font-medium">{index + 1}. {option.label}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{option.effect}</p>
                                </div>
                            ))}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cerrar</Button></DialogClose>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrisesDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmCrisisSelection}>
              Guardar Crisis para {selectedTeamForCrisis}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
