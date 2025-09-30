import { CatalogEditor } from "@/components/teacher/catalog-editor";
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
  const crises = [
    { id: 'C1', name: 'Huelga docente', description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga.' },
    { id: 'C2', name: 'Retraso en la subvención pública', description: 'La consejería de educación retrasa la transferencia de 25 000 CC.' },
    { id: 'C3', name: 'Morosidad en las matrículas privadas', description: 'Varias familias no pagan la matrícula, generando un déficit de 10 000 CC.' },
    { id: 'C4', name: 'Accidente en el centro', description: 'Un accidente leve genera críticas en redes sociales.' },
    { id: 'C5', name: 'Crisis sanitaria', description: 'Un brote de gripe obliga a suspender las clases una semana.' },
    { id: 'C6', name: 'Retraso en los ingresos por patrocinio', description: 'Una empresa patrocinadora retrasa el pago de 10 000 CC.' },
    { id: 'C7', name: 'Caso de redes sociales / ciberbullying', description: 'Se viraliza un caso de ciberbullying entre estudiantes.' },
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
