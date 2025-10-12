'use server';

/**
 * @fileOverview A round report generation AI agent.
 *
 * - generateRoundReport - A function that handles the round report generation process.
 * - GenerateRoundReportInput - The input type for the generateRoundReport function.
 * - GenerateRoundReportOutput - The return type for the generateRoundReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoundReportInputSchema = z.object({
  gameId: z.string().describe('El ID de la partida.'),
  roundNumber: z.number().describe('El número de ronda para el cual generar el reporte.'),
  teamPerformanceData: z.string().describe('Los datos de rendimiento del equipo en formato JSON.'),
  marketConditions: z.string().describe('Un resumen de las condiciones del mercado durante la ronda.'),
});
export type GenerateRoundReportInput = z.infer<typeof GenerateRoundReportInputSchema>;

const KpiAnalysisObject = z.object({
  value: z.string(),
  analysis: z.string()
}).describe("Un objeto con el análisis cuantitativo del KPI, explicando el porqué de su valor basado en decisiones y otros KPIs.");


const GenerateRoundReportOutputSchema = z.object({
  reporteCualitativo: z.string().describe('Un análisis cualitativo y detallado del rendimiento del equipo, explicando las consecuencias de sus decisiones.'),
  preguntasMayeuticas: z.array(z.string()).describe('Un array con 2-3 preguntas mayéuticas para fomentar la reflexión del estudiante.'),
  sugerenciasPedagogicas: z.string().describe('Sugerencias pedagógicas para que el profesor pueda guiar al equipo.'),
  kpiAnalysis: z.object({
    tesoreria: KpiAnalysisObject,
    costePersonal: KpiAnalysisObject,
    nma: KpiAnalysisObject,
    cuotaDeMercado: KpiAnalysisObject,
    moral: KpiAnalysisObject,
    ratioAlumnosProfesor: KpiAnalysisObject,
  }).describe("Un objeto con el análisis cuantitativo de cada KPI, explicando el porqué del valor basado en decisiones y otros KPIs.")
});
export type GenerateRoundReportOutput = z.infer<typeof GenerateRoundReportOutputSchema>;

export async function generateRoundReport(input: GenerateRoundReportInput): Promise<GenerateRoundReportOutput> {
  return generateRoundReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoundReportPrompt',
  input: {schema: GenerateRoundReportInputSchema},
  output: {schema: GenerateRoundReportOutputSchema},
  prompt: `Eres un asistente de IA experto en análisis de simulaciones de negocio para educación. Tu tarea es analizar el rendimiento de un equipo y generar un informe en ESPAÑOL para el profesor.

  **Contexto de la Simulación:**
  - Partida: {{{gameId}}}, Ronda: {{{roundNumber}}}
  - Condiciones del Mercado: {{{marketConditions}}}
  - Rendimiento del Equipo (en formato JSON): {{{teamPerformanceData}}}

  **Tu Misión:**
  1.  **Analiza en Profundidad**: Examina los datos de rendimiento del equipo. Conecta sus decisiones (inversiones, precio, gestión de crisis) con los resultados en sus KPIs (finanzas, reputación, moral) y su puntuación de equilibrio de negocio (PEB).
  2.  **Genera un Reporte Cualitativo**: Redacta un párrafo conciso pero sustancioso que explique por qué el equipo obtuvo esos resultados. Destaca tanto los aciertos como los errores estratégicos. Sé directo y pedagógico.
  3.  **Crea Preguntas Mayéuticas**: Formula 2 o 3 preguntas abiertas y reflexivas que el profesor pueda usar. Las preguntas deben obligar al estudiante a pensar críticamente sobre el dilema o "trade-off" principal de su ronda (ej: ¿sacrificar rentabilidad por cuota de mercado?, ¿cómo una crisis impactó su plan?).
  4.  **Ofrece Sugerencias Pedagógicas**: Proporciona una o dos frases con consejos para el profesor sobre qué conceptos clave reforzar con este equipo.
  5.  **Análisis Cuantitativo de KPIs (CRÍTICO):** Para el campo 'kpiAnalysis', genera un análisis para cada uno de los KPIs. Tu análisis DEBE explicar el porqué del valor de forma cuantitativa, basándote en los datos de entrada.
      - **Identifica la Causa Principal:** Para cada KPI, encuentra la causa más importante de su valor (positiva o negativa). Por ejemplo, si la moral bajó, verifica si el ratio de alumnos/profesor superó 26.0 (causando una penalización de -15 puntos). Si el NMA bajó, comprueba si el ratio superó 26.0 (penalización de -0.3).
      - **Describe el Cálculo:** En palabras, describe cómo se llegó al valor. Menciona explícitamente las decisiones (inversiones, contrataciones) del JSON de entrada que aplicaron bonus o penalizaciones.
      - **NO ALUCINES:** No menciones inversiones o decisiones que no aparezcan en el JSON \`teamPerformanceData.decisions.actions\`. Si el equipo no invirtió en algo relevante, explícalo. Ejemplo para NMA: "El NMA bajó a 7.2 principalmente por la penalización de -0.3 por sobrecarga de profesorado, al tener un ratio de 26.1. No se realizaron inversiones en formación (P1) o TIC (R2) que pudieran haber compensado esta caída."
      - **Ejemplo para Moral:** "La moral cayó a 65% debido a la fuerte penalización de -15 puntos por un ratio de alumnos/profesor superior a 26. La falta de inversión en formación (P1) o actividades sociales (P5) impidió mejorarla."

  **IMPORTANTE**: Responde únicamente con el formato JSON solicitado. No añadas introducciones ni despedidas. El idioma de toda tu respuesta debe ser ESPAÑOL.`,
});

const generateRoundReportFlow = ai.defineFlow(
  {
    name: 'generateRoundReportFlow',
    inputSchema: GenerateRoundReportInputSchema,
    outputSchema: GenerateRoundReportOutputSchema,
    retries: {
      max: 3,
      backoff: {
        initial: '1s',
        max: '10s',
        multiplier: 2,
      },
    },
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
