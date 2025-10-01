
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Edit, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { suggestDebriefingQuestions } from "@/ai/flows/suggest-debriefing-questions";

const initialDebriefingData = {
    debriefingQuestions: [
        "Vuestra inversión en TIC (R2) ha mejorado la NMA un 0.2, pero vuestro coste de personal ha superado el 75%. ¿Creéis que el beneficio en reputación compensa el riesgo financiero que estáis asumiendo? ¿Qué haríais diferente la próxima ronda?",
        "Elegisteis 'Negociar un acuerdo parcial' en la crisis de la huelga. ¿Qué os llevó a esa decisión en lugar de una más drástica como 'Aceptar todas las demandas' o 'Mantener la postura'? ¿Cómo creéis que impactará en la moral a largo plazo?",
        "Vuestro plan estratégico marcaba el objetivo de ser 'Top 2', y lo habéis conseguido. ¿Qué decisión creéis que ha sido la más determinante para alcanzar este objetivo? ¿Es sostenible esta estrategia?",
        "Vuestra política de precios es 'competitiva', pero la del Equipo Gamma es 'premium' y aun así han captado casi los mismos alumnos. ¿Qué conclusiones sacáis sobre la sensibilidad al precio en este mercado?",
    ],
    pedagogicalSuggestions: "Fomenta la discusión sobre el equilibrio entre KPIs de reputación (NMA, cuota de mercado) y los KPIs financieros (tesorería, coste de personal). Usa el ejemplo del Equipo Gamma para ilustrar que una estrategia de precios altos puede funcionar si se acompaña de una fuerte inversión en calidad percibida (instalaciones)."
}

export function DebriefingQuestions() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState(initialDebriefingData.debriefingQuestions.join("\n\n"));
  const [suggestions, setSuggestions] = useState(initialDebriefingData.pedagogicalSuggestions);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
        // This is a placeholder for the actual simulation results
        const simulationResults = "El equipo Beta ha invertido en TIC, mejorando su NMA, pero su coste de personal ha aumentado. Han negociado un acuerdo parcial en la huelga docente.";
        const result = await suggestDebriefingQuestions({ simulationResults });
        setQuestions(result.debriefingQuestions.join("\n\n"));
        setSuggestions(result.pedagogicalSuggestions);
    } catch (error) {
        console.error("Error generating debriefing questions:", error);
    } finally {
        setIsGenerating(false);
    }
  };


  return (
    <div className="pt-4 space-y-6">
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle>Preguntas de Debriefing (Mayéutica)</CardTitle>
                <CardDescription>Usa estas preguntas generadas por IA para guiar la reflexión de los estudiantes y profundizar en los objetivos de aprendizaje.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2">
                    <Label htmlFor="debriefing-questions" className="text-base font-semibold sr-only">
                        Preguntas de Debriefing
                    </Label>
                    <Textarea
                        id="debriefing-questions"
                        value={questions}
                        onChange={(e) => setQuestions(e.target.value)}
                        readOnly={!isEditing}
                        className="min-h-[200px] leading-relaxed bg-background"
                        placeholder="Las preguntas generadas aparecerán aquí..."
                    />
                </div>
            </CardContent>
        </Card>
        
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle>Sugerencias Pedagógicas</CardTitle>
                <CardDescription>Ideas para enfocar la sesión de debriefing y maximizar el aprendizaje.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2">
                    <Label htmlFor="pedagogical-suggestions" className="text-base font-semibold sr-only">
                        Sugerencias Pedagógicas
                    </Label>
                    <Textarea
                        id="pedagogical-suggestions"
                        value={suggestions}
                        onChange={(e) => setSuggestions(e.target.value)}
                        readOnly={!isEditing}
                        className="min-h-[100px] leading-relaxed bg-background"
                        placeholder="Las sugerencias para el profesor aparecerán aquí..."
                    />
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? "Generando..." : "Volver a Generar"}
            </Button>
            {isEditing ? (
                <Button onClick={() => setIsEditing(false)}>
                <Check className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
            ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
                </Button>
            )}
            <Button>Compartir con el Equipo</Button>
        </div>
    </div>
  );
}

    