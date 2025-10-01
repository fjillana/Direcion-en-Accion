
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

const fullInvestments: Investment[] = [
    { id: 'F1', name: 'Implantación de ERP', costRange: '15.000-30.000', description: 'Permite automatizar la contabilidad y controlar presupuestos. Reduce costes administrativos un 2 %.', effect: '+5 a +10 XP Finanzas' },
    { id: 'F2', name: 'Contratación de asesoría financiera', costRange: '8.000-12.000', description: 'Apoyo experto para elaborar presupuestos y evaluar inversiones. Se contrata por ronda.', effect: '+3 a +8 XP Finanzas' },
    { id: 'F3', name: 'Seguro de responsabilidad civil', costRange: '10.000 por ronda', description: 'Cubre sanciones legales en eventos negativos, reduciendo penalizaciones económicas.', effect: '+5 XP Finanzas' },
    { id: 'F4', name: 'Negociación agresiva de cuentas por pagar', costRange: '0', description: 'Retrasar el pago a proveedores genera liquidez inmediata (50.000 CC) pero daña la imagen del centro y puede afectar la confianza de la comunidad.', effect: '+8 XP Finanzas, −8 XP Reputación' },
    { id: 'F5', name: 'Ampliación de aulas / capacidad', costRange: '50.000-150.000', description: 'Aumenta el número de plazas en bloques de 50 alumnos. Imprescindible si el centro supera la capacidad flexible de 810.', effect: '+10 XP Finanzas' },
    { id: 'F6', name: 'Renegociación de deuda a largo plazo', costRange: 'Variable', description: 'Refinanciar un préstamo existente a un tipo de interés más bajo libera liquidez para invertir.', effect: '+5 XP Finanzas' },
    { id: 'F7', name: 'Oferta de servicios adicionales', costRange: '10.000-30.000', description: 'Actividades extracurriculares (idiomas, deportes, arte). Incrementan ingresos y mejoran la imagen.', effect: '+2 a +6 XP Finanzas y +3 XP Reputación' },
    { id: 'F8', name: 'Implementación de sistema de análisis de datos', costRange: '20.000-35.000', description: 'Automatiza predicciones de matrícula y optimiza asignación de recursos, mejorando la planificación.', effect: '+5 XP Finanzas' },
    { id: 'F9', name: 'Campaña de captación de patrocinadores', costRange: '5.000-15.000', description: 'Buscar patrocinadores locales para financiar proyectos (biblioteca, laboratorio), reduciendo dependencia de matrícula.', effect: '+4 XP Finanzas, +2 XP Reputación' },
    { id: 'R1', name: 'Campaña publicitaria en redes', costRange: '5.000-20.000', description: 'Mejora la visibilidad y atrae alumnos privados. Aumenta la cuota de mercado.', effect: '+2 a +10 XP Reputación' },
    { id: 'R2', name: 'Inversión en TIC', costRange: '10.000-75.000', description: 'Renovar aulas con tecnología y equipamiento digital. Mejora la NMA y la moral.', effect: '+3 a +15 XP Reputación, +3 XP Personal' },
    { id: 'R3', name: 'Mejora de instalaciones (patios, laboratorios)', costRange: '10.000-100.000', description: 'Mejora la percepción de calidad y la satisfacción de alumnos y familias.', effect: '+5 a +12 XP Reputación' },
    { id: 'R4', name: 'Desarrollo curricular innovador', costRange: '20.000-40.000', description: 'Introducir programas STEM, artes o idiomas mejora la NMA y la reputación.', effect: '+5 XP Reputación' },
    { id: 'R5', name: 'Programa de sostenibilidad y ecología', costRange: '5.000-15.000', description: 'Implementar reciclaje, huertos escolares o certificación ecológica atrae familias concienciadas.', effect: '+4 XP Reputación' },
    { id: 'R6', name: 'Programa de responsabilidad social', costRange: '3.000-8.000', description: 'Participación en proyectos comunitarios.', effect: '+3 XP Reputación, +2 XP Personal' },
    { id: 'R7', name: 'Certificaciones de calidad educativa', costRange: '7.000-20.000', description: 'Obtener certificaciones ISO/EFQM refuerza el prestigio y mejora la posición en rankings.', effect: '+6 XP Reputación' },
    { id: 'R8', name: 'Alianzas con universidades', costRange: '0-10.000', description: 'Firmar convenios con universidades para prácticas y colaboración.', effect: '+4 XP Reputación' },
    { id: 'R9', name: 'Programa de becas internas', costRange: '10.000-30.000', description: 'Otorgar becas a alumnos con talento mejora la diversidad, pero reduce los ingresos de matrícula en un 0,5 % ya que la escuela asume ese coste.', effect: '+3 XP Reputación' },
    { id: 'R10', name: 'Premios y competiciones', costRange: '5.000-15.000', description: 'Organizar concursos académicos o deportivos atrae medios y genera prestigio.', effect: '+3 XP Reputación' },
    { id: 'P1', name: 'Formación docente', costRange: '5.000-15.000', description: 'Cursos de actualización, metodologías innovadoras. Cuanto mayor es la inversión, mayor el impacto.', effect: '+5 XP Personal, +10-20 puntos de moral' },
    { id: 'P2', name: 'Contratación docente', costRange: '7.500 por ronda', description: 'Contratar un nuevo profesor reduce el ratio alumnos/profesor y la carga de trabajo. El coste salarial se añade a los gastos recurrentes.', effect: '+10 XP Personal, +15 puntos de moral' },
    { id: 'P3', name: 'Poaching de profesor de la competencia', costRange: '7.500 + 10.000 prima', description: 'Contratar a un profesor estrella de otro centro. Requiere que el rival tenga moral <70.', effect: '+15 XP Personal, +20 puntos de moral, −5 XP Reputación para el competidor' },
    { id: 'P4', name: 'Incremento salarial global (5-10 %)', costRange: '12.000-24.000 por ronda', description: 'Mejora la satisfacción, pero incrementa el coste de personal y puede comprometer la tesorería.', effect: '+15 XP Personal, +20 puntos de moral' },
    { id: 'P5', name: 'Beneficios no monetarios / vacaciones', costRange: '2.000-8.000', description: 'Viajes de incentivo, reducción de jornada, flexibilidad horaria. Mejora el clima laboral.', effect: '+8 XP Personal, +10 puntos de moral' },
    { id: 'P6', name: 'Coaching/mediación', costRange: '2.000-5.000', description: 'Sesiones para resolver conflictos y mejorar la comunicación interna.', effect: '+4 XP Personal, +5 puntos de moral' },
    { id: 'P7', name: 'Despido de profesor', costRange: '7.500 (coste por una ronda)', description: 'Acción de último recurso para reducir costes. El coste corresponde a la indemnización de un trimestre (7.500 CC).', effect: '−15 XP Personal, −25 puntos de moral; ahorro de 7.500 CC en salarios en rondas siguientes' },
    { id: 'P8', name: 'Plan de incentivos al mérito', costRange: '1.000-4.000', description: 'Premios y reconocimientos al desempeño, fomentando la motivación.', effect: '+5 XP Personal, +6 puntos de moral' },
    { id: 'P9', name: 'Programa de bienestar y salud', costRange: '5.000-15.000', description: 'Talleres de mindfulness, fisioterapia, gimnasio.', effect: '+4 XP Personal, +10 puntos de moral' },
    { id: 'P10', name: 'Reducción de jornada / flexibilidad horaria', costRange: '0-8.000', description: 'Ajustar horarios para facilitar la conciliación. Puede reducir la productividad si no se contrata apoyo.', effect: '+5 XP Personal, +12 puntos de moral' },
    { id: 'P11', name: 'Programa de mentoría intergeneracional', costRange: '3.000-7.000', description: 'Vincula a profesores veteranos con los más jóvenes, favoreciendo la transferencia de conocimientos.', effect: '+4 XP Personal, +8 puntos de moral' },
    { id: 'P12', name: 'Revisión del plan de carrera', costRange: '5.000-10.000', description: 'Clarifica oportunidades de promoción y reduce la rotación.', effect: '+6 XP Personal, +10 puntos de moral' },
    { id: 'P13', name: 'Equipamiento ergonómico / mobiliario', costRange: '10.000-25.000', description: 'Mejora las condiciones de trabajo mediante sillas, pizarras, proyectores.', effect: '+4 XP Personal, +8 puntos de moral' },
    { id: 'P14', name: 'Reuniones participativas de mejora', costRange: '0-3.000', description: 'Sesiones de retroalimentación y buzones de sugerencias que empoderan al profesorado.', effect: '+3 XP Personal, +5 puntos de moral' },
    { id: 'P15', name: 'Actividades sociales internas', costRange: '2.000-8.000', description: 'Encuentros deportivos, cenas o voluntariado interno que refuerzan el sentimiento de equipo.', effect: '+4 XP Personal, +7 puntos de moral' },
];

