
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Edit, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebriefingQuestions } from "./debriefing-questions";
import { useGames } from "@/hooks/use-games";
import { useGame } from "@/hooks/use-game-context";
import { useToast } from "@/hooks/use-toast";
import { generateRoundReport } from "@/ai/flows/generate-round-report";
import type { TeamPerformanceData } from "@/hooks/use-games";


type TeamName = string;

interface AIReportFormProps {
  teamsData: TeamPerformanceData[];
}

const initialReportData = {
  round: 3,
  financialSummary: {
    income: 320000,
    personnelCost: 245000,
    investmentsCost: 35000,
    roundResult: 40000,
    cashFlow: 65000,
  },
  financialDetail: {
    numStudents: 810,
    tuitionPrice: 395, 
    numTeachers: 33,
    teacherCost: 7424,
    investments: [
      { name: "Inversión en TIC", cost: 25000, effect: "+2 NMA, +5 Moral" },
      { name: "Formación docente", cost: 10000, effect: "+1 NMA, +10 Moral" },
    ],
  },
  kpiSummary: {
    cash: "65.000 CC",
    personnelCost: "76.5%",
    nma: "8.7",
    marketShare: "14.2%",
    morale: "82%",
    studentTeacherRatio: "24.5",
  },
  kpiAnalysis: {
    personnelCost: {
      value: "76.5%",
      calculation: "(245.000 CC / 320.000 CC)",
      analysis: "El ratio ha aumentado ligeramente debido al mantenimiento de la plantilla mientras los ingresos se han estabilizado. No se han realizado contrataciones ni despidos esta ronda, por lo que el cambio es menor."
    },
    nma: {
      value: "8.7",
      analysis: "La nota media ha subido significativamente (+0.2) gracias a la 'Inversión en TIC' (R2) y la 'Formación docente' (P1), que mejoran la calidad de la enseñanza."
    },
    marketShare: {
      value: "14.2%",
      analysis: "La cuota de mercado ha crecido un 0.7% gracias a la mejora de la NMA, que ha aumentado el Índice de Atractividad de Mercado (IAM) del centro."
    },
    morale: {
      value: "82%",
      analysis: "La moral ha subido 4 puntos. La inversión en TIC y formación docente ha sido bien recibida por el personal. La ausencia de crisis también ha contribuido."
    },
    studentTeacherRatio: {
      value: "24.5",
      calculation: "(810 alumnos / 33 profesores)",
      analysis: "El ratio se mantiene estable, ya que no se ha contratado ni despedido personal y el número de alumnos ha tenido una variación moderada."
    }
  },
  marketAttractiveness: {
    iam: "115",
    newStudents: 25,
    lostStudents: 5,
    analysis: "Tu NMA (8.7) y precio (118 CC) te han hecho más atractivo que la media (NMA 8.4, Precio 122 CC), permitiéndote captar un 35% del total de nuevos alumnos disponibles en el mercado."
  },
  qualitativeAnalysis:
    "El equipo ha gestionado eficientemente la crisis de la huelga, optando por una negociación parcial que ha contenido la caída de moral sin un coste excesivo. La inversión en TIC ha sido clave para mejorar la NMA, y se refleja positivamente en el IAM. Sin embargo, el coste de personal ha subido al 76.5%, superando el umbral del 75%. Es crucial vigilar este indicador en la próxima ronda para no comprometer la viabilidad financiera a largo plazo.",
  debriefingQuestions: [
      "Vuestra inversión en TIC (R2) ha mejorado la NMA un 0.2, pero vuestro coste de personal ha superado el 75%. ¿Creéis que el beneficio en reputación compensa el riesgo financiero que estáis asumiendo? ¿Qué haríais diferente la próxima ronda?",
      "Elegisteis 'Negociar un acuerdo parcial' en la crisis de la huelga. ¿Qué os llevó a esa decisión en lugar de una más drástica como 'Aceptar todas las demandas' o 'Mantener la postura'? ¿Cómo creéis que impactará en la moral a largo plazo?",
  ],
  pedagogicalSuggestions: "Fomenta la discusión sobre el equilibrio entre KPIs de reputación (NMA, cuota de mercado) y los KPIs financieros (tesorería, coste de personal). Usa el ejemplo del Equipo Gamma para ilustrar que una estrategia de precios altos puede funcionar si se acompaña de una fuerte inversión en calidad percibida (instalaciones)."
};

