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
import { investments as allInvestments } from '@/app/teacher/catalog/investment-data';

const GenerateRoundReportInputSchema = z.object({
  gameId: z.string().describe('El ID de la partida.'),
  roundNumber: z.number().describe('El número de ronda para el cual generar el reporte.'),
  teamPerformanceData: z.string().describe('Los datos de rendimiento del equipo en formato JSON. Incluye decisiones, KPIs finales y desglose del PEB.'),
  marketConditions: z.string().describe('Un resumen de las condiciones del mercado durante la ronda.'),
  previousKpis: z.string().optional().describe('KPIs de la ronda anterior en formato JSON para comparar la evolución.'),
});
export type GenerateRoundReportInput = z.infer<typeof GenerateRoundReportInputSchema>;

// This function creates a new Zod schema object instance each time it's called.
// This prevents Genkit from creating a schema with "$ref" properties, which Gemini API rejects.
const createKpiAnalysisSchema = () => z.object({
  value: z.string(),
  analysis: z.string()
}).describe("Un objeto con el análisis cuantitativo del KPI, explicando el porqué de su valor basado en decisiones y otros KPIs.");


const GenerateRoundReportOutputSchema = z.object({
  reporteCualitativo: z.string().describe('Un análisis cualitativo y detallado del rendimiento del equipo, explicando las consecuencias de sus decisiones.'),
  preguntasMayeuticas: z.array(z.string()).describe('Un array con 2-3 preguntas mayéuticas para fomentar la reflexión del estudiante.'),
  sugerenciasPedagogicas: z.string().describe('Sugerencias pedagógicas para que el profesor pueda guiar al equipo.'),
  kpiAnalysis: z.object({
    tesoreria: createKpiAnalysisSchema(),
    costePersonal: createKpiAnalysisSchema(),
    nma: createKpiAnalysisSchema(),
    cuotaDeMercado: createKpiAnalysisSchema(),
    moral: createKpiAnalysisSchema(),
    ratioAlumnosProfesor: createKpiAnalysisSchema(),
  }).describe("Un objeto con el análisis cuantitativo de cada KPI, explicando el porqué del valor basado en decisiones y otros KPIs.")
});
export type GenerateRoundReportOutput = z.infer<typeof GenerateRoundReportOutputSchema>;

export async function generateRoundReport(input: GenerateRoundReportInput): Promise<GenerateRoundReportOutput> {
  // We enrich the input with the full investment catalog so the AI knows the names of the investments.
  const enrichedInput = {
    ...input,
    investmentCatalog: JSON.stringify(allInvestments, null, 2)
  };
  return generateRoundReportFlow(enrichedInput);
}

