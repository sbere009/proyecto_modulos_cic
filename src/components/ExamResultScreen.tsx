import type { GradingResult } from '../lib/examData';
import type { Student, Shift } from '../types';

interface ExamResultScreenProps {
  result: GradingResult;
  student: Student;
  shift: Shift;
  onRestart: () => void;
}

export function ExamResultScreen({
  result,
  student,
  shift,
  onRestart,
}: ExamResultScreenProps) {
  const percentage = Math.round((result.score / result.max) * 100);

  return (
    <div className="space-y-6 text-left">
      <div className="hidden print:flex items-center gap-4 border-b-2 border-orange-600 pb-4">
        <img
          src="/CIC_LOGO-removebg-preview.png"
          alt="Logotipo CIC"
          className="w-20 h-20 object-contain"
        />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Colegio Iberoamericano en Computación</h1>
          <p className="text-sm text-sky-700 font-semibold">Campus Zimapán | Comprobante de Evaluación</p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex justify-between items-center">
        <div>
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
            Evaluación Finalizada
          </span>
          <h3 className="text-2xl font-bold text-emerald-950 mt-1">
            Calificación Obtenida: {result.score} / {result.max} Pts ({percentage}%)
          </h3>
          <p className="text-xs text-emerald-800 mt-1">
            Alumno: <b>{student.name}</b> | Matrícula: <b>{student.credencial}</b>
          </p>
          <p className="text-xs text-emerald-800">Turno: {shift}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md no-print"
        >
          <i className="fa-solid fa-print mr-2" />
          Imprimir / Descargar PDF
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900">
        <i className="fa-solid fa-lock mr-2 text-amber-600" />
        <b>Modo Revisión de Errores:</b> A continuación puede visualizar sus respuestas comparadas con las soluciones correctas esperadas.
      </div>

      <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4">
        <h4 className="font-bold text-sm text-slate-800 border-b pb-2">
          Revisión de Reactivos
        </h4>

        {result.details.map((d) => (
          <div
            key={d.id}
            className={`p-3 rounded-lg border ${
              d.correct
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-rose-50/50 border-rose-200'
            }`}
          >
            <p
              className={`font-bold text-xs ${
                d.correct ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              Reactivo {d.id}:{' '}
              <span
                className={`font-semibold ${
                  d.correct ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {d.correct ? `Correcta (${d.pointsEarned}/${d.pointsPossible} pts)` : `Incorrecta (${d.pointsEarned}/${d.pointsPossible} pts)`}
              </span>
            </p>
            {d.given && (
              <p className="text-[11px] text-slate-600 mt-1">Su respuesta: {d.given}</p>
            )}
            {!d.correct && d.expected && (
              <p className="text-[11px] text-rose-700 font-bold mt-1">
                Solución esperada: {d.expected}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="text-center no-print">
        <button
          onClick={onRestart}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md"
        >
          <i className="fa-solid fa-arrow-left mr-2" />
          Volver a mi portal
        </button>
      </div>
    </div>
  );
}