export function AIReportForm({ teamsData }: AIReportFormProps) {
  const { activeGame } = useGame();
  const { updateReport, getGameById } = useGames();
  const { toast } = useToast();

  const [selectedTeam, setSelectedTeam] = useState<TeamName>(teamsData.length > 0 ? teamsData[0].name : "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [qualitativeAnalysis, setQualitativeAnalysis] = useState("");
  const [debriefingQuestions, setDebriefingQuestions] = useState<string[]>([]);
  const [pedagogicalSuggestions, setPedagogicalSuggestions] = useState("");
  
  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    if (activeGame && selectedTeam) {
        const gameData = getGameById(activeGame.id);
        const report = gameData?.reports?.[activeGame.round]?.[selectedTeam];
        if (report) {
            setQualitativeAnalysis(report.qualitativeAnalysis || "");
            setDebriefingQuestions(report.debriefingQuestions || []);
            setPedagogicalSuggestions(report.pedagogicalSuggestions || "");
            setHasReport(true);
        } else {
            setHasReport(false);
            setQualitativeAnalysis("");
            setDebriefingQuestions([]);
            setPedagogicalSuggestions("");
        }
    }
  }, [selectedTeam, activeGame, getGameById]);


  const handleGenerateReport = async () => {
    if (!activeGame || !selectedTeam) return;
    
    const teamPerformance = teamsData.find(t => t.name === selectedTeam);
    if (!teamPerformance) return;

    setIsGenerating(true);
    try {
      const result = await generateRoundReport({
        gameId: activeGame.id,
        roundNumber: activeGame.round,
        teamPerformanceData: JSON.stringify(teamPerformance, null, 2),
        marketConditions: "Mercado estable, 50 nuevos alumnos disponibles.",
      });

      setQualitativeAnalysis(result.report);
      setDebriefingQuestions(result.mayeuticQuestions.split('\n').filter(q => q.trim() !== ''));
      setPedagogicalSuggestions(result.pedagogicalSuggestions);
      setHasReport(true);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error al generar el informe",
        description: "No se pudo comunicar con el servicio de IA. Inténtalo de nuevo.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value as TeamName);
    setIsEditing(false);
  };

  const handlePublishReport = () => {
    if (!activeGame || !selectedTeam) return;
    
    // We assemble the full report data to be saved.
    const fullReportData = {
      ...initialReportData, // Using this as a base, should be dynamic in a real scenario
      qualitativeAnalysis: qualitativeAnalysis,
      debriefingQuestions: debriefingQuestions,
      pedagogicalSuggestions: pedagogicalSuggestions,
      round: activeGame.round,
    };
    
    updateReport(activeGame.id, activeGame.round, selectedTeam, fullReportData);

    toast({
      title: "Reporte Publicado",
      description: `El informe para ${selectedTeam} ha sido enviado a la sección del estudiante.`,
    });
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value).replace('€', 'CC');


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="text-primary" />
              Asistente de Reportes IA
            </CardTitle>
            <CardDescription>
              Genera y edita el informe de rendimiento y las preguntas de debriefing para cada equipo en la Ronda {activeGame?.round || 'N/A'}.
            </CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            <Select onValueChange={handleTeamChange} value={selectedTeam}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar equipo" />
              </SelectTrigger>
              <SelectContent>
                {teamsData.map((team) => (
                  <SelectItem key={team.name} value={team.name} disabled={team.type === 'IA'}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis">Análisis de Ronda</TabsTrigger>
                <TabsTrigger value="debriefing">Debriefing IA</TabsTrigger>
            </TabsList>
            <TabsContent value="analysis">
                 {hasReport ? (
                    <Accordion type="multiple" defaultValue={['item-6']} className="w-full space-y-4 pt-4">
                        {/* AI Qualitative Analysis */}
                        <AccordionItem value="item-6" className="border rounded-lg">
                            <AccordionTrigger className="px-4 hover:no-underline">
                                <h3 className="font-semibold text-lg">Análisis Cualitativo y Sugerencias</h3>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="qualitative-analysis" className="text-base font-semibold sr-only">
                                        Análisis Cualitativo (sugerido por IA)
                                    </Label>
                                    <Textarea
                                        id="qualitative-analysis"
                                        value={qualitativeAnalysis}
                                        onChange={(e) => setQualitativeAnalysis(e.target.value)}
                                        readOnly={!isEditing}
                                        className="min-h-[250px] leading-relaxed bg-muted/50"
                                        placeholder="El análisis cualitativo generado por la IA aparecerá aquí..."
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                {isEditing ? (
                                    <Button onClick={() => setIsEditing(false)}>
                                    <Check className="mr-2 h-4 w-4" /> Guardar Cambios
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                    </Button>
                                )}
                                <Button onClick={handlePublishReport}>Publicar Reporte al Equipo</Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">
                    Aún no se ha generado un reporte para {selectedTeam}.
                    </p>
                    <Button onClick={handleGenerateReport} disabled={isGenerating}>
                    {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {isGenerating ? "Generando..." : `Generar Reporte para ${selectedTeam}`}
                    </Button>
                </div>
                )}
            </TabsContent>
            <TabsContent value="debriefing">
                <DebriefingQuestions 
                    questions={debriefingQuestions}
                    suggestions={pedagogicalSuggestions}
                    onGenerate={handleGenerateReport}
                    isGenerating={isGenerating}
                />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
