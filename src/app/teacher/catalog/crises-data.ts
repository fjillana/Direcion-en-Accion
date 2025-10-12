
import type { Crisis } from '@/components/teacher/catalog-editor';

export const crises: Crisis[] = [
    {
      id: 'C1',
      name: 'Huelga docente',
      description: 'La moral ha caído por debajo de 50 y los docentes convocan una huelga. El centro se paraliza.',
      options: [
        {
          label: 'Aceptar todas las demandas',
          cost: '-25.000 CC',
          effect: 'Impacto: −25.000 CC, +30 puntos de moral, la huelga termina inmediatamente; +5 XP Personal, −5 XP Finanzas'
        },
        {
          label: 'Negociar un acuerdo parcial',
          cost: '-15.000 CC',
          effect: 'Impacto: −15.000 CC, +20 puntos de moral; huelga termina esta ronda; +3 XP Personal, −3 XP Finanzas'
        },
        {
          label: 'Mantener la postura',
          cost: '0 CC',
          effect: 'Impacto: huelga dura dos rondas; −20 XP en todas las áreas; moral se fija en 40; penalización severa en reputación'
        },
        {
          label: 'Recurrir a mediadores externos',
          cost: '-8.000 CC',
          effect: 'Impacto: −8.000 CC, +15 puntos de moral; la huelga se reduce una ronda; +2 XP Personal'
        },
        {
          label: 'Despedir a los líderes del sindicato',
          cost: '-10.000 CC',
          effect: 'Impacto: −10.000 CC en indemnizaciones, −30 puntos de moral, +5 XP Finanzas, −10 XP Reputación'
        },
      ]
    },
    {
      id: 'C2',
      name: 'Retraso en la subvención pública',
      description: 'La consejería de educación retrasa la transferencia de 25.000 CC de la subvención pública este trimestre.',
      options: [
        { label: 'Solicitar un préstamo de emergencia', cost: 'Préstamo', effect: 'Impacto: se activa un préstamo que reduce el PEB de finanzas al 50 %; se evita una crisis de liquidez' },
        { label: 'Recortar inversiones planificadas', cost: '0 CC', effect: 'Impacto: −5 XP Reputación si se cancela en reputación; no se activa préstamo; mantiene el remanente' },
        { label: 'Negociar con la consejería', cost: '-3.000 CC', effect: 'Impacto: gasto de 3.000 CC en viajes y trámites; 50 % de probabilidades de recuperar 15.000 CC; +2 XP Reputación si se logra; −2 XP Finanzas si fracasa' },
        { label: 'Utilizar reservas de tesorería', cost: '0 CC', effect: 'Impacto: baja la tesorería; si queda por debajo del 5 %, −5 XP Finanzas; no hay intereses' },
        { label: 'Retrasar pagos a proveedores', cost: '0 CC', effect: 'Impacto: +8 XP Finanzas, −8 XP Reputación, pero evita el endeudamiento y la crisis de liquidez.' },
      ]
    },
    {
      id: 'C3',
      name: 'Morosidad en las matrículas privadas',
      description: 'Varias familias no pagan la matrícula privada del trimestre, generando un déficit de 10.000 CC en los ingresos privados.',
      options: [
        { label: 'Ofrecer un plan de pagos', cost: '0 CC', effect: 'Impacto: recuperación del 80 % de lo adeudado en la siguiente ronda; +2 XP Reputación; −2 XP Finanzas' },
        { label: 'Subir temporalmente la matrícula a los alumnos solventes', cost: '0 CC', effect: 'Impacto: −3 XP Reputación, +5 XP Finanzas; la penalización por subida de matrícula aplica' },
        { label: 'Solicitar un préstamo de emergencia', cost: 'Préstamo', effect: 'Impacto: activa préstamo; reducción de PEB finanzas al 50 %' },
        { label: 'Recortar actividades extraescolares', cost: '0 CC', effect: 'Impacto: −4 XP Reputación, +3 XP Finanzas; puede bajar la moral en 5 puntos' },
        { label: 'Invertir en marketing para captar nuevos alumnos', cost: '-10.000 CC', effect: 'Impacto: −10.000 CC en marketing, +3 XP Reputación, +2 XP Finanzas; el efecto se nota en la siguiente ronda a través del IAM' },
      ]
    },
    {
      id: 'C4',
      name: 'Accidente en el centro',
      description: 'Un accidente leve (caída en el patio, inundación en un aula) genera críticas en redes sociales y preocupación de las familias.',
      options: [
        { label: 'Ignorar el incidente', cost: '0 CC', effect: 'Impacto: −5 XP Reputación; −10 puntos de moral; muestra falta de transparencia' },
        { label: 'Informar y pedir disculpas públicamente', cost: '0 CC', effect: 'Impacto: −2 XP Reputación; +2 XP Personal por honestidad; reduce el impacto negativo' },
        { label: 'Contratar un seguro adicional', cost: '-10.000 CC', effect: 'Impacto: −10.000 CC, +5 XP Finanzas; la reputación se mantiene' },
        { label: 'Realizar mejoras inmediatas', cost: '-20.000 CC', effect: 'Impacto: −20.000 CC, +5 XP Reputación; mejora la moral en 5 puntos.' },
        { label: 'Lanzar una campaña positiva', cost: '-8.000 CC', effect: 'Impacto: −8.000 CC, +3 XP Reputación; neutraliza la crisis y puede atraer alumnos adicionales en el MAM' },
      ]
    },
    {
      id: 'C5',
      name: 'Crisis sanitaria',
      description: 'Brote de gripe o similar que obliga a suspender las clases presenciales una semana.',
      options: [
        { label: 'Suspender todas las actividades y esperar a que pase', cost: '0 CC', effect: 'Impacto: −3 XP Reputación; −5 XP Finanzas por pérdida de clases extraescolares' },
        { label: 'Adoptar clases en línea mediante inversión en TIC (R2)', cost: '-10.000 CC', effect: 'Impacto: −10.000 CC, +5 XP Reputación; +3 XP Personal' },
        { label: 'Contratar personal sanitario temporal', cost: '-5.000 CC', effect: 'Impacto: −5.000 CC, +3 XP Personal; mejora la moral' },
        { label: 'Ignorar las recomendaciones sanitarias', cost: '0 CC', effect: 'Impacto: −10 XP Reputación; −15 puntos de moral; riesgo de huelga' },
        { label: 'Solicitar apoyo de la administración', cost: '-2.000 CC', effect: 'Impacto: −2 XP Finanzas por trámites; 50 % de probabilidad de recibir 5.000 CC para comprar equipos; +2 XP Reputación si se recibe' },
      ]
    },
    {
      id: 'C6',
      name: 'Retraso en los ingresos por patrocinio',
      description: 'Una empresa patrocinadora retrasa el pago de 10.000 CC correspondiente a un patrocinio.',
      options: [
        { label: 'Renegociar el contrato', cost: '-2.000 CC', effect: 'Impacto: −2 XP Finanzas, +2 XP Reputación; 50 % de recuperar 5.000 CC con interés' },
        { label: 'Buscar otro patrocinador', cost: 'Variable', effect: 'Impacto: +4 XP Finanzas, +2 XP Reputación; costo inicial' },
        { label: 'Solicitar un préstamo', cost: 'Préstamo', effect: 'Impacto: reducción de PEB Finanzas al 50 %' },
        { label: 'Recortar gastos de marketing', cost: '0 CC', effect: 'Impacto: −5 XP Reputación, +4 XP Finanzas' },
        { label: 'Aceptar la pérdida', cost: '-10.000 CC', effect: 'Impacto: −2 XP Finanzas; mantiene la reputación intacta; reduce la tesorería' },
      ]
    },
    {
      id: 'C7',
      name: 'Caso de redes sociales / ciberbullying',
      description: 'Se viraliza en redes sociales un caso de ciberbullying entre estudiantes del centro. Se acusa al colegio de no actuar con rapidez.',
      options: [
        { label: 'Minimizar el caso', cost: '0 CC', effect: 'Impacto: −8 XP Reputación; la moral baja 5 puntos; puede afectar al IAM la próxima ronda' },
        { label: 'Abrir una investigación interna', cost: '0 CC', effect: 'Impacto: −4 XP Reputación inicial, +3 XP Personal; previene mayores daños; mejora la moral 5 puntos' },
        { label: 'Implementar un programa anti‑bullying', cost: '-5.000 CC', effect: 'Impacto: −5.000 CC, +5 XP Reputación, +3 XP Personal; mejora la NMA a largo plazo' },
        { label: 'Realizar un comunicado público y pedir disculpas', cost: '0 CC', effect: 'Impacto: −2 XP Reputación inicial; +2 XP Personal; evita penalizaciones mayores' },
        { label: 'Demandear a los denunciantes por difamación', cost: '-10.000 CC', effect: 'Impacto: −10 XP Reputación; −10 puntos de moral; +5 XP Finanzas por ahorro de inversiones en prevención; genera mala imagen a largo plazo' },
      ]
    },
  ];

    