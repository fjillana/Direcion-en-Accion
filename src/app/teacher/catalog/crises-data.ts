
import type { Crisis } from '@/components/teacher/catalog-editor';

export const crises: Crisis[] = [
    {
      id: 'C1',
      name: 'Huelga docente',
      description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.',
      options: [
        {
          label: 'Aceptar todas las demandas',
          costText: '-25.000 CC',
          cost: -25000,
          effect: 'Impacto: −25.000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas'
        },
        {
          label: 'Negociar un acuerdo parcial',
          costText: '-15.000 CC',
          cost: -15000,
          effect: 'Impacto: −15.000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas'
        },
        {
          label: 'Mantener la postura',
          costText: '0 CC',
          cost: 0,
          effect: 'Impacto: la moral se fija en 40; penalización severa en el PEB de Reputación y -15 XP en todas las áreas.'
        },
        {
          label: 'Recurrir a mediadores externos',
          costText: '-8.000 CC',
          cost: -8000,
          effect: 'Impacto: −8.000 CC, +15 puntos de moral; la huelga se reduce una ronda; +2 XP Personal'
        },
        {
          label: 'Despedir a los líderes del sindicato',
          costText: '-10.000 CC',
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
        { label: 'Solicitar un préstamo de emergencia', costText: 'Préstamo', cost: 0, effect: 'Suma 25.000 CC a tesorería pero genera deuda. Penalización de -20 PEB en Finanzas y coste por intereses.' },
        { label: 'Recortar inversiones planificadas', costText: '0 CC', cost: 0, effect: 'Evita la pérdida de la subvención a cambio de una penalización de -15 XP de Reputación.' },
        { label: 'Negociar con la consejería', costText: '-3.000 CC', cost: -3000, effect: 'Gasto de 3.000 CC; 50% de probabilidad de recuperar 15.000 CC. Éxito: +5 XP Reputación. Fracaso: -5 XP Finanzas.' },
        { label: 'Utilizar reservas de tesorería', costText: '0 CC', cost: 0, effect: 'Se asume la pérdida de 25.000 CC directamente contra la tesorería actual. No genera intereses ni penalizaciones directas de XP.' },
        { label: 'Retrasar pagos a proveedores', costText: '0 CC', cost: 0, effect: 'Evita la pérdida de 25.000 CC en la tesorería. Impacto: +8 XP Finanzas, −8 XP Reputación.' },
      ]
    },
    {
      id: 'C3',
      name: 'Morosidad en las matrículas privadas',
      description: 'Varias familias no pagan la matrícula privada del trimestre, generando un déficit de 10.000 CC en los ingresos privados.',
      options: [
        { label: 'Ofrecer un plan de pagos', costText: '0 CC', cost: 0, effect: 'Impacto: recuperación del 80 % de lo adeudado en la siguiente ronda; +2 XP Reputación; −2 XP Finanzas' },
        { label: 'Subir temporalmente la matrícula a los alumnos solventes', costText: '0 CC', cost: 0, effect: 'Impacto: −3 XP Reputación, +5 XP Finanzas; la penalización por subida de matrícula aplica' },
        { label: 'Solicitar un préstamo de emergencia', costText: 'Préstamo', cost: 0, effect: 'Impacto: activa préstamo; reducción de PEB finanzas al 50 %' },
        { label: 'Recortar actividades extraescolares', costText: '0 CC', cost: 0, effect: 'Impacto: −4 XP Reputación, +3 XP Finanzas; puede bajar la moral en 5 puntos' },
        { label: 'Invertir en marketing para captar nuevos alumnos', costText: '-10.000 CC', cost: -10000, effect: 'Impacto: −10.000 CC en marketing, +3 XP Reputación, +2 XP Finanzas; el efecto se nota en la siguiente ronda a través del IAM' },
      ]
    },
    {
      id: 'C4',
      name: 'Accidente en el centro',
      description: 'Un accidente leve (caída en el patio, inundación en un aula) genera críticas en redes sociales y preocupación de las familias.',
      options: [
        { label: 'Ignorar el incidente', costText: '0 CC', cost: 0, effect: 'Impacto: −5 XP Reputación; −10 puntos de moral; muestra falta de transparencia' },
        { label: 'Informar y pedir disculpas públicamente', costText: '0 CC', cost: 0, effect: 'Impacto: −2 XP Reputación; +2 XP Personal por honestidad; reduce el impacto negativo' },
        { label: 'Contratar un seguro adicional', costText: '-10.000 CC', cost: -10000, effect: 'Impacto: −10.000 CC, +5 XP Finanzas; la reputación se mantiene' },
        { label: 'Realizar mejoras inmediatas', costText: '-20.000 CC', cost: -20000, effect: 'Impacto: −20.000 CC, +5 XP Reputación; mejora la moral en 5 puntos.' },
        { label: 'Lanzar una campaña positiva', costText: '-8.000 CC', cost: -8000, effect: 'Impacto: −8.000 CC, +3 XP Reputación; neutraliza la crisis y puede atraer alumnos adicionales en el MAM' },
      ]
    },
    {
      id: 'C5',
      name: 'Crisis sanitaria',
      description: 'Brote de gripe o similar que obliga a suspender las clases presenciales una semana.',
      options: [
        { label: 'Suspender todas las actividades y esperar a que pase', costText: '0 CC', cost: 0, effect: 'Impacto: −3 XP Reputación; −5 XP Finanzas por pérdida de clases extraescolares' },
        { label: 'Adoptar clases en línea mediante inversión en TIC (R2)', costText: '-10.000 CC', cost: -10000, effect: 'Impacto: −10.000 CC, +5 XP Reputación; +3 XP Personal' },
        { label: 'Contratar personal sanitario temporal', costText: '-5.000 CC', cost: -5000, effect: 'Impacto: −5.000 CC, +3 XP Personal; mejora la moral' },
        { label: 'Ignorar las recomendaciones sanitarias', costText: '0 CC', cost: 0, effect: 'Impacto: −10 XP Reputación; −15 puntos de moral; riesgo de huelga' },
        { label: 'Solicitar apoyo de la administración', costText: '-2.000 CC', cost: -2000, effect: 'Impacto: −2 XP Finanzas por trámites; 50 % de probabilidad de recibir 5.000 CC para comprar equipos; +2 XP Reputación si se recibe' },
      ]
    },
    {
      id: 'C6',
      name: 'Retraso en los ingresos por patrocinio',
      description: 'Una empresa patrocinadora retrasa el pago de 10.000 CC correspondiente a un patrocinio.',
      options: [
        { label: 'Renegociar el contrato', costText: '-2.000 CC', cost: -2000, effect: 'Impacto: −2 XP Finanzas, +2 XP Reputación; 50 % de recuperar 5.000 CC con interés' },
        { label: 'Buscar otro patrocinador', costText: 'Variable', cost: 0, effect: 'Impacto: +4 XP Finanzas, +2 XP Reputación; costo inicial' },
        { label: 'Solicitar un préstamo', costText: 'Préstamo', cost: 0, effect: 'Impacto: reducción de PEB Finanzas al 50 %' },
        { label: 'Recortar gastos de marketing', costText: '0 CC', cost: 0, effect: 'Impacto: −5 XP Reputación, +4 XP Finanzas' },
        { label: 'Aceptar la pérdida', costText: '-10.000 CC', cost: -10000, effect: 'Impacto: −2 XP Finanzas; mantiene la reputación intacta; reduce la tesorería' },
      ]
    },
    {
      id: 'C7',
      name: 'Caso de redes sociales / ciberbullying',
      description: 'Se viraliza en redes sociales un caso de ciberbullying entre estudiantes del centro. Se acusa al colegio de no actuar con rapidez.',
      options: [
        { label: 'Minimizar el caso', costText: '0 CC', cost: 0, effect: 'Impacto: −8 XP Reputación; la moral baja 5 puntos; puede afectar al IAM la próxima ronda' },
        { label: 'Abrir una investigación interna', costText: '0 CC', cost: 0, effect: 'Impacto: −4 XP Reputación inicial, +3 XP Personal; previene mayores daños; mejora la moral 5 puntos' },
        { label: 'Implementar un programa anti‑bullying', costText: '-5.000 CC', cost: -5000, effect: 'Impacto: −5.000 CC, +5 XP Reputación, +3 XP Personal; mejora la NMA a largo plazo' },
        { label: 'Realizar un comunicado público y pedir disculpas', costText: '0 CC', cost: 0, effect: 'Impacto: −2 XP Reputación inicial; +2 XP Personal; evita penalizaciones mayores' },
        { label: 'Demandear a los denunciantes por difamación', costText: '-10.000 CC', cost: -10000, effect: 'Impacto: −10 XP Reputación; −10 puntos de moral; +5 XP Finanzas por ahorro de inversiones en prevención; genera mala imagen a largo plazo' },
      ]
    },
  ];
