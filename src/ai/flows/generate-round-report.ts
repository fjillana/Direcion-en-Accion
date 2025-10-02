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

const GenerateRoundReportOutputSchema = z.object({
  reporteCualitativo: z.string().describe('Un análisis cualitativo y detallado del rendimiento del equipo, explicando las consecuencias de sus decisiones.'),
  preguntasMayeuticas: z.array(z.string()).describe('Un array con 2-3 preguntas mayéuticas para fomentar la reflexión del estudiante.'),
  sugerenciasPedagogicas: z.string().describe('Sugerencias pedagógicas para que el profesor pueda guiar al equipo.'),
  kpiAnalysis: z.record(z.object({
      value: z.string(),
      analysis: z.string()
  })).describe("Un objeto con el análisis cuantitativo de cada KPI, explicando el porqué de su valor basado en decisiones y otros KPIs.")
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
  5.  **Análisis Cuantitativo de KPIs**: Para el campo 'kpiAnalysis', genera un análisis para cada uno de los 6 KPIs principales. El análisis debe ser CUANTITATIVO, explicando el porqué del valor. Por ejemplo, para la moral, si subió, explica qué decisiones (contratar personal: +15 puntos, formación: +10 puntos) contribuyeron a ese cambio numérico. Para el ratio, explica el cálculo.

  **IMPORTANTE**: Responde únicamente con el formato JSON solicitado. No añadas introducciones ni despedidas. El idioma de toda tu respuesta debe ser ESPAÑOL.`,
});

const generateRoundReportFlow = ai.defineFlow(
  {
    name: 'generateRoundReportFlow',
    inputSchema: GenerateRoundReportInputSchema,
    outputSchema: GenerateRoundReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