const fullCrises: Crisis[] = [
    {
      id: 'C1', name: 'Huelga docente', description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.',
      options: [ { label: 'Aceptar todas las demandas', effect: 'Impacto: −25.000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas' }, { label: 'Negociar un acuerdo parcial', effect: 'Impacto: −15.000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas' }, { label: 'Mantener la postura', effect: 'Impacto: huelga dura dos rondas; −20 XP en todas las áreas; moral se fija en 40; penalización severa en reputación' }, { label: 'Recurrir a mediadores externos', effect: 'Impacto: −8.000 CC, +15 puntos de moral; la huelga se reduce una ronda; +2 XP Personal' }, { label: 'Despedir a los líderes del sindicato', effect: 'Impacto: −10.000 CC en indemnizaciones, −30 puntos de moral, +5 XP Finanzas, −10 XP Reputación' }, ]
    },
    {
      id: 'C2', name: 'Retraso en la subvención pública', description: 'La consejería de educación retrasa la transferencia de 25.000 CC de la subvención pública este trimestre.',
      options: [ { label: 'Solicitar un préstamo de emergencia', effect: 'Impacto: se activa un préstamo que reduce el PEB de finanzas al 50 %; se evita una crisis de liquidez' }, { label: 'Recortar inversiones planificadas', effect: 'Impacto: −5 XP Reputación si se cancela en reputación; no se activa préstamo; mantiene el remanente' }, { label: 'Negociar con la consejería', effect: 'Impacto: gasto de 3.000 CC en viajes y trámites; 50 % de probabilidades de recuperar 15.000 CC; +2 XP Reputación si se logra; −2 XP Finanzas si fracasa' }, { label: 'Utilizar reservas de tesorería', effect: 'Impacto: baja la tesorería; si queda por debajo del 5 %, −5 XP Finanzas; no hay intereses' }, { label: 'Retrasar pagos a proveedores', effect: 'Impacto: +8 XP Finanzas, −8 XP Reputación, pero evita el endeudamiento y la crisis de liquidez.' }, ]
    },
    {
      id: 'C3', name: 'Morosidad en las matrículas privadas', description: 'Varias familias no pagan la matrícula privada del trimestre, generando un déficit de 10.000 CC en los ingresos privados.',
      options: [ { label: 'Ofrecer un plan de pagos', effect: 'Impacto: recuperación del 80 % de lo adeudado en la siguiente ronda; +2 XP Reputación; −2 XP Finanzas' }, { label: 'Subir temporalmente la matrícula a los alumnos solventes', effect: 'Impacto: −3 XP Reputación, +5 XP Finanzas; la penalización por subida de matrícula aplica' }, { label: 'Solicitar un préstamo de emergencia', effect: 'Impacto: activa préstamo; reducción de PEB finanzas al 50 %' }, { label: 'Recortar actividades extraescolares', effect: 'Impacto: −4 XP Reputación, +3 XP Finanzas; puede bajar la moral en 5 puntos' }, { label: 'Invertir en marketing para captar nuevos alumnos', effect: 'Impacto: −10.000 CC en marketing, +3 XP Reputación, +2 XP Finanzas; el efecto se nota en la siguiente ronda a través del IAM' }, ]
    },
    {
      id: 'C4', name: 'Accidente en el centro', description: 'Un accidente leve (caída en el patio, inundación en un aula) genera críticas en redes sociales y preocupación de las familias.',
      options: [ { label: 'Ignorar el incidente', effect: 'Impacto: −5 XP Reputación; −10 puntos de moral; muestra falta de transparencia' }, { label: 'Informar y pedir disculpas públicamente', effect: 'Impacto: −2 XP Reputación; +2 XP Personal por honestidad; reduce el impacto negativo' }, { label: 'Contratar un seguro adicional', effect: 'Impacto: −10.000 CC, +5 XP Finanzas; la reputación se mantiene' }, { label: 'Realizar mejoras inmediatas', effect: 'Impacto: −20.000 CC, +5 XP Reputación; mejora la moral en 5 puntos.' }, { label: 'Lanzar una campaña positiva', effect: 'Impacto: −8.000 CC, +3 XP Reputación; neutraliza la crisis y puede atraer alumnos adicionales en el MAM' }, ]
    },
    {
      id: 'C5', name: 'Crisis sanitaria', description: 'Brote de gripe o similar que obliga a suspender las clases presenciales una semana.',
      options: [ { label: 'Suspender todas las actividades y esperar a que pase', effect: 'Impacto: −3 XP Reputación; −5 XP Finanzas por pérdida de clases extraescolares' }, { label: 'Adoptar clases en línea mediante inversión en TIC (R2)', effect: 'Impacto: −10.000 CC, +5 XP Reputación; +3 XP Personal' }, { label: 'Contratar personal sanitario temporal', effect: 'Impacto: −5.000 CC, +3 XP Personal; mejora la moral' }, { label: 'Ignorar las recomendaciones sanitarias', effect: 'Impacto: −10 XP Reputación; −15 puntos de moral; riesgo de huelga' }, { label: 'Solicitar apoyo de la administración', effect: 'Impacto: −2 XP Finanzas por trámites; 50 % de probabilidad de recibir 5.000 CC para comprar equipos; +2 XP Reputación si se recibe' }, ]
    },
    {
      id: 'C6', name: 'Retraso en los ingresos por patrocinio', description: 'Una empresa patrocinadora retrasa el pago de 10.000 CC correspondiente a un patrocinio.',
      options: [ { label: 'Renegociar el contrato', effect: 'Impacto: −2 XP Finanzas, +2 XP Reputación; 50 % de recuperar 5.000 CC con interés' }, { label: 'Buscar otro patrocinador', effect: 'Impacto: +4 XP Finanzas, +2 XP Reputación; costo inicial' }, { label: 'Solicitar un préstamo', effect: 'Impacto: reducción de PEB Finanzas al 50 %' }, { label: 'Recortar gastos de marketing', effect: 'Impacto: −5 XP Reputación, +4 XP Finanzas' }, { label: 'Aceptar la pérdida', effect: 'Impacto: −2 XP Finanzas; mantiene la reputación intacta; reduce la tesorería' }, ]
    },
    {
      id: 'C7', name: 'Caso de redes sociales / ciberbullying', description: 'Se viraliza en redes sociales un caso de ciberbullying entre estudiantes del centro. Se acusa al colegio de no actuar con rapidez.',
      options: [ { label: 'Minimizar el caso', effect: 'Impacto: −8 XP Reputación; la moral baja 5 puntos; puede afectar al IAM la próxima ronda' }, { label: 'Abrir una investigación interna', effect: 'Impacto: −4 XP Reputación inicial, +3 XP Personal; previene mayores daños; mejora la moral 5 puntos' }, { label: 'Implementar un programa anti‑bullying', effect: 'Impacto: −5.000 CC, +5 XP Reputación, +3 XP Personal; mejora la NMA a largo plazo' }, { label: 'Realizar un comunicado público y pedir disculpas', effect: 'Impacto: −2 XP Reputación inicial; +2 XP Personal; evita penalizaciones mayores' }, { label: 'Demandear a los denunciantes por difamación', effect: 'Impacto: −10 XP Reputación; −10 puntos de moral; +5 XP Finanzas por ahorro de inversiones en prevención; genera mala imagen a largo plazo' }, ]
    },
];

