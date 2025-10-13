
import type { Crisis } from '@/components/teacher/catalog-editor';

export const crises: Crisis[] = [
    {
      id: 'C1',
      name: 'Huelga docente',
      description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.',
      options: [
        {
          id: 'C1_op1',
          label: 'Aceptar todas las demandas',
          cost: -25000,
          effect: 'Impacto: −25.000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas'
        },
        {
          id: 'C1_op2',
          label: 'Negociar un acuerdo parcial',
          cost: -15000,
          effect: 'Impacto: −15.000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas'
        },
        {
          id: 'C1_op3',
          label: 'Mantener la postura',
          cost: 0,
          effect: 'Impacto: la moral se fija en 40; penalización severa en el PEB de Reputación y -15 XP en todas las áreas.'
        },
        {
          id: 'C1_op4',
          label: 'Recurrir a mediadores externos',
          cost: -8000,
          effect: 'Impacto: −8.000 CC, +15 puntos de moral, la huelga termina esta ronda; +2 XP Personal'
        },
        {
          id: 'C1_op5',
          label: 'Despedir a los líderes del sindicato',
          cost: -10000,
          effect: 'Impacto: −10.000 CC en indemnizaciones, −30 puntos de moral, +5 XP Finanzas, −10 XP Reputación'
        },
      ]
    },
    {
      id: 'C2',
      name: 'Pérdida parcial de la subvención',
      description: 'La consejería de educación recorta 25.000 CC de la subvención pública este trimestre por un error administrativo.',
      options: [
        { id: 'C2_op1', label: 'Solicitar un préstamo de emergencia', cost: 0, effect: 'Suma 25.000 CC a tesorería pero genera deuda y una penalización de -20 PEB en Finanzas.' },
        { id: 'C2_op2', label: 'Recortar inversiones planificadas', cost: 0, effect: 'Evita la pérdida de la subvención a cambio de una penalización de -15 XP de Reputación.' },
        { id: 'C2_op3', label: 'Negociar con la consejería', cost: -3000, effect: 'Gasto de 3.000 CC; 50% de probabilidad de recuperar 15.000 CC. Éxito: +5 XP Reputación. Fracaso: -5 XP Finanzas.' },
        { id: 'C2_op4', label: 'Utilizar reservas de tesorería', cost: 0, effect: 'Se asume la pérdida de 25.000 CC directamente contra la tesorería actual. No genera penalizaciones directas.' },
        { id: 'C2_op5', label: 'Retrasar pagos a proveedores', cost: 0, effect: 'Evita la pérdida de la subvención. Impacto: +8 XP Finanzas, −8 XP Reputación.' },
      ]
    },
    {
      id: 'C3',
      name: 'Morosidad en las matrículas privadas',
      description: 'Varias familias no pagan la matrícula privada del trimestre, generando un déficit de 10.000 CC en los ingresos privados.',
      options: [
        { id: 'C3_op1', label: 'Ofrecer un plan de pagos', cost: 0, effect: 'Impacto: se recupera el 80% del déficit; +2 XP Reputación; −2 XP Finanzas' },
        { id: 'C3_op2', label: 'Subir temporalmente la matrícula a los alumnos solventes', cost: 0, effect: 'Impacto: −5 XP Reputación, +5 XP Finanzas; se compensa el déficit pero se genera mala imagen.' },
        { id: 'C3_op3', label: 'Solicitar un préstamo de emergencia', cost: 0, effect: 'Suma 10.000 CC a tesorería pero genera deuda y una penalización de -20 PEB en Finanzas.' },
        { id: 'C3_op4', label: 'Recortar actividades extraescolares', cost: 0, effect: 'Impacto: se compensa el déficit; +3 XP Finanzas, −4 XP Reputación; puede bajar la moral en 5 puntos' },
        { id: 'C3_op5', label: 'Invertir en marketing para captar nuevos alumnos', cost: -10000, effect: 'Impacto: −10.000 CC en marketing, +10 puntos de IAM, +3 XP Reputación, +2 XP Finanzas.' },
      ]
    },
    {
      id: 'C4',
      name: 'Accidente en el centro',
      description: 'Un accidente leve (caída en el patio, inundación en un aula) genera críticas en redes sociales y preocupación de las familias.',
      options: [
        { id: 'C4_op1', label: 'Ignorar el incidente', cost: 0, effect: 'Impacto: −5 XP Reputación; −10 puntos de moral; muestra falta de transparencia' },
        { id: 'C4_op2', label: 'Informar y pedir disculpas públicamente', cost: 0, effect: 'Impacto: −2 XP Reputación; +2 XP Personal por honestidad; reduce el impacto negativo' },
        { id: 'C4_op3', label: 'Contratar un seguro adicional', cost: -10000, effect: 'Impacto: −10.000 CC, +5 XP Finanzas; la reputación se mantiene' },
        { id: 'C4_op4', label: 'Realizar mejoras inmediatas', cost: -20000, effect: 'Impacto: −20.000 CC, +5 XP Reputación; mejora la moral en 5 puntos.' },
        { id: 'C4_op5', label: 'Lanzar una campaña positiva', cost: -8000, effect: 'Impacto: −8.000 CC, +3 XP Reputación, +10 IAM; neutraliza la crisis y puede atraer alumnos adicionales en el MAM' },
      ]
    },
    {
        id: 'C5',
        name: 'Crisis sanitaria',
        description: 'Brote de un virus que obliga a suspender las clases presenciales una semana.',
        options: [
          { id: 'C5_op1', label: 'Suspender todas las actividades y esperar a que pase', cost: 0, effect: 'Impacto: −3 XP Reputación; −5 XP Finanzas por pérdida de clases extraescolares' },
          { id: 'C5_op2', label: 'Adoptar clases en línea mediante inversión en TIC (R2)', cost: -10000, effect: 'Impacto: −10.000 CC, +5 XP Reputación; +3 XP Personal' },
          { id: 'C5_op3', label: 'Contratar personal sanitario temporal', cost: -5000, effect: 'Impacto: −5.000 CC, +3 XP Personal, +5 Moral' },
          { id: 'C5_op4', label: 'Ignorar las recomendaciones sanitarias', cost: 0, effect: 'Impacto: −10 XP Reputación; −15 puntos de moral; riesgo de huelga' },
          { id: 'C5_op5', label: 'Solicitar apoyo de la administración', cost: -2000, effect: 'Impacto: −2 XP Finanzas por trámites; 50 % de probabilidad de recibir 5.000 CC para comprar equipos; +2 XP Reputación si se recibe' },
        ]
    },
    {
      id: 'C6',
      name: 'Retraso en los ingresos por patrocinio',
      description: 'Una empresa patrocinadora retrasa el pago de 10.000 CC correspondiente a un patrocinio.',
      options: [
        { id: 'C6_op1', label: 'Renegociar el contrato', cost: -2000, effect: 'Impacto: -2.000 CC de coste, -2 XP Finanzas, +2 XP Reputación. 50% probabilidad de recuperar 5.000 CC.' },
        { id: 'C6_op2', label: 'Buscar otro patrocinador', cost: -4000, effect: 'Impacto: -4.000 CC de coste para encontrar un nuevo patrocinador, pero se recuperan los 10.000 CC. +4 XP Finanzas, +2 XP Reputación.' },
        { id: 'C6_op3', label: 'Solicitar un préstamo', cost: 0, effect: 'Cubre el déficit con 10.000 CC pero reduce el PEB de Finanzas a la mitad y genera intereses.' },
        { id: 'C6_op4', label: 'Recortar gastos de marketing', cost: 0, effect: 'Anula la pérdida de 10.000 CC a cambio de una penalización de -5 XP en Reputación y +4 XP en Finanzas.' },
        { id: 'C6_op5', label: 'Aceptar la pérdida', cost: 0, effect: 'Impacto: −2 XP Finanzas; mantiene la reputación intacta; reduce la tesorería' },
      ]
    },
    {
      id: 'C7',
      name: 'Caso de redes sociales / ciberbullying',
      description: 'Se viraliza en redes sociales un caso de ciberbullying entre estudiantes del centro. Se acusa al colegio de no actuar con rapidez.',
      options: [
        { id: 'C7_op1', label: 'Minimizar el caso', cost: 0, effect: 'Impacto: −8 XP Reputación; la moral baja 5 puntos; afecta negativamente al IAM (-20 puntos) la próxima ronda' },
        { id: 'C7_op2', label: 'Abrir una investigación interna', cost: 0, effect: 'Impacto: −4 XP Reputación inicial, +3 XP Personal; mejora la moral 5 puntos' },
        { id: 'C7_op3', label: 'Implementar un programa anti‑bullying', cost: -5000, effect: 'Impacto: −5.000 CC, +5 XP Reputación, +3 XP Personal; mejora el IAM en +10 puntos.' },
        { id: 'C7_op4', label: 'Realizar un comunicado público y pedir disculpas', cost: 0, effect: 'Impacto: −2 XP Reputación inicial; +2 XP Personal.' },
        { id: 'C7_op5', label: 'Demandear a los denunciantes por difamación', cost: -10000, effect: 'Impacto: −10 XP Reputación; −10 puntos de moral; +5 XP Finanzas por ahorro de inversiones en prevención; genera mala imagen a largo plazo' },
      ]
    },
  ];
