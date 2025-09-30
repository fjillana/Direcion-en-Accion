import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { PlayCircle } from "lucide-react";
import { AIReport } from "@/components/teacher/ai-report";
import { CatalogEditor, Crisis, Investment } from "@/components/teacher/catalog-editor";
import { Badge } from "@/components/ui/badge";

export default function GameDetailsPage({ params }: { params: { id: string } }) {
  const teams = [
    {
      name: "Equipo Alfa",
      peb: 95,
      xp: 1200,
      grade: 8.5,
      price: 102,
      marketing: 5000,
    },
    {
      name: "Equipo Beta",
      peb: 105,
      xp: 1500,
      grade: 9.2,
      price: 98,
      marketing: 6000,
    },
    {
      name: "Equipo Gamma",
      peb: 88,
      xp: 950,
      grade: 7.8,
      price: 110,
      marketing: 4000,
    },
    {
      name: "Equipo Delta",
      peb: 110,
      xp: 1800,
      grade: 9.8,
      price: 95,
      marketing: 7500,
    },
  ];

  const gameInvestments = [
    { id: 'F1', name: 'Implantación de ERP', cost: 22500, description: 'Permite automatizar la contabilidad y controlar presupuestos. Reduce costes administrativos un 2 %.', costRange: '15.000-30.000', effect: '+5 a +10 XP Finanzas' },
    { id: 'R2', name: 'Inversión en TIC', cost: 42500, description: 'Renovar aulas con tecnología y equipamiento digital. Mejora la NMA y la moral.', costRange: '10.000-75.000', effect: '+3 a +15 XP Reputación, +3 XP Personal' },
    { id: 'P1', name: 'Formación docente', cost: 10000, description: 'Cursos de actualización, metodologías innovadoras.', costRange: '5.000-15.000', effect: '+5 XP Personal, +10-20 puntos de moral' },
  ];
  const gameCrises = [
    { id: 'C1', name: 'Huelga docente', description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga.', options: [ { label: 'Aceptar todas las demandas', effect: 'Impacto: −25.000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas' }, { label: 'Negociar un acuerdo parcial', effect: 'Impacto: −15.000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas' }, { label: 'Mantener la postura', effect: 'Impacto: huelga dura dos rondas; −20 XP en todas las áreas; moral se fija en 40; penalización severa en reputación' }, { label: 'Recurrir a mediadores externos', effect: 'Impacto: −8.000 CC, +15 puntos de moral; la huelga se reduce una ronda; +2 XP Personal' }, { label: 'Despedir a los líderes del sindicato', effect: 'Impacto: −10.000 CC en indemnizaciones, −30 puntos de moral, +5 XP Finanzas, −10 XP Reputación' }, ] },
    { id: 'C4', name: 'Accidente en el centro', description: 'Un accidente leve genera críticas en redes sociales.', options: [ { label: 'Ignorar el incidente', effect: 'Impacto: −5 XP Reputación; −10 puntos de moral; muestra falta de transparencia' }, { label: 'Informar y pedir disculpas públicamente', effect: 'Impacto: −2 XP Reputación; +2 XP Personal por honestidad; reduce el impacto negativo' }, { label: 'Contratar un seguro adicional', effect: 'Impacto: −10.000 CC, +5 XP Finanzas; la reputación se mantiene' }, { label: 'Realizar mejoras inmediatas', effect: 'Impacto: −20.000 CC, +5 XP Reputación; mejora la moral en 5 puntos.' }, { label: 'Lanzar una campaña positiva', effect: 'Impacto: −8.000 CC, +3 XP Reputación; neutraliza la crisis y puede atraer alumnos adicionales en el MAM' }, ] },
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
      id: 'C1',
      name: 'Huelga docente',
      description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.',
      options: [
        {
          label: 'Aceptar todas las demandas',
          effect: 'Impacto: −25.000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas'
        },
        {
          label: 'Negociar un acuerdo parcial',
          effect: 'Impacto: −15.000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas'
        },
        {
          label: 'Mantener la postura',
          effect: 'Impacto: huelga dura dos rondas; −20 XP en todas las áreas; moral se fija en 40; penalización severa en reputación'
        },
        {
          label: 'Recurrir a mediadores externos',
          effect: 'Impacto: −8.000 CC, +15 puntos de moral; la huelga se reduce una ronda; +2 XP Personal'
        },
        {
          label: 'Despedir a los líderes del sindicato',
          effect: 'Impacto: −10.000 CC en indemnizaciones, −30 puntos de moral, +5 XP Finanzas, −10 XP Reputación'
        },
      ]
    },
    {
      id: 'C2',
      name: 'Retraso en la subvención pública',
      description: 'La consejería de educación retrasa la transferencia de 25.000 CC de la subvención pública este trimestre.',
      options: [
        { label: 'Solicitar un préstamo de emergencia', effect: 'Impacto: se activa un préstamo que reduce el PEB de finanzas al 50 %; se evita una crisis de liquidez' },
        { label: 'Recortar inversiones planificadas', effect: 'Impacto: −5 XP Reputación si se cancela en reputación; no se activa préstamo; mantiene el remanente' },
        { label: 'Negociar con la consejería', effect: 'Impacto: gasto de 3.000 CC en viajes y trámites; 50 % de probabilidades de recuperar 15.000 CC; +2 XP Reputación si se logra; −2 XP Finanzas si fracasa' },
        { label: 'Utilizar reservas de tesorería', effect: 'Impacto: baja la tesorería; si queda por debajo del 5 %, −5 XP Finanzas; no hay intereses' },
        { label: 'Retrasar pagos a proveedores', effect: 'Impacto: +8 XP Finanzas, −8 XP Reputación, pero evita el endeudamiento y la crisis de liquidez.' },
      ]
    },
    {
      id: 'C3',
      name: 'Morosidad en las matrículas privadas',
      description: 'Varias familias no pagan la matrícula privada del trimestre, generando un déficit de 10.000 CC en los ingresos privados.',
      options: [
        { label: 'Ofrecer un plan de pagos', effect: 'Impacto: recuperación del 80 % de lo adeudado en la siguiente ronda; +2 XP Reputación; −2 XP Finanzas' },
        { label: 'Subir temporalmente la matrícula a los alumnos solventes', effect: 'Impacto: −3 XP Reputación, +5 XP Finanzas; la penalización por subida de matrícula aplica' },
        { label: 'Solicitar un préstamo de emergencia', effect: 'Impacto: activa préstamo; reducción de PEB finanzas al 50 %' },
        { label: 'Recortar actividades extraescolares', effect: 'Impacto: −4 XP Reputación, +3 XP Finanzas; puede bajar la moral en 5 puntos' },
        { label: 'Invertir en marketing para captar nuevos alumnos', effect: 'Impacto: −10.000 CC en marketing, +3 XP Reputación, +2 XP Finanzas; el efecto se nota en la siguiente ronda a través del IAM' },
      ]
    },
    {
      id: 'C4',
      name: 'Accidente en el centro',
      description: 'Un accidente leve (caída en el patio, inundación en un aula) genera críticas en redes sociales y preocupación de las familias.',
      options: [
        { label: 'Ignorar el incidente', effect: 'Impacto: −5 XP Reputación; −10 puntos de moral; muestra falta de transparencia' },
        { label: 'Informar y pedir disculpas públicamente', effect: 'Impacto: −2 XP Reputación; +2 XP Personal por honestidad; reduce el impacto negativo' },
        { label: 'Contratar un seguro adicional', effect: 'Impacto: −10.000 CC, +5 XP Finanzas; la reputación se mantiene' },
        { label: 'Realizar mejoras inmediatas', effect: 'Impacto: −20.000 CC, +5 XP Reputación; mejora la moral en 5 puntos.' },
        { label: 'Lanzar una campaña positiva', effect: 'Impacto: −8.000 CC, +3 XP Reputación; neutraliza la crisis y puede atraer alumnos adicionales en el MAM' },
      ]
    },
    {
      id: 'C5',
      name: 'Crisis sanitaria',
      description: 'Brote de gripe o similar que obliga a suspender las clases presenciales una semana.',
      options: [
        { label: 'Suspender todas las actividades y esperar a que pase', effect: 'Impacto: −3 XP Reputación; −5 XP Finanzas por pérdida de clases extraescolares' },
        { label: 'Adoptar clases en línea mediante inversión en TIC (R2)', effect: 'Impacto: −10.000 CC, +5 XP Reputación; +3 XP Personal' },
        { label: 'Contratar personal sanitario temporal', effect: 'Impacto: −5.000 CC, +3 XP Personal; mejora la moral' },
        { label: 'Ignorar las recomendaciones sanitarias', effect: 'Impacto: −10 XP Reputación; −15 puntos de moral; riesgo de huelga' },
        { label: 'Solicitar apoyo de la administración', effect: 'Impacto: −2 XP Finanzas por trámites; 50 % de probabilidad de recibir 5.000 CC para comprar equipos; +2 XP Reputación si se recibe' },
      ]
    },
    {
      id: 'C6',
      name: 'Retraso en los ingresos por patrocinio',
      description: 'Una empresa patrocinadora retrasa el pago de 10.000 CC correspondiente a un patrocinio.',
      options: [
        { label: 'Renegociar el contrato', effect: 'Impacto: −2 XP Finanzas, +2 XP Reputación; 50 % de recuperar 5.000 CC con interés' },
        { label: 'Buscar otro patrocinador', effect: 'Impacto: +4 XP Finanzas, +2 XP Reputación; costo inicial' },
        { label: 'Solicitar un préstamo', effect: 'Impacto: reducción de PEB Finanzas al 50 %' },
        { label: 'Recortar gastos de marketing', effect: 'Impacto: −5 XP Reputación, +4 XP Finanzas' },
        { label: 'Aceptar la pérdida', effect: 'Impacto: −2 XP Finanzas; mantiene la reputación intacta; reduce la tesorería' },
      ]
    },
    {
      id: 'C7',
      name: 'Caso de redes sociales / ciberbullying',
      description: 'Se viraliza en redes sociales un caso de ciberbullying entre estudiantes del centro. Se acusa al colegio de no actuar con rapidez.',
      options: [
        { label: 'Minimizar el caso', effect: 'Impacto: −8 XP Reputación; la moral baja 5 puntos; puede afectar al IAM la próxima ronda' },
        { label: 'Abrir una investigación interna', effect: 'Impacto: −4 XP Reputación inicial, +3 XP Personal; previene mayores daños; mejora la moral 5 puntos' },
        { label: 'Implementar un programa anti‑bullying', effect: 'Impacto: −5.000 CC, +5 XP Reputación, +3 XP Personal; mejora la NMA a largo plazo' },
        { label: 'Realizar un comunicado público y pedir disculpas', effect: 'Impacto: −2 XP Reputación inicial; +2 XP Personal; evita penalizaciones mayores' },
        { label: 'Demandear a los denunciantes por difamación', effect: 'Impacto: −10 XP Reputación; −10 puntos de moral; +5 XP Finanzas por ahorro de inversiones en prevención; genera mala imagen a largo plazo' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Simulación de Negocios 101
          </h1>
          <p className="text-muted-foreground">
            Ronda 3 - Juego ID: {params.id}
          </p>
        </div>
        <Button size="lg">
          <PlayCircle className="mr-2 h-5 w-5" />
          Procesar Ronda
        </Button>
      </div>

      <Tabs defaultValue="monitoring">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitoring">Monitorización</TabsTrigger>
          <TabsTrigger value="reports">Reportes AI</TabsTrigger>
          <TabsTrigger value="investments">Inversiones</TabsTrigger>
          <TabsTrigger value="crises">Crisis</TabsTrigger>
        </TabsList>
        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Progreso de Equipos</CardTitle>
              <CardDescription>
                Vista general del rendimiento de cada equipo en la ronda actual.
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
                    <TableRow key={team.name}>
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
                        ${team.marketing.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <AIReport />
        </TabsContent>
        <TabsContent value="investments">
          <CatalogEditor
            title="Inversiones de la Partida"
            description="Gestiona las inversiones disponibles para esta partida."
            data={gameInvestments}
            type="investment"
            isGameCatalog={true}
            fullCatalog={fullInvestments}
          />
        </TabsContent>
        <TabsContent value="crises">
          <CatalogEditor
            title="Crisis de la Partida"
            description="Gestiona los eventos de crisis que pueden ocurrir en esta partida."
            data={gameCrises}
            type="crisis"
            isGameCatalog={true}
            fullCatalog={fullCrises}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
