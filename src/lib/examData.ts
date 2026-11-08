export const TEACHER_PIN = '1234';

// ---------- Question type definitions ----------

export interface MatchingQuestion {
  id: string;
  type: 'matching';
  prompt: string;
  options: string[];
  correct: string;
  points: number;
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple';
  prompt: string;
  options: { key: string; text: string }[];
  correct: string;
  points: number;
}

export interface SequenceQuestion {
  id: string;
  type: 'sequence';
  prompt: string;
  steps: { id: string; text: string }[];
  correct: Record<string, number>;
  points: number;
}

export interface OpenQuestion {
  id: string;
  type: 'open';
  prompt: string;
  points: number;
  reference: string;
}

export type Question =
  | MatchingQuestion
  | MultipleChoiceQuestion
  | SequenceQuestion
  | OpenQuestion;

export interface ModuleExam {
  matching: MatchingQuestion[];
  multiple: MultipleChoiceQuestion[];
  sequence: SequenceQuestion[];
  open: OpenQuestion[];
}

// ---------- Per-module question banks ----------
// Keyed by module slug. New modules created from the teacher panel can have
// questions added here later; modules without an entry get a fallback exam.

const mantenimientoPreventivo: ModuleExam = {
  matching: [
    {
      id: 'rel_1',
      type: 'matching',
      prompt:
        '1. Se trata de actividades físicas y lógicas que buscan reducir la posibilidad de fallas e inclusive corrección de fallas menores.',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      correct: 'E',
      points: 5,
    },
    {
      id: 'rel_2',
      type: 'matching',
      prompt:
        '2. Conjunto de actividades encaminadas a proteger los equipos de cómputo utilizando limpieza física y software.',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      correct: 'B',
      points: 5,
    },
    {
      id: 'rel_3',
      type: 'matching',
      prompt:
        '3. Nos permite realizar inspecciones de funcionamiento de nuestro equipo, evaluar, hacer reparaciones y limpieza.',
      options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      correct: 'G',
      points: 5,
    },
  ],
  multiple: [
    {
      id: 'om_1',
      type: 'multiple',
      prompt:
        '1.- ¿El mantenimiento de equipo de cómputo incluye no sólo computadoras, sino también?',
      options: [
        { key: 'A', text: 'El ratón, impresoras' },
        { key: 'B', text: 'Teclados, pantallas, etc.' },
        { key: 'C', text: 'Sistema Operativo' },
        { key: 'D', text: 'Todas las anteriores' },
      ],
      correct: 'D',
      points: 10,
    },
    {
      id: 'om_5',
      type: 'multiple',
      prompt:
        '5.- ¿Cuáles son las precauciones que se deben tomar en cuenta para realizar un mantenimiento preventivo físico?',
      options: [
        { key: 'A', text: 'Desconectar de la fuente de energía el equipo.' },
        { key: 'B', text: 'Nunca rocíe fluidos directamente sobre los componentes (siempre en paño).' },
        { key: 'C', text: 'No permita que líquidos corran cerca de los dispositivos.' },
        { key: 'D', text: 'Todas las anteriores.' },
      ],
      correct: 'D',
      points: 10,
    },
  ],
  sequence: [
    {
      id: 'seq_6',
      type: 'sequence',
      prompt: '6.- Ordena los pasos para el mantenimiento preventivo físico del 1 al 4:',
      steps: [
        { id: 's1', text: 'Disponer de las herramientas' },
        { id: 's2', text: 'Quitarse la estática de las manos' },
        { id: 's3', text: 'Desarmar el equipo con herramientas' },
        { id: 's4', text: 'Desconectar el equipo de la fuente de energía' },
      ],
      correct: { s1: 2, s2: 1, s3: 3, s4: 1 },
      points: 10,
    },
  ],
  open: [
    {
      id: 'open_4',
      type: 'open',
      prompt: '4.- ¿Cuáles son los tipos de mantenimiento preventivo?',
      points: 15,
      reference:
        'Los tipos incluyen mantenimiento preventivo físico (limpieza de hardware) y lógico (software, antivirus, desfragmentación).',
    },
    {
      id: 'open_8',
      type: 'open',
      prompt:
        '8.- ¿Qué herramientas utilizaste para dar mantenimiento correctivo a las computadoras?',
      points: 15,
      reference:
        'Destornilladores, cautín, pasta térmica, multímetro, brochas, aire comprimido, pulsera antiestática.',
    },
  ],
};

