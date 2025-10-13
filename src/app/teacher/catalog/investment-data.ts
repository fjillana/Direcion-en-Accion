
import type { Investment } from '@/components/teacher/catalog-editor';

export const investments: Investment[] = [
    // Finanzas
    {
      id: 'F1',
      name: 'Implantación de ERP',
      description: 'Permite automatizar la contabilidad y controlar presupuestos. Reduce costes de personal un 2 %. Otorga entre 5 y 10 XP de Finanzas.',
      cost: { type: 'range', value: [15000, 30000] },
      bonus: { area: 'finances', type: 'scaled', value: [5, 10] },
    },
    {
      id: 'F2',
      name: 'Contratación de asesoría financiera',
      description: 'Consultor financiero especializado para elaborar presupuestos y evaluar inversiones. Se contrata por ronda. Otorga entre 3 y 8 XP de Finanzas.',
      cost: { type: 'range', value: [8000, 12000] },
      bonus: { area: 'finances', type: 'scaled', value: [3, 8] },
    },
    {
      id: 'F3',
      name: 'Seguro de responsabilidad civil',
      description: 'Reduce en un 10% el impacto económico de las respuestas a las crisis. Es una protección permanente. Otorga 5 XP de Finanzas.',
      cost: { type: 'fixed', value: 10000 },
      bonus: { area: 'finances', type: 'fixed', value: 5 },
    },
    {
      id: 'F4',
      name: 'Negociación agresiva de cuentas por pagar',
      description: 'Retrasar el pago a proveedores genera liquidez inmediata (+50.000 CC) pero daña la imagen del centro (-8 XP Reputación). Otorga 8 XP de Finanzas.',
      cost: { type: 'fixed', value: 0 },
      bonus: { area: 'finances', type: 'fixed', value: 8 }, // Note: This has a negative reputational impact not captured here
    },
    {
      id: 'F5',
      name: 'Ampliación de aulas / capacidad',
      description: 'Aumenta el número de plazas en bloques de 50 alumnos. Imprescindible si el centro supera la capacidad flexible de 810. Otorga 10 XP de Finanzas.',
      cost: { type: 'fixed', value: 50000 },
      bonus: { area: 'finances', type: 'fixed', value: 10 },
    },
    // Reputación
    {
      id: 'R1',
      name: 'Campaña publicitaria en redes',
      description: 'Mejora la visibilidad y atrae alumnos privados. Aumenta la cuota de mercado. Otorga entre 2 y 10 XP de Reputación.',
      cost: { type: 'range', value: [5000, 20000] },
      bonus: { area: 'reputation', type: 'scaled', value: [2, 10] },
    },
    {
      id: 'R2',
      name: 'Inversión en TIC',
      description: 'Renovar aulas con tecnología y equipamiento digital. Mejora la NMA (+0.2) y la moral. Otorga entre 3 y 15 XP de Reputación.',
      cost: { type: 'range', value: [10000, 75000] },
      bonus: { area: 'reputation', type: 'scaled', value: [3, 15] },
    },
    {
      id: 'R3',
      name: 'Mejora de instalaciones (patios, laboratorios)',
      description: 'Mejora la percepción de calidad y la satisfacción de alumnos y familias. Otorga entre 5 y 12 XP de Reputación.',
      cost: { type: 'range', value: [10000, 100000] },
      bonus: { area: 'reputation', type: 'scaled', value: [5, 12] },
    },
    {
      id: 'R4',
      name: 'Desarrollo curricular innovador',
      description: 'Introducir programas STEM, artes o idiomas. Aumenta la NMA en +0.3 y otorga 5 XP de Reputación.',
      cost: { type: 'range', value: [20000, 40000] },
      bonus: { area: 'reputation', type: 'fixed', value: 5 },
    },
    {
      id: 'R5',
      name: 'Programa de sostenibilidad y ecología',
      description: 'Implementar reciclaje, huertos escolares o certificación ecológica atrae familias concienciadas. Otorga 4 XP de Reputación.',
      cost: { type: 'range', value: [5000, 15000] },
      bonus: { area: 'reputation', type: 'fixed', value: 4 },
    },
    // Personal (Moral)
    {
      id: 'P1',
      name: 'Formación docente',
      description: 'Cursos de actualización, metodologías innovadoras. Aumenta NMA (+0.1) y Moral (+10). Otorga entre 5 y 10 XP de Moral.',
      cost: { type: 'range', value: [5000, 15000] },
      bonus: { area: 'morale', type: 'scaled', value: [5, 10] },
    },
    {
      id: 'P2',
      name: 'Contratación docente',
      description: 'Contratar un nuevo profesor reduce el ratio alumnos/profesor y la carga de trabajo. Mejora la moral (+15). Otorga 10 XP de Moral.',
      cost: { type: 'fixed', value: 7500 },
      bonus: { area: 'morale', type: 'fixed', value: 10 },
    },
    {
      id: 'P3',
      name: 'Poaching de profesor de la competencia',
      description: 'Contratar a un profesor estrella de otro centro. Requiere que el rival tenga moral <70. Otorga 15 XP de Moral.',
      cost: { type: 'fixed', value: 17500 },
      bonus: { area: 'morale', type: 'fixed', value: 15 },
    },
    {
      id: 'P4',
      name: 'Incremento salarial global (5-10 %)',
      description: 'Mejora la satisfacción, pero incrementa el coste de personal y puede comprometer la tesorería. Otorga entre 15 y 25 XP de Moral.',
      cost: { type: 'range', value: [12000, 24000] },
      bonus: { area: 'morale', type: 'scaled', value: [15, 25] },
    },
    {
      id: 'P5',
      name: 'Actividades sociales internas',
      description: 'Viajes de incentivo, reducción de jornada, flexibilidad horaria. Mejora el clima laboral. Otorga 8 XP de Moral.',
      cost: { type: 'range', value: [2000, 8000] },
      bonus: { area: 'morale', type: 'fixed', value: 8 },
    },
  ];

    
