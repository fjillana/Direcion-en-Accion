

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { AIReportForm } from "@/components/teacher/ai-report-form";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useParams } from 'next/navigation'
import { RoundConfig } from "@/components/teacher/round-config";
import type { Investment, Crisis } from "@/components/teacher/catalog-editor";
import { useGames } from "@/hooks/use-games";
import type { Game } from "@/hooks/use-games";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


type TeamDecision = {
  investments: { name: string; cost: number }[];
  tuitionPrice: number;
  crisisResponse: {
    crisisName: string;
    option: string;
    justification: string;
  };
};

type TeamPerformance = {
  name: "Equipo Alfa" | "Equipo Beta" | "Equipo Gamma" | "Equipo Delta" | "IA Rival 1" | "IA Rival 2";
  type: 'H' | 'IA';
  finances: { peb: number; xp: number; pebBreakdown: string[] };
  reputation: { peb: number; xp: number; pebBreakdown: string[] };
  morale: { peb: number; xp: number; pebBreakdown: string[] };
  totalXp: number;
  decisions: TeamDecision;
  strategicPlan: {
    kpiTargets: string[];
    rankingGoal: string;
    pricingPolicy: string;
  }
};

const teamsData: TeamPerformance[] = [
  {
    name: "Equipo Alfa",
    type: 'H',
    finances: { peb: 95, xp: 19, pebBreakdown: ["Tesorería (7%): 100 PEB", "Coste Personal (76%): 90 PEB"] },
    reputation: { peb: 88, xp: 18, pebBreakdown: ["NMA (8.2): 82 PEB", "Cuota Mercado (12%): 94 PEB"] },
    morale: { peb: 71, xp: 14, pebBreakdown: ["Moral (71%): 71 PEB", "Ratio Alumno/Prof (25.1): 100 PEB"] },
    totalXp: 51,
    decisions: {
      investments: [
        { name: "Formación docente", cost: 10000 },
        { name: "Campaña publicitaria en redes", cost: 5000 },
      ],
      tuitionPrice: 125,
      crisisResponse: {
        crisisName: "Huelga docente",
        option: "Recurrir a mediadores externos",
        justification: "Buscamos una solución negociada y menos costosa a corto plazo para no impactar la tesorería."
      }
    },
    strategicPlan: {
      kpiTargets: ["Tesorería > 20k", "Coste Personal < 80%", "NMA > 8.0"],
      rankingGoal: "Top 3",
      pricingPolicy: "Premium, por encima de la media"
    }
  },
  {
    name: "Equipo Beta",
    type: 'H',
    finances: { peb: 105, xp: 21, pebBreakdown: ["Tesorería (11%): 110 PEB", "Coste Personal (72%): 100 PEB"] },
    reputation: { peb: 110, xp: 22, pebBreakdown: ["NMA (9.2): 115 PEB", "Cuota Mercado (13.5%): 105 PEB"] },
    morale: { peb: 98, xp: 20, pebBreakdown: ["Moral (78%): 78 PEB", "Ratio Alumno/Prof (24.0): 118 PEB"] },
    totalXp: 63,
    decisions: {
      investments: [
        { name: "Inversión en TIC", cost: 25000 },
      ],
      tuitionPrice: 118,
      crisisResponse: {
        crisisName: "Huelga docente",
        option: "Negociar un acuerdo parcial",
        justification: "Preferimos una solución intermedia para subir la moral sin comprometer demasiado el presupuesto de la ronda."
      }
    },
    strategicPlan: {
        kpiTargets: ["Tesorería > 30k", "Coste Personal < 75%", "NMA > 8.5"],
        rankingGoal: "Top 2",
        pricingPolicy: "Competitiva, en línea con la media"
    }
  },
  {
    name: "Equipo Gamma",
    type: 'H',
    finances: { peb: 88, xp: 18, pebBreakdown: ["Tesorería (4%): 80 PEB", "Coste Personal (79%): 96 PEB"] },
    reputation: { peb: 92, xp: 18, pebBreakdown: ["NMA (7.8): 90 PEB", "Cuota Mercado (11%): 94 PEB"] },
    morale: { peb: 65, xp: 13, pebBreakdown: ["Moral (65%): 65 PEB", "Ratio Alumno/Prof (25.8): 92 PEB"] },
    totalXp: 49,
    decisions: {
      investments: [
        { name: "Mejora de instalaciones (patios, laboratorios)", cost: 15000 },
      ],
      tuitionPrice: 130,
      crisisResponse: {
        crisisName: "Huelga docente",
        option: "Mantener la postura",
        justification: "Creemos que ceder a las demandas sentaría un precedente negativo para futuras negociaciones."
      }
    },
    strategicPlan: {
        kpiTargets: ["Tesorería > 15k", "Coste Personal < 82%", "NMA > 7.8"],
        rankingGoal: "No ser último",
        pricingPolicy: "Premium, la más alta"
    }
  },
  {
    name: "Equipo Delta",
    type: 'H',
    finances: { peb: 110, xp: 22, pebBreakdown: ["Tesorería (15%): 120 PEB", "Coste Personal (68%): 100 PEB"] },
    reputation: { peb: 115, xp: 23, pebBreakdown: ["NMA (9.8): 120 PEB", "Cuota Mercado (15%): 110 PEB"] },
    morale: { peb: 100, xp: 20, pebBreakdown: ["Moral (85%): 85 PEB", "Ratio Alumno/Prof (23.5): 115 PEB"] },
    totalXp: 65,
    decisions: {
      investments: [
        { name: "Implantación de ERP", cost: 20000 },
        { name: "Incremento salarial global (5-10 %)", cost: 12000 },
      ],
      tuitionPrice: 115,
      crisisResponse: {
        crisisName: "Huelga docente",
        option: "Aceptar todas las demandas",
        justification: "La moral es clave para la calidad educativa. Preferimos hacer la inversión para resolver la crisis de raíz y evitar futuras huelgas."
      }
    },
    strategicPlan: {
        kpiTargets: ["Tesorería > 50k", "Coste Personal < 70%", "NMA > 9.0"],
        rankingGoal: "Ganar",
        pricingPolicy: "Bajo coste para ganar mercado"
    }
  },
    {
    name: "IA Rival 1",
    type: 'IA',
    finances: { peb: 100, xp: 20, pebBreakdown: ["Tesorería (10%): 100 PEB", "Coste Personal (75%): 100 PEB"] },
    reputation: { peb: 100, xp: 20, pebBreakdown: ["NMA (8.5): 100 PEB", "Cuota Mercado (12.5%): 100 PEB"] },
    morale: { peb: 100, xp: 20, pebBreakdown: ["Moral (80%): 80 PEB", "Ratio Alumno/Prof (25.0): 120 PEB"] },
    totalXp: 60,
    decisions: {
      investments: [ { name: "Campaña publicitaria en redes", cost: 10000 } ],
      tuitionPrice: 120,
      crisisResponse: { crisisName: "Huelga docente", option: "Negociar un acuerdo parcial", justification: "Respuesta automática de la IA." }
    },
    strategicPlan: {
      kpiTargets: ["Estrategia de IA: Equilibrada"],
      rankingGoal: "Mantenerse competitivo",
      pricingPolicy: "Adaptativa según el mercado"
    }
  },
  {
    name: "IA Rival 2",
    type: 'IA',
    finances: { peb: 115, xp: 23, pebBreakdown: ["Tesorería (20%): 130 PEB", "Coste Personal (65%): 100 PEB"] },
    reputation: { peb: 95, xp: 19, pebBreakdown: ["NMA (8.0): 90 PEB", "Cuota Mercado (11.5%): 100 PEB"] },
    morale: { peb: 90, xp: 18, pebBreakdown: ["Moral (70%): 70 PEB", "Ratio Alumno/Prof (24.5): 110 PEB"] },
    totalXp: 60,
    decisions: {
      investments: [ { name: "Implantación de ERP", cost: 30000 } ],
      tuitionPrice: 128,
      crisisResponse: { crisisName: "Huelga docente", option: "Mantener la postura", justification: "Respuesta automática de la IA." }
    },
    strategicPlan: {
      kpiTargets: ["Estrategia de IA: Financiera Agresiva"],
      rankingGoal: "Maximizar tesorería",
      pricingPolicy: "Premium"
    }
  },
];


