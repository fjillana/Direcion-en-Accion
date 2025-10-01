
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Edit, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DebriefingQuestionsProps {
    questions: string[];
    suggestions: string;
    onGenerate: () => void;
    isGenerating: boolean;
}

export function DebriefingQuestions({ questions, suggestions, onGenerate, isGenerating }: DebriefingQuestionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState(questions.join("\n\n"));
  const [editedSuggestions, setEditedSuggestions] = useState(suggestions);

  useState(() => {
    setEditedQuestions(questions.join("\n\n"));
    setEditedSuggestions(suggestions);
  });
  
  const hasContent = questions.length > 0 || suggestions;

  return (
    <div className="pt-4 space-y-6">
       {!hasContent ? (
         <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
                Genera primero el "Análisis de Ronda" para obtener aquí las sugerencias de debriefing.
            </p>
             <Button onClick={onGenerate} disabled={isGenerating}>
                 {isGenerating ? (
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : (
                     <Wand2 className="mr-2 h-4 w-4" />
                 )}
                 {isGenerating ? "Generando..." : "Generar Análisis y Debriefing"}
             </Button>
         </div>
       ) : (
        <>
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
                            value={editedQuestions}
                            onChange={(e) => setEditedQuestions(e.target.value)}
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
                            value={editedSuggestions}
                            onChange={(e) => setEditedSuggestions(e.target.value)}
                            readOnly={!isEditing}
                            className="min-h-[100px] leading-relaxed bg-background"
                            placeholder="Las sugerencias para el profesor aparecerán aquí..."
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onGenerate} disabled={isGenerating}>
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
            </div>
        </>
       )}
    </div>
  );
}