const questionBanks: Record<string, ModuleExam> = {
  'mantenimiento-preventivo': mantenimientoPreventivo,
};

// Fallback exam for modules without a dedicated question bank
const fallbackExam: ModuleExam = {
  matching: [
    {
      id: 'rel_1',
      type: 'matching',
      prompt: '1. Concepto fundamental del módulo (seleccione la respuesta correcta).',
      options: ['A', 'B', 'C', 'D'],
      correct: 'A',
      points: 10,
    },
  ],
  multiple: [
    {
      id: 'om_1',
      type: 'multiple',
      prompt: '1.- Pregunta de opción múltiple del módulo.',
      options: [
        { key: 'A', text: 'Opción A' },
        { key: 'B', text: 'Opción B' },
        { key: 'C', text: 'Opción C' },
        { key: 'D', text: 'Opción D' },
      ],
      correct: 'D',
      points: 20,
    },
  ],
  sequence: [],
  open: [
    {
      id: 'open_1',
      type: 'open',
      prompt: '1.- Escriba un resumen de lo aprendido en este módulo.',
      points: 20,
      reference: 'Respuesta de desarrollo relacionada al contenido del módulo.',
    },
  ],
};

export function getExamForModule(slug: string): ModuleExam {
  return questionBanks[slug] ?? fallbackExam;
}

export function getQuestionsForModule(slug: string): Question[] {
  const exam = getExamForModule(slug);
  return [...exam.matching, ...exam.multiple, ...exam.sequence, ...exam.open];
}

export function getMaxScoreForModule(slug: string): number {
  return getQuestionsForModule(slug).reduce((sum, q) => sum + q.points, 0);
}

// Legacy exports for backward compatibility
export const MAX_SCORE = [
  ...mantenimientoPreventivo.matching,
  ...mantenimientoPreventivo.multiple,
  ...mantenimientoPreventivo.sequence,
  ...mantenimientoPreventivo.open,
].reduce((sum, q) => sum + q.points, 0);

// ---------- Grading ----------

export interface GradingResult {
  score: number;
  max: number;
  details: {
    id: string;
    correct: boolean;
    pointsEarned: number;
    pointsPossible: number;
    expected?: string;
    given?: string;
  }[];
}

export function gradeExam(slug: string, answers: Record<string, string>): GradingResult {
  const exam = getExamForModule(slug);
  const details: GradingResult['details'] = [];

  for (const q of exam.matching) {
    const given = (answers[q.id] || '').toUpperCase();
    const isCorrect = given === q.correct;
    details.push({
      id: q.id,
      correct: isCorrect,
      pointsEarned: isCorrect ? q.points : 0,
      pointsPossible: q.points,
      expected: q.correct,
      given,
    });
  }

  for (const q of exam.multiple) {
    const given = (answers[q.id] || '').toUpperCase();
    const isCorrect = given === q.correct;
    details.push({
      id: q.id,
      correct: isCorrect,
      pointsEarned: isCorrect ? q.points : 0,
      pointsPossible: q.points,
      expected: q.correct,
      given,
    });
  }

  for (const q of exam.sequence) {
    let allCorrect = true;
    const givenParts: string[] = [];
    for (const step of q.steps) {
      const val = answers[`${q.id}_${step.id}`];
      givenParts.push(`${step.id}=${val}`);
      if (val === undefined || Number(val) !== q.correct[step.id]) {
        allCorrect = false;
      }
    }
    details.push({
      id: q.id,
      correct: allCorrect,
      pointsEarned: allCorrect ? q.points : 0,
      pointsPossible: q.points,
      expected: Object.entries(q.correct)
        .map(([k, v]) => `${k}=${v}`)
        .join(', '),
      given: givenParts.join(', '),
    });
  }

  for (const q of exam.open) {
    const given = (answers[q.id] || '').trim();
    const hasContent = given.length >= 20;
    const earned = hasContent ? q.points : Math.floor(q.points / 2);
    details.push({
      id: q.id,
      correct: hasContent,
      pointsEarned: earned,
      pointsPossible: q.points,
      expected: q.reference,
      given,
    });
  }

  const score = details.reduce((sum, d) => sum + d.pointsEarned, 0);
  const max = details.reduce((sum, d) => sum + d.pointsPossible, 0);
  return { score, max, details };
}