export default function GameDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { games } = useGames();

  const [game, setGame] = useState<Game | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamPerformance | null>(null);
  const [isDecisionDetailOpen, setDecisionDetailOpen] = useState(false);
  const [isPebDetailOpen, setPebDetailOpen] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState("");
  const [selectedRound, setSelectedRound] = useState<string | undefined>(undefined);
  const [monitoringData, setMonitoringData] = useState<TeamPerformance[]>([]);

  useEffect(() => {
    const foundGame = games.find((g) => g.id === id);
    setGame(foundGame);
    if (foundGame) {
      setSelectedRound(foundGame.round.toString());
    }
  }, [games, id]);
  
  useEffect(() => {
    if (selectedTeam && selectedRound) {
        setTeacherNotes(`Notas para ${selectedTeam.name} en la ronda ${selectedRound}...`);
    }
  }, [selectedTeam, selectedRound])
  
  useEffect(() => {
    if (!game || !selectedRound || parseInt(selectedRound) > game.round) {
      setMonitoringData([]);
    } else {
      const shuffledData = [...teamsData].sort(() => Math.random() - 0.5);
      setMonitoringData(shuffledData);
    }
  }, [selectedRound, game]);

  const handleProcessRound = () => {
    setIsProcessing(true);
    setTimeout(() => {
        setIsProcessing(false);
        // Logic to advance the round would go here
    }, 3000);
  };
  
  const handleTeamRowClick = (team: TeamPerformance) => {
    setSelectedTeam(team);
    setPebDetailOpen(true);
  };

  const getPebColor = (peb: number) => {
    if (peb > 100) return "text-emerald-600";
    if (peb < 90) return "text-red-600";
    return "text-foreground";
  };
  
  const fullInvestments: Investment[] = [
    { id: 'F1', name: 'Implantación de ERP', costRange: '15.000-30.000', description: 'Permite automatizar la contabilidad y controlar presupuestos. Reduce costes administrativos un 2 %.', effect: '+5 a +10 XP Finanzas' },
    { id: 'R1', name: 'Campaña publicitaria en redes', costRange: '5.000-20.000', description: 'Mejora la visibilidad y atrae alumnos privados. Aumenta la cuota de mercado.', effect: '+2 a +10 XP Reputación' },
    { id: 'P1', name: 'Formación docente', costRange: '5.000-15.000', description: 'Cursos de actualización, metodologías innovadoras. Cuanto mayor es la inversión, mayor el impacto.', effect: '+5 XP Personal, +10-20 puntos de moral' },
  ];
  const fullCrises: Crisis[] = [
    {
      id: 'C1', name: 'Huelga docente', description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.',
      options: [ { label: 'Aceptar todas las demandas', effect: 'Impacto: −25.000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas' }, { label: 'Negociar un acuerdo parcial', effect: 'Impacto: −15.000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas' }, { label: 'Mantener la postura', effect: 'Impacto: huelga dura dos rondas; −20 XP en todas las áreas; moral se fija en 40; penalización severa en reputación' } ]
    },
  ];
  
  if (!game || !selectedRound) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">
              {game.name}
            </h1>
            <p className="text-muted-foreground">
              Ronda {game.round} de {game.numRounds} - Juego ID: {id}
            </p>
          </div>
          <Button size="lg" onClick={handleProcessRound} disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-5 w-5" />
            )}
            {isProcessing ? "Procesando Ronda..." : `Procesar Ronda ${game.round}`}
          </Button>
        </div>

        <Tabs defaultValue="monitoring">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monitoring">Monitorización</TabsTrigger>
            <TabsTrigger value="reports">Reportes AI</TabsTrigger>
          </TabsList>
          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Progreso de Equipos</CardTitle>
                    <CardDescription>
                      Vista general del rendimiento por áreas. Haz clic en un equipo para ver el detalle.
                    </CardDescription>
                  </div>
                  <div className="w-[180px]">
                    <Select value={selectedRound} onValueChange={setSelectedRound}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Ronda" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: game.numRounds }, (_, i) => i + 1).map((r) => (
                                <SelectItem key={r} value={r.toString()}>
                                    Ronda {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {monitoringData.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="w-[50px] text-center">Tipo</TableHead>
                        <TableHead className="text-center">PEB Finanzas</TableHead>
                        <TableHead className="text-center">XP Finanzas</TableHead>
                        <TableHead className="text-center">PEB Reputación</TableHead>
                        <TableHead className="text-center">XP Reputación</TableHead>
                        <TableHead className="text-center">PEB Moral</TableHead>
                        <TableHead className="text-center">XP Moral</TableHead>
                        <TableHead className="text-right">Total XP</TableHead>
                        <TableHead className="w-[100px] text-center">Decisiones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monitoringData.map((team) => (
                        <TableRow key={team.name} onClick={() => handleTeamRowClick(team)} className="cursor-pointer">
                          <TableCell className="font-medium">{team.name}</TableCell>
                          <TableCell className="text-center text-muted-foreground font-mono text-xs">{team.type}</TableCell>
                          <TableCell className={cn("text-center font-mono", getPebColor(team.finances.peb))}>{team.finances.peb}</TableCell>
                          <TableCell className="text-center font-mono">{team.finances.xp}</TableCell>
                          <TableCell className={cn("text-center font-mono", getPebColor(team.reputation.peb))}>{team.reputation.peb}</TableCell>
                          <TableCell className="text-center font-mono">{team.reputation.xp}</TableCell>
                          <TableCell className={cn("text-center font-mono", getPebColor(team.morale.peb))}>{team.morale.peb}</TableCell>
                          <TableCell className="text-center font-mono">{team.morale.xp}</TableCell>
                          <TableCell className="text-right font-bold font-mono">{team.totalXp}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTeam(team); setDecisionDetailOpen(true); }}>Ver</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 text-sm text-muted-foreground">
                    No hay datos disponibles para la ronda {selectedRound}.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <AIReportForm teamsData={teamsData} />
          </TabsContent>
        </Tabs>

        <RoundConfig
          allTeams={teamsData.map(t => t.name)}
          fullInvestments={fullInvestments}
          fullCrises={fullCrises}
          numRounds={game.numRounds}
        />

      </div>
      
      {/* PEB Breakdown Dialog */}
      <Dialog open={isPebDetailOpen} onOpenChange={setPebDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle>Desglose de PEB: {selectedTeam.name}</DialogTitle>
                <DialogDescription>
                    Cálculo detallado de los Puntos de Equilibrio de Negocio para cada área.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4 text-sm">
                 <div>
                    <h4 className="font-semibold text-base mb-2">Finanzas ({selectedTeam.finances.peb} PEB)</h4>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {selectedTeam.finances.pebBreakdown.map((line, i) => <li key={`fin-${i}`}>{line}</li>)}
                    </ul>
                 </div>
                 <div>
                    <h4 className="font-semibold text-base mb-2">Reputación ({selectedTeam.reputation.peb} PEB)</h4>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {selectedTeam.reputation.pebBreakdown.map((line, i) => <li key={`rep-${i}`}>{line}</li>)}
                    </ul>
                 </div>
                 <div>
                    <h4 className="font-semibold text-base mb-2">Moral ({selectedTeam.morale.peb} PEB)</h4>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {selectedTeam.morale.pebBreakdown.map((line, i) => <li key={`mor-${i}`}>{line}</li>)}
                    </ul>
                 </div>
              </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setPebDetailOpen(false)}>Cerrar</Button>
               </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Decision Details Dialog */}
      <Dialog open={isDecisionDetailOpen} onOpenChange={setDecisionDetailOpen}>
        <DialogContent className="sm:max-w-2xl">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle>Detalles de la Ronda: {selectedTeam.name}</DialogTitle>
                 <DialogDescription>Decisiones tomadas por el equipo en la ronda {selectedRound}.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-6 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Precio de Matrícula</h4>
                    <p className="text-muted-foreground">El equipo ha fijado el precio trimestral de la matrícula en <span className="font-bold text-foreground">{selectedTeam.decisions.tuitionPrice} CC</span>.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Inversiones Realizadas</h4>
                    {selectedTeam.decisions.investments.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {selectedTeam.decisions.investments.map((inv, index) => (
                          <li key={index}>
                            <span className="font-semibold text-foreground">{inv.name}:</span> {inv.cost.toLocaleString()} CC
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No se han realizado inversiones esta ronda.</p>
                    )}
                  </div>

                  {selectedTeam.type === 'H' && selectedTeam.strategicPlan && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Plan Estratégico (Ronda 0)</h4>
                        <div className="p-3 bg-muted/50 rounded-md space-y-2">
                           <div>
                                <p className="font-medium">Objetivos de KPIs:</p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground mt-1">
                                    {selectedTeam.strategicPlan.kpiTargets.map((target, i) => <li key={`kpi-${i}`}>{target}</li>)}
                                </ul>
                           </div>
                           <div className="grid grid-cols-2 gap-x-4">
                                <div>
                                    <p className="font-medium">Ranking Objetivo:</p>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedTeam.strategicPlan.rankingGoal}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Política de Precios:</p>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedTeam.strategicPlan.pricingPolicy}</p>
                                </div>
                           </div>
                        </div>
                    </div>
                  )}

                  {selectedTeam.type === 'H' && <div className="space-y-2">
                    <h4 className="font-semibold">Respuesta a Crisis: <span className="font-normal">{selectedTeam.decisions.crisisResponse.crisisName}</span></h4>
                    <div className="p-3 bg-muted/50 rounded-md">
                        <p className="font-medium">Opción elegida:</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedTeam.decisions.crisisResponse.option}</p>
                        <p className="text-xs text-muted-foreground/80 mt-2">Consecuencias (oculto para alumnos): -15.000 CC, +20 moral</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-md">
                        <p className="font-medium">Justificación del equipo:</p>
                        <p className="text-sm text-muted-foreground mt-1 italic">"{selectedTeam.decisions.crisisResponse.justification}"</p>
                      </div>
                  </div>}
                  <div className="space-y-2">
                      <Label htmlFor="teacher-notes" className="font-semibold">Notas del Profesor (Privadas)</Label>
                      <Textarea 
                          id="teacher-notes" 
                          placeholder="Anota aquí tus observaciones sobre la estrategia del equipo..."
                          value={teacherNotes}
                          onChange={(e) => setTeacherNotes(e.target.value)}
                          className="min-h-[100px]"
                      />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setDecisionDetailOpen(false)}>Cerrar</Button>
                <Button onClick={() => setDecisionDetailOpen(false)}>Guardar Notas</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

    