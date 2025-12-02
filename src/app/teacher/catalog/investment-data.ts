
import type { Investment } from '@/components/teacher/catalog-editor';

export const investments: Investment[] = [
    // Finanzas
    {
      id: 'F1',
      name: 'Implantación de ERP',
      description: 'Permite automatizar la contabilidad y controlar presupuestos. Reduce costes de personal un 2%.',
      cost: { type: 'range', value: [15000, 30000] },
      effects: { personnelCostReduction: 0.02 },
      xpBonus: {
        type: 'scaled',
        finances: [5, 10],
      },
    },
    {
      id: 'F2',
      name: 'Contratación de asesoría financiera',
      description: 'Consultor financiero especializado para elaborar presupuestos y evaluar inversiones. Se contrata por ronda.',
      cost: { type: 'range', value: [8000, 12000] },
      effects: {},
      xpBonus: {
        type: 'scaled',
        finances: [3, 8],
      },
    },
    {
      id: 'F3',
      name: 'Seguro de responsabilidad civil',
      description: 'Reduce en un 10% el impacto económico de las respuestas a las crisis. Es una protección permanente.',
      cost: { type: 'fixed', value: 10000 },
      effects: {},
      xpBonus: {
        type: 'fixed',
        finances: 5,
      },
    },
    {
      id: 'F4',
      name: 'Negociación agresiva de cuentas por pagar',
      description: 'Retrasar el pago a proveedores genera liquidez inmediata (+50.000 CC) pero daña la imagen del centro.',
      cost: { type: 'fixed', value: 0 },
      effects: { cashInjection: 50000, reputationPenalty: -8 },
      xpBonus: {
        type: 'fixed',
        finances: 8,
      },
    },
    // Reputación
    {
      id: 'R1',
      name: 'Campaña publicitaria en redes',
      description: 'Mejora la visibilidad y atrae alumnos privados. Aumenta la cuota de mercado.',
      cost: { type: 'range', value: [5000, 20000] },
      effects: {}, // Effect is calculated in market attractiveness based on cost
      xpBonus: {
        type: 'scaled',
        reputation: [2, 10],
      },
    },
    {
      id: 'R2',
      name: 'Inversión en TIC',
      description: 'Renovar aulas con tecnología y equipamiento digital.',
      cost: { type: 'range', value: [10000, 75000] },
      effects: { nma: 0.2, morale: 5 },
      xpBonus: {
        type: 'scaled',
        reputation: [3, 15],
      },
    },
    {
      id: 'R3',
      name: 'Mejora de instalaciones (patios, aulas)',
      description: 'Mejora la atractividad y el bienestar general en el centro, y aumenta la capacidad en hasta 100 plazas.',
      cost: { type: 'range', value: [10000, 100000] },
      effects: { nma: 0.3, morale: 10, iam: 5 },
      xpBonus: {
        type: 'scaled',
        reputation: [5, 12],
      },
    },
    {
      id: 'R4',
      name: 'Desarrollo curricular innovador',
      description: 'Introducir programas STEM, artes o idiomas.',
      cost: { type: 'range', value: [20000, 40000] },
      effects: { nma: 0.3 },
      xpBonus: {
        type: 'fixed',
        reputation: 5,
      },
    },
    {
      id: 'R5',
      name: 'Programa de sostenibilidad y ecología',
      description: 'Implementar reciclaje, huertos escolares o certificación ecológica.',
      cost: { type: 'range', value: [5000, 15000] },
      effects: { iam: 5 },
      xpBonus: {
        type: 'fixed',
        reputation: 4,
      },
    },
    // Personal (Moral)
    {
      id: 'P1',
      name: 'Formación docente',
      description: 'Cursos de actualización, metodologías innovadoras.',
      cost: { type: 'range', value: [5000, 15000] },
      effects: { nma: 0.1, morale: 10 },
      xpBonus: {
        type: 'scaled',
        morale: [5, 10],
      },
    },
    {
      id: 'P3',
      name: 'Poaching de profesor de la competencia',
      description: 'Roba un profesor de un equipo rival si su moral es inferior a 70. Ganas 1 profesor y el rival lo pierde. El rival sufre una penalización de -10 en su moral.',
      cost: { type: 'fixed', value: 17500 },
      effects: {}, // Effects are handled directly in simulation logic due to complexity
      xpBonus: {
        type: 'fixed',
        morale: 15,
      },
    },
    {
      id: 'P4',
      name: 'Incremento salarial global',
      description: 'Aumenta permanentemente en un 10% el coste salarial de todo el personal, mejorando la satisfacción.',
      cost: { type: 'range', value: [12000, 24000] },
      effects: {}, // This is a permanent effect handled in kpi-dynamics
      xpBonus: {
        type: 'scaled',
        morale: [15, 25],
      },
    },
    {
      id: 'P5',
      name: 'Actividades sociales internas',
      description: 'Viajes de incentivo, reducción de jornada, flexibilidad horaria.',
      cost: { type: 'range', value: [2000, 8000] },
      effects: { morale: 10 },
      xpBonus: {
        type: 'fixed',
        morale: 8,
      },
    },
  ];
