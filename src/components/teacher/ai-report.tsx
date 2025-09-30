import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wand2, Edit, Check } from "lucide-react";

export function AIReport() {
  const reportData = {
    report:
      "El Equipo Delta lidera gracias a una fuerte inversión en marketing, logrando el PEB más alto. El Equipo Alfa mantiene un enfoque equilibrado, mientras que el Equipo Gamma lucha con un precio de producto elevado y baja inversión en marketing. El Equipo Beta está mostrando una sobrecarga, lo que podría afectarles en rondas futuras.",
    mayeuticQuestions:
      "1. ¿Qué correlación observan entre la inversión en marketing y la cuota de mercado?\n2. Equipo Beta, ¿cuáles son los riesgos de operar con sobrecarga de personal?\n3. Equipo Gamma, ¿qué estrategias podrían implementar para mejorar su competitividad en precio?",
    pedagogicalSuggestions:
      "Fomentar un debate sobre la sostenibilidad del crecimiento a corto plazo (Equipo Beta) versus la estabilidad a largo plazo (Equipo Alfa). Utilizar el caso del Equipo Gamma para discutir la elasticidad del precio de la demanda.",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="text-primary" />
              Reporte y Sugerencias (IA)
            </CardTitle>
            <CardDescription>
              Análisis generado por IA sobre el rendimiento de la ronda. Puedes
              editarlo antes de publicar.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button>
              <Check className="mr-2 h-4 w-4" /> Publicar Resultados
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Análisis de Decisiones</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed">
              {reportData.report}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Preguntas Mayéuticas</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed whitespace-pre-line">
              {reportData.mayeuticQuestions}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Sugerencias Pedagógicas</AccordionTrigger>
            <AccordionContent className="text-base leading-relaxed">
              {reportData.pedagogicalSuggestions}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