export default function GameDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { games } = useGames();
  
  const [game, setGame] = useState<Game | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamPerformance | null>(null);
  const [isDecisionDetailOpen, setDecisionDetailOpen] = useState(false);
  const [isPebDetailOpen, setPebDetailOpen] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState("");
  const [monitoringData, setMonitoringData] = useState<TeamPerformance[]>([]);
  const [currentRoundTab, setCurrentRoundTab] = useState<string>("1");

  useEffect(() => {
    const foundGame = games.find((g) => g.id === id);
    if (foundGame) {
      setGame(foundGame);
      setCurrentRoundTab(foundGame.round.toString());
    }
  }, [games, id]);
  
  useEffect(() => {
    if (selectedTeam) {
        setTeacherNotes(`Notas para ${selectedTeam.name} en la ronda ${currentRoundTab}...`);
    }
  }, [selectedTeam, currentRoundTab]);
  
  useEffect(() => {
    // This will run when `game` is loaded or when `currentRoundTab` changes.
    if (game && parseInt(currentRoundTab) <= game.round) {
      // Simulate fetching data for the selected round
      const shuffledData = [...teamsData].sort(() => Math.random() - 0.5);
      setMonitoringData(shuffledData);
    } else {
      setMonitoringData([]);
    }
  }, [currentRoundTab, game]);


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
  
  if (!game) {
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

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitoring">Monitorización</TabsTrigger>
            <TabsTrigger value="reports">Reportes IA</TabsTrigger>
            <TabsTrigger value="config">Configuración</TabsTrigger>
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
                        <Select
                            value={currentRoundTab}
                            onValueChange={setCurrentRoundTab}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Ronda" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: game.numRounds }, (_, i) => i + 1).map((r) => (
                                <SelectItem key={r} value={r.toString()} disabled={r > game.round}>
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
                        No hay datos disponibles para la ronda {currentRoundTab}.
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <AIReportForm teamsData={teamsData} />
          </TabsContent>
          <TabsContent value="config">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Configuración de la Ronda</CardTitle>
                                <CardDescription>
                                    Selecciona una ronda para definir las inversiones y crisis disponibles.
                                </CardDescription>
                            </div>
                            <div className="w-[180px]">
                                <Select value={currentRoundTab} onValueChange={setCurrentRoundTab}>
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
                </Card>
                <RoundConfig
                  allTeams={teamsData.map(t => t.name)}
                  fullInvestments={fullInvestments}
                  fullCrises={fullCrises}
                  numRounds={game.numRounds}
                />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* PEB Breakdown Dialog */}
      <Dialog open={isPebDetailOpen} onOpenChange={setPebDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedTeam && (
            <>
              <DialogHeader>
                <DialogTitle>Desglose de PEB: {selectedTeam.name}</DialogTitle>
                <DialogDescription>
                    Cálculo detallado de los Puntos de Equilibrio de Negocio para cada área en la ronda {currentRoundTab}.
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
                 <DialogDescription>Decisiones tomadas por el equipo en la ronda {currentRoundTab}.</DialogDescription>
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
