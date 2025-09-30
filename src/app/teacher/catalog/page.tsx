import { CatalogEditor, Crisis } from "@/components/teacher/catalog-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CatalogPage() {
  const investments = [
    { id: 'F1', name: 'Implantación de ERP', cost: 22500, description: 'Permite automatizar la contabilidad y controlar presupuestos. Reduce costes administrativos un 2 %.' },
    { id: 'F2', name: 'Contratación de asesoría financiera', cost: 10000, description: 'Apoyo experto para elaborar presupuestos y evaluar inversiones. Se contrata por ronda.' },
    { id: 'F3', name: 'Seguro de responsabilidad civil', cost: 10000, description: 'Cubre sanciones legales en eventos negativos, reduciendo penalizaciones económicas.' },
    { id: 'F4', name: 'Negociación agresiva de cuentas por pagar', cost: 0, description: 'Retrasar el pago a proveedores genera liquidez inmediata (50 000 CC) pero daña la imagen.' },
    { id: 'F5', name: 'Ampliación de aulas / capacidad', cost: 100000, description: 'Aumenta el número de plazas en bloques de 50 alumnos.' },
    { id: 'F6', name: 'Renegociación de deuda a largo plazo', cost: 0, description: 'Refinanciar un préstamo existente a un tipo de interés más bajo.' },
    { id: 'F7', name: 'Oferta de servicios adicionales', cost: 20000, description: 'Actividades extracurriculares (idiomas, deportes, arte). Incrementan ingresos y mejoran la imagen.' },
    { id: 'F8', name: 'Implementación de sistema de análisis de datos', cost: 27500, description: 'Automatiza predicciones de matrícula y optimiza asignación de recursos.' },
    { id: 'F9', name: 'Campaña de captación de patrocinadores', cost: 10000, description: 'Buscar patrocinadores locales para financiar proyectos.' },
    { id: 'R1', name: 'Campaña publicitaria en redes', cost: 12500, description: 'Mejora la visibilidad y atrae alumnos privados. Aumenta la cuota de mercado.' },
    { id: 'R2', name: 'Inversión en TIC', cost: 42500, description: 'Renovar aulas con tecnología y equipamiento digital. Mejora la NMA y la moral.' },
    { id: 'R3', name: 'Mejora de instalaciones', cost: 55000, description: 'Mejora la percepción de calidad y la satisfacción de alumnos y familias.' },
    { id: 'R4', name: 'Desarrollo curricular innovador', cost: 30000, description: 'Introducir programas STEM, artes o idiomas mejora la NMA y la reputación.' },
    { id: 'R5', name: 'Programa de sostenibilidad y ecología', cost: 10000, description: 'Implementar reciclaje, huertos escolares o certificación ecológica.' },
    { id: 'R6', name: 'Programa de responsabilidad social', cost: 5500, description: 'Participación en proyectos comunitarios.' },
    { id: 'R7', name: 'Certificaciones de calidad educativa', cost: 13500, description: 'Obtener certificaciones ISO/EFQM refuerza el prestigio.' },
    { id: 'R8', name: 'Alianzas con universidades', cost: 5000, description: 'Firmar convenios con universidades para prácticas y colaboración.' },
    { id: 'R9', name: 'Programa de becas internas', cost: 20000, description: 'Otorgar becas a alumnos con talento mejora la diversidad.' },
    { id: 'R10', name: 'Premios y competiciones', cost: 10000, description: 'Organizar concursos académicos o deportivos atrae medios y genera prestigio.' },
    { id: 'P1', name: 'Formación docente', cost: 10000, description: 'Cursos de actualización, metodologías innovadoras.' },
    { id: 'P2', name: 'Contratación docente', cost: 7500, description: 'Contratar un nuevo profesor reduce el ratio alumnos/profesor. Coste recurrente.' },
    { id: 'P3', name: 'Poaching de profesor de la competencia', cost: 17500, description: 'Contratar a un profesor estrella de otro centro.' },
    { id: 'P4', name: 'Incremento salarial global (5-10 %)', cost: 18000, description: 'Mejora la satisfacción, pero incrementa el coste de personal.' },
    { id: 'P5', name: 'Beneficios no monetarios / vacaciones', cost: 5000, description: 'Viajes de incentivo, reducción de jornada, flexibilidad horaria.' },
    { id: 'P6', name: 'Coaching/mediación', cost: 3500, description: 'Sesiones para resolver conflictos y mejorar la comunicación interna.' },
    { id: 'P7', name: 'Despido de profesor', cost: 7500, description: 'Acción de último recurso para reducir costes (indemnización).' },
    { id: 'P8', name: 'Plan de incentivos al mérito', cost: 2500, description: 'Premios y reconocimientos al desempeño.' },
    { id: 'P9', name: 'Programa de bienestar y salud', cost: 10000, description: 'Talleres de mindfulness, fisioterapia, gimnasio.' },
    { id: 'P10', name: 'Reducción de jornada / flexibilidad horaria', cost: 4000, description: 'Ajustar horarios para facilitar la conciliación.' },
    { id: 'P11', name: 'Programa de mentoría intergeneracional', cost: 5000, description: 'Vincula a profesores veteranos con los más jóvenes.' },
    { id: 'P12', name: 'Revisión del plan de carrera', cost: 7500, description: 'Clarifica oportunidades de promoción y reduce la rotación.' },
    { id: 'P13', name: 'Equipamiento ergonómico / mobiliario', cost: 17500, description: 'Mejora las condiciones de trabajo.' },
    { id: 'P14', name: 'Reuniones participativas de mejora', cost: 1500, description: 'Sesiones de retroalimentación y buzones de sugerencias.' },
    { id: 'P15', name: 'Actividades sociales internas', cost: 5000, description: 'Encuentros deportivos, cenas o voluntariado interno.' },
  ];
  const crises: Crisis[] = [
    {
      id: 'C1',
      name: 'Huelga docente',
      description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.',
      options: [
        {
          label: 'Aceptar todas las demandas',
          effect: 'Impacto: −25 000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas'
        },
        {
          label: 'Negociar un acuerdo parcial',
          effect: 'Impacto: −15 000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas'
        },
        {
          label: 'Mantener la postura',
          effect: 'Impacto: huelga dura dos rondas; −20 XP en todas las áreas; moral se fija en 40; penalización severa en reputación'
        },
        {
          label: 'Recurrir a mediadores externos',
          effect: 'Impacto: −8 000 CC, +15 puntos de moral; la huelga se reduce una ronda; +2 XP Personal'
        },
        {
          label: 'Despedir a los líderes del sindicato',
          effect: 'Impacto: −10 000 CC en indemnizaciones, −30 puntos de moral, +5 XP Finanzas, −10 XP Reputación'
        },
      ]
    },
    {
      id: 'C2',
      name: 'Retraso en la subvención pública',
      description: 'La consejería de educación retrasa la transferencia de 25 000 CC de la subvención pública este trimestre.',
      options: [
        { label: 'Solicitar un préstamo de emergencia', effect: 'Impacto: se activa un préstamo que reduce el PEB de finanzas al 50 %; se evita una crisis de liquidez' },
        { label: 'Recortar inversiones planificadas', effect: 'Impacto: −5 XP Reputación si se cancela en reputación; no se activa préstamo; mantiene el remanente' },
        { label: 'Negociar con la consejería', effect: 'Impacto: gasto de 3 000 CC en viajes y trámites; 50 % de probabilidades de recuperar 15 000 CC; +2 XP Reputación si se logra; −2 XP Finanzas si fracasa' },
        { label: 'Utilizar reservas de tesorería', effect: 'Impacto: baja la tesorería; si queda por debajo del 5 %, −5 XP Finanzas; no hay intereses' },
        { label: 'Retrasar pagos a proveedores', effect: 'Impacto: +8 XP Finanzas, −8 XP Reputación, pero evita el endeudamiento y la crisis de liquidez.' },
      ]
    },
    {
      id: 'C3',
      name: 'Morosidad en las matrículas privadas',
      description: 'Varias familias no pagan la matrícula privada del trimestre, generando un déficit de 10 000 CC en los ingresos privados.',
      options: [
        { label: 'Ofrecer un plan de pagos', effect: 'Impacto: recuperación del 80 % de lo adeudado en la siguiente ronda; +2 XP Reputación; −2 XP Finanzas' },
        { label: 'Subir temporalmente la matrícula a los alumnos solventes', effect: 'Impacto: −3 XP Reputación, +5 XP Finanzas; la penalización por subida de matrícula aplica' },
        { label: 'Solicitar un préstamo de emergencia', effect: 'Impacto: activa préstamo; reducción de PEB finanzas al 50 %' },
        { label: 'Recortar actividades extraescolares', effect: 'Impacto: −4 XP Reputación, +3 XP Finanzas; puede bajar la moral en 5 puntos' },
        { label: 'Invertir en marketing para captar nuevos alumnos', effect: 'Impacto: −10 000 CC en marketing, +3 XP Reputación, +2 XP Finanzas; el efecto se nota en la siguiente ronda a través del IAM' },
      ]
    },
    {
      id: 'C4',
      name: 'Accidente en el centro',
      description: 'Un accidente leve (caída en el patio, inundación en un aula) genera críticas en redes sociales y preocupación de las familias.',
      options: [
        { label: 'Ignorar el incidente', effect: 'Impacto: −5 XP Reputación; −10 puntos de moral; muestra falta de transparencia' },
        { label: 'Informar y pedir disculpas públicamente', effect: 'Impacto: −2 XP Reputación; +2 XP Personal por honestidad; reduce el impacto negativo' },
        { label: 'Contratar un seguro adicional', effect: 'Impacto: −10 000 CC, +5 XP Finanzas; la reputación se mantiene' },
        { label: 'Realizar mejoras inmediatas', effect: 'Impacto: −20 000 CC, +5 XP Reputación; mejora la moral en 5 puntos.' },
        { label: 'Lanzar una campaña positiva', effect: 'Impacto: −8 000 CC, +3 XP Reputación; neutraliza la crisis y puede atraer alumnos adicionales en el MAM' },
      ]
    },
    {
      id: 'C5',
      name: 'Crisis sanitaria',
      description: 'Brote de gripe o similar que obliga a suspender las clases presenciales una semana.',
      options: [
        { label: 'Suspender todas las actividades y esperar a que pase', effect: 'Impacto: −3 XP Reputación; −5 XP Finanzas por pérdida de clases extraescolares' },
        { label: 'Adoptar clases en línea mediante inversión en TIC (R2)', effect: 'Impacto: −10 000 CC, +5 XP Reputación; +3 XP Personal' },
        { label: 'Contratar personal sanitario temporal', effect: 'Impacto: −5 000 CC, +3 XP Personal; mejora la moral' },
        { label: 'Ignorar las recomendaciones sanitarias', effect: 'Impacto: −10 XP Reputación; −15 puntos de moral; riesgo de huelga' },
        { label: 'Solicitar apoyo de la administración', effect: 'Impacto: −2 XP Finanzas por trámites; 50 % de probabilidad de recibir 5 000 CC para comprar equipos; +2 XP Reputación si se recibe' },
      ]
    },
    {
      id: 'C6',
      name: 'Retraso en los ingresos por patrocinio',
      description: 'Una empresa patrocinadora retrasa el pago de 10 000 CC correspondiente a un patrocinio.',
      options: [
        { label: 'Renegociar el contrato', effect: 'Impacto: −2 XP Finanzas, +2 XP Reputación; 50 % de recuperar 5 000 CC con interés' },
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
        { label: 'Implementar un programa anti‑bullying', effect: 'Impacto: −5 000 CC, +5 XP Reputación, +3 XP Personal; mejora la NMA a largo plazo' },
        { label: 'Realizar un comunicado público y pedir disculpas', effect: 'Impacto: −2 XP Reputación inicial; +2 XP Personal; evita penalizaciones mayores' },
        { label: 'Demandear a los denunciantes por difamación', effect: 'Impacto: −10 XP Reputación; −10 puntos de moral; +5 XP Finanzas por ahorro de inversiones en prevención; genera mala imagen a largo plazo' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">
        Gestión de Catálogos
      </h1>
      <Tabs defaultValue="investments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="investments">Inversiones</TabsTrigger>
          <TabsTrigger value="crises">Crisis</TabsTrigger>
        </TabsList>
        <TabsContent value="investments">
          <CatalogEditor
            title="Inversiones"
            description="Gestiona las inversiones disponibles para los estudiantes."
            data={investments}
            type="investment"
          />
        </TabsContent>
        <TabsContent value="crises">
          <CatalogEditor
            title="Crisis"
            description="Gestiona los eventos de crisis que pueden ocurrir."
            data={crises}
            type="crisis"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
