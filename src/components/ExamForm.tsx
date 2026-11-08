import { useState } from 'react';
import type { Module } from '../types';
import { getExamForModule, gradeExam, type GradingResult } from '../lib/examData';
import { saveExamResult } from '../lib/api';
import type { Student, Shift } from '../types';

interface ExamFormProps {
  module: Module;
  student: Student;
  shift: Shift;
  onCompleted: (result: GradingResult) => void;
}

export function ExamForm({ module, student, shift, onCompleted }: ExamFormProps) {
  const exam = getExamForModule(module.slug);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = gradeExam(module.slug, answers);
    try {
      await saveExamResult(student.id, module.id, module.name, result.score, answers);
      onCompleted(result);
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code: unknown }).code)
        : '';
      setError(
        code === '23505'
          ? 'Este examen ya fue presentado y no se puede repetir.'
          : 'No se pudo guardar el resultado. Intente nuevamente.'
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-amber-900 text-sm">
          Alumno: {student.name} ({student.credencial})
        </h3>
        <p className="text-xs text-amber-700">
          Turno: {shift} | Módulo: {module.name}
        </p>
      </div>

      {/* I. RELACIÓN DE COLUMNAS */}
      {exam.matching.length > 0 && (
        <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-4">
          <h4 className="font-bold text-base text-slate-900 border-b pb-2">
            I. Relación de Columnas
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Seleccione la letra correspondiente a la respuesta correcta para cada concepto.
          </p>
          {exam.matching.map((q) => (
            <div key={q.id} className="flex items-center space-x-2 text-xs">
              <select
                required
                value={answers[q.id] || ''}
                onChange={(e) => setField(q.id, e.target.value)}
                className="border rounded p-1.5 bg-slate-50 font-bold"
              >
                <option value="">(?)</option>
                {q.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <span>{q.prompt}</span>
            </div>
          ))}
        </div>
      )}

      {/* II. OPCIÓN MÚLTIPLE */}
      {exam.multiple.length > 0 && (
        <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-6">
          <h4 className="font-bold text-base text-slate-900 border-b pb-2">
            II. Preguntas de Opción Múltiple
          </h4>
          {exam.multiple.map((q) => (
            <div key={q.id}>
              <p className="font-bold text-xs text-slate-800 mb-2">{q.prompt}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {q.options.map((opt) => (
                  <label key={opt.key} className="p-2 border rounded">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.key}
                      required
                      checked={answers[q.id] === opt.key}
                      onChange={(e) => setField(q.id, e.target.value)}
                    />{' '}
                    {opt.key}.- {opt.text}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* III. ORDENAMIENTO */}
      {exam.sequence.length > 0 && (
        <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-6">
          <h4 className="font-bold text-base text-slate-900 border-b pb-2">
            III. Procedimiento / Ordenamiento
          </h4>
          {exam.sequence.map((q) => (
            <div key={q.id}>
              <p className="font-bold text-xs text-slate-800 mb-2">{q.prompt}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {q.steps.map((step) => (
                  <div key={step.id}>
                    <label>{step.text}:</label>{' '}
                    <input
                      type="number"
                      min={1}
                      max={q.steps.length}
                      required
                      value={answers[`${q.id}_${step.id}`] || ''}
                      onChange={(e) => setField(`${q.id}_${step.id}`, e.target.value)}
                      className="w-16 border rounded p-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* IV. PREGUNTAS ABIERTAS */}
      {exam.open.length > 0 && (
        <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-4">
          <h4 className="font-bold text-base text-slate-900 border-b pb-2">
            IV. Preguntas de Desarrollo
          </h4>
          {exam.open.map((q) => (
            <div key={q.id}>
              <p className="font-bold text-xs text-slate-800 mb-1">{q.prompt}</p>
              <textarea
                required
                value={answers[q.id] || ''}
                onChange={(e) => setField(q.id, e.target.value)}
                placeholder="Escriba su respuesta..."
                className="w-full border rounded p-2 text-xs h-20"
              />
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="text-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-cic-primary px-8 py-3 rounded-xl font-bold text-sm shadow-md disabled:opacity-60"
        >
          {loading ? 'Guardando...' : 'Finalizar y Calificar Examen'}
        </button>
      </div>
    </form>
  );
}
