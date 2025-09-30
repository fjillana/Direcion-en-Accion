

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
import { useState } from "react";
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


type TeamDecision = {
  investments: { name: string; cost: number }[];
  tuitionPrice: number;
  crisisResponse: {
    crisisName: string;
    option: string;
    justification: string;
  };
};

type Team = {
  name: "Equipo Alfa" | "Equipo Beta" | "Equipo Gamma" | "Equipo Delta";
  peb: number;
  xp: number;
  grade: number;
  price: number;
  marketing: number;
  decisions: TeamDecision;
};


export default function GameDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const handleProcessRound = () => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      // In a real scenario, this would be re-enabled
      // once all teams have submitted their new decisions.
      // setIsProcessing(false);
    }, 5000);
  };

  const teams: Team[] = [
    {
      name: "Equipo Alfa",
      peb: 95,
      xp: 1200,
      grade: 8.5,
      price: 102,
      marketing: 5000,
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
      }
    },
    {
      name: "Equipo Beta",
      peb: 105,
      xp: 1500,
      grade: 9.2,
      price: 98,
      marketing: 6000,
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
      }
    },
    {
      name: "Equipo Gamma",
      peb: 88,
      xp: 950,
      grade: 7.8,
      price: 110,
      marketing: 4000,
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
      }
    },
    {
      name: "Equipo Delta",
      peb: 110,
      xp: 1800,
      grade: 9.8,
      price: 95,
      marketing: 7500,
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
      }
    },
  ];

  const fullInvestments: Investment[] = [
    { id: 'F1', name: 'Implantación de ERP', costRange: '15.000-30.000', description: 'Permite automatizar la contabilidad y controlar presupuestos. Reduce costes administrativos un 2 %.', effect: '+5 a +10 XP Finanzas' },
    { id: 'F2', name: 'Contratación de asesoría financiera', costRange: '8.000-12.000', description: 'Apoyo experto para elaborar presupuestos y evaluar inversiones. Se contrata por ronda.', effect: '+3 a +8 XP Finanzas' },
    { id: 'R1', name: 'Campaña publicitaria en redes', costRange: '5.000-20.000', description: 'Mejora la visibilidad y atrae alumnos privados. Aumenta la cuota de mercado.', effect: '+2 a +10 XP Reputación' },
    { id: 'R2', name: 'Inversión en TIC', costRange: '10.000-75.000', description: 'Renovar aulas con tecnología y equipamiento digital. Mejora la NMA y la moral.', effect: '+3 a +15 XP Reputación, +3 XP Personal' },
    { id: 'P1', name: 'Formación docente', costRange: '5.000-15.000', description: 'Cursos de actualización, metodologías innovadoras. Cuanto mayor es la inversión, mayor el impacto.', effect: '+5 XP Personal, +10-20 puntos de moral' },
    { id: 'P2', name: 'Contratación docente', costRange: '7.500 por ronda', description: 'Contratar un nuevo profesor reduce el ratio alumnos/profesor y la carga de trabajo. El coste salarial se añade a los gastos recurrentes.', effect: '+10 XP Personal, +15 puntos de moral' },
  ];
  const fullCrises: Crisis[] = [
    {
      id: 'C1', name: 'Huelga docente', description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.',
      options: [ { label: 'Aceptar todas las demandas', effect: 'Impacto: −25.000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas' }, { label: 'Negociar un acuerdo parcial', effect: 'Impacto: −15.000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas' }, { label: 'Mantener la postura', effect: 'Impacto: huelga dura dos rondas; −20 XP en todas las áreas; moral se fija en 40; penalización severa en reputación' } ]
    },
    {
      id: 'C4', name: 'Accidente en el centro', description: 'Un accidente leve (caída en el patio, inundación en un aula) genera críticas en redes sociales y preocupación de las familias.',
      options: [ { label: 'Ignorar el incidente', effect: 'Impacto: −5 XP Reputación; −10 puntos de moral; muestra falta de transparencia' }, { label: 'Informar y pedir disculpas públicamente', effect: 'Impacto: −2 XP Reputación; +2 XP Personal por honestidad; reduce el impacto negativo' } ]
    },
     {
      id: 'C7', name: 'Caso de redes sociales / ciberbullying', description: 'Se viraliza en redes sociales un caso de ciberbullying entre estudiantes del centro. Se acusa al colegio de no actuar con rapidez.',
      options: [ { label: 'Minimizar el caso', effect: 'Impacto: −8 XP Reputación; la moral baja 5 puntos; puede afectar al IAM la próxima ronda' }, { label: 'Implementar un programa anti‑bullying', effect: 'Impacto: −5.000 CC, +5 XP Reputación, +3 XP Personal; mejora la NMA a largo plazo' } ]
    },
  ];
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">
              Simulación de Negocios 101
            </h1>
            <p className="text-muted-foreground">
              Ronda 3 - Juego ID: {id}
            </p>
          </div>
          <Button size="lg" onClick={handleProcessRound} disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-5 w-5" />
            )}
            {isProcessing ? "Procesando Ronda..." : "Procesar Ronda"}
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
                <CardTitle>Progreso de Equipos</CardTitle>
                <CardDescription>
                  Vista general del rendimiento de cada equipo en la ronda actual. Haz clic para ver sus decisiones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipo</TableHead>
                      <TableHead className="text-right">PEB (%)</TableHead>
                      <TableHead className="text-right">XP</TableHead>
                      <TableHead className="text-right">Nota Media</TableHead>
                      <TableHead className="text-right">Precio Relativo</TableHead>
                      <TableHead className="text-right">Inv. Marketing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => (
                      <TableRow key={team.name} onClick={() => setSelectedTeam(team)} className="cursor-pointer">
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell className="text-right">
                          {team.peb}%{" "}
                          {team.peb > 100 && (
                            <Badge variant="destructive">Sobrecarga</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{team.xp}</TableCell>
                        <TableCell className="text-right">{team.grade}</TableCell>
                        <TableCell className="text-right">
                          ${team.price}
                        </TableCell>
                        <TableCell className="text-right">
                          ${new Intl.NumberFormat('es-ES').format(team.marketing)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <AIReportForm teams={teams.map(t => t.name)} />
          </TabsContent>
        </Tabs>

        <RoundConfig
          allTeams={teams.map(t => t.name)}
          fullInvestments={fullInvestments}
          fullCrises={fullCrises}
        />

      </div>

      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle>Decisiones de la Ronda: {selectedTeam.name}</DialogTitle>
                <DialogDescription>
                  Detalle de las acciones tomadas por el equipo en esta ronda.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4 text-sm">
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
                <div className="space-y-2">
                  <h4 className="font-semibold">Respuesta a Crisis: <span className="font-normal">{selectedTeam.decisions.crisisResponse.crisisName}</span></h4>
                   <div className="p-3 bg-muted/50 rounded-md">
                      <p className="font-medium">Opción elegida:</p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedTeam.decisions.crisisResponse.option}</p>
                    </div>
                     <div className="p-3 bg-muted/50 rounded-md">
                      <p className="font-medium">Justificación:</p>
                      <p className="text-sm text-muted-foreground mt-1 italic">"{selectedTeam.decisions.crisisResponse.justification}"</p>
                    </div>
                </div>
              </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedTeam(null)}>Cerrar</Button>
               </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