const prompt = ai.definePrompt({
  name: 'generateRoundReportPrompt',
  input: {schema: GenerateRoundReportInputSchema.extend({ investmentCatalog: z.string() })},
  output: {schema: GenerateRoundReportOutputSchema},
  prompt: `Eres un asistente de IA experto en análisis de simulaciones de negocio para educación. Tu tarea es analizar el rendimiento de un equipo y generar un informe en ESPAÑOL para el profesor, siendo extremadamente riguroso y basándote ÚNICAMENTE en los datos proporcionados.

  **Contexto General:**
  - Partida: {{{gameId}}}, Ronda: {{{roundNumber}}}
  - Condiciones del Mercado: {{{marketConditions}}}
  - Catálogo de Inversiones Disponibles: {{{investmentCatalog}}}

  **Datos del Equipo (JSON):**
  \`\`\`json
  {{{teamPerformanceData}}}
  \`\`\`

  {{#if previousKpis}}
  **KPIs de la Ronda Anterior (para comparación):**
  \`\`\`json
  {{{previousKpis}}}
  \`\`\`
  {{/if}}

  **Tu Misión (Sigue estas reglas estrictamente):**
  1.  **Analiza en Profundidad**: Examina los datos de rendimiento del equipo en el JSON. Conecta sus decisiones (inversiones, precio, gestión de crisis) con los resultados en sus KPIs (finanzas, reputación, moral) y su puntuación de equilibrio de negocio (PEB).
  2.  **Genera un Reporte Cualitativo**: Redacta un párrafo conciso pero sustancioso que explique por qué el equipo obtuvo esos resultados. Destaca tanto los aciertos como los errores estratégicos. Sé directo y pedagógico. **MUY IMPORTANTE:** Si el campo \`decisions.forcedByTeacher\` es \`true\`, DEBES empezar tu análisis con la siguiente frase en negrita: "**Las decisiones de esta ronda fueron forzadas por inacción, resultando en una penalización del 50% en todo el XP ganado.**"
  3.  **Crea Preguntas Mayéuticas**: Formula 2 o 3 preguntas abiertas y reflexivas que el profesor pueda usar. Las preguntas deben obligar al estudiante a pensar críticamente sobre el dilema o "trade-off" principal de su ronda.
  4.  **Ofrece Sugerencias Pedagógicas**: Proporciona una o dos frases con consejos para el profesor sobre qué conceptos clave reforzar con este equipo.
  5.  **Análisis Cuantitativo de KPIs (CRÍTICO):** Para el campo 'kpiAnalysis', genera un análisis para CADA KPI. Tu análisis DEBE explicar el porqué del valor final de forma cuantitativa, basándote en los datos de entrada.
      - **Identifica Inversiones por ID:** Usa el 'investmentCatalog' para encontrar el nombre de cada inversión a partir de su ID en \`teamPerformanceData.decisions.actions\`. **NO ALUCINES NOMBRES DE INVERSIONES.** Si una inversión no está en la lista de acciones del equipo, no la menciones.
      - **Usa el Valor Final Correcto:** Para el campo 'value' de cada KPI, usa el valor final que se encuentra en \`teamPerformanceData.kpis\`. Asegúrate de usar el formato de valor exacto solicitado a continuación.
      - **Usa los Valores Anteriores para Comparar:** Si se proporcionan 'previousKpis', úsalos para comparar la evolución (ej. "subió de 7.5 a 8.3"). Si no se proporcionan, no inventes un valor base.
      - **Formato de Valores:**
        - **tesoreria:** Un número entero sin decimales (ej: "77600").
        - **costePersonal:** Un número entero sin decimales (ej: "247500").
        - **nma:** Un número con un decimal, usando coma (ej: "7,2").
        - **cuotaDeMercado:** Un número con dos decimales, usando coma, y el símbolo % (ej: "18,52%").
        - **moral:** Un número entero y el símbolo % (ej: "65%").
        - **ratioAlumnosProfesor:** Un número con dos decimales, usando coma (ej: "26,09").
      - **Describe el Cálculo y los Factores:** En el campo 'analysis', describe en palabras cómo se llegó al valor.
          - Para **Tesoreria**: Menciona el saldo inicial (usa el KPI 'cash' de 'previousKpis' si existe), los ingresos y los gastos totales (personal, inversiones, crisis). NO inventes el saldo inicial.
          - Para **Coste Personal**: Basa el análisis en el número de profesores y si hubo incremento salarial.
          - Para **NMA**: Compara con el valor anterior. Analiza el impacto de inversiones (ej: P1, R2). MUY IMPORTANTE: Explica si la nota cambia por el ratio alumnos/profesor. Si baja, puede ser por perder el bonus que tenía al subir el ratio por encima de 24. Si sube, puede ser por ganar el bonus al bajar el ratio de 24. También menciona la penalización de -0.3 por sobrecarga si el ratio es > 26.
          - Para **Cuota de Mercado**: Analízalo en función de la competitividad del precio y las inversiones en marketing (ej: R1).
          - Para **Moral**: Compara con el valor anterior y analiza el impacto de inversiones (P1, P2, P4, P5), despidos (P7), la importante penalización de -15 puntos si el ratio de alumnos/profesor es superior a 26, y la penalización de -10 por "Inacción en RR.HH" si no se ha realizado ninguna inversión del área 'Personal'.
          - Para **Ratio Alumnos/Profesor**: Explica que se calcula dividiendo el número final de alumnos entre el número final de profesores.

  **IMPORTANTE**: Responde únicamente con el formato JSON solicitado. No añadas introducciones ni despedidas. El idioma de toda tu respuesta debe ser ESPAÑOL.`,
});

const generateRoundReportFlow = ai.defineFlow(
  {
    name: 'generateRoundReportFlow',
    inputSchema: GenerateRoundReportInputSchema.extend({ investmentCatalog: z.string() }),
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
