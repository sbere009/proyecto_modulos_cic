import { useState, useEffect } from 'react';
import type { Student, Module, ExamResultWithModule } from '../types';
import { fetchModules, fetchExamResultsByStudent } from '../lib/api';

interface StudentPortalProps {
  student: Student;
  onLogout: () => void;
  onOpenModule: (module: Module) => void;
}

export function StudentPortal({ student, onLogout, onOpenModule }: StudentPortalProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [results, setResults] = useState<ExamResultWithModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [mods, res] = await Promise.all([
          fetchModules(true),
          fetchExamResultsByStudent(student.id),
        ]);
        if (!active) return;
        setModules(mods);
        setResults(res);
      } catch {
        if (!active) return;
        setError('No se pudo cargar la información del portal.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [student.id]);

  function bestScoreForModule(moduleId: string | null): number | null {
    if (!moduleId) return null;
    const moduleResults = results.filter((r) => r.module_id === moduleId);
    if (moduleResults.length === 0) return null;
    return Math.max(...moduleResults.map((r) => r.score));
  }

  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : null;

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Student info header */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-sky-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md">
              <i className="fa-solid fa-user-graduate" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
              <p className="text-sm text-slate-600">
                Credencial: <b>{student.credencial}</b> | Turno: {student.shift}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg"
          >
            <i className="fa-solid fa-right-from-bracket mr-1" />
            Salir
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-sky-600">{modules.length}</p>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mt-1">Módulos</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{results.length}</p>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mt-1">Examenes</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-orange-600">
              {avgScore !== null ? `${avgScore}` : '—'}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold uppercase mt-1">Promedio</p>
          </div>
        </div>
      </section>

      {error && (
        <p className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* Modules list */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center space-x-2">
          <i className="fa-solid fa-book-open text-orange-500" />
          <span>Mis Módulos</span>
        </h3>

        {loading ? (
          <p className="text-center text-slate-400 py-6 text-sm">Cargando módulos...</p>
        ) : modules.length === 0 ? (
          <p className="text-center text-slate-400 py-6 text-sm">
            No hay módulos disponibles todavía.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod) => {
              const best = bestScoreForModule(mod.id);
              return (
                <div
                  key={mod.id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <i className="fa-solid fa-wrench text-orange-500" />
                      <h4 className="font-bold text-slate-800 text-sm">{mod.name}</h4>
                    </div>
                    {best !== null && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          best >= 70
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {best}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-1">
                    Profesor: {mod.teacher}
                  </p>
                  {mod.description && (
                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">{mod.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {best === null ? (
                      <button
                        onClick={() => onOpenModule(mod)}
                        className="btn-cic-primary text-xs font-bold px-4 py-2 rounded-lg"
                      >
                        <i className="fa-solid fa-pen-to-square mr-1" />
                        Presentar examen
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                        <i className="fa-solid fa-lock mr-1" />
                        Examen presentado — no se puede repetir
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Grade history */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center space-x-2">
          <i className="fa-solid fa-chart-line text-emerald-500" />
          <span>Mis Calificaciones</span>
        </h3>

        {loading ? (
          <p className="text-center text-slate-400 py-6 text-sm">Cargando calificaciones...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-slate-400 py-6 text-sm">
            Aún no ha presentado ningún examen.
          </p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 font-bold text-slate-700 uppercase border-b">
                <tr>
                  <th className="p-3">Módulo</th>
                  <th className="p-3 text-center">Calificación</th>
                  <th className="p-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">
                      {r.module_name || r.module}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          r.score >= 70
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {r.score}/100
                      </span>
                    </td>
                    <td className="p-3">
                      {new Date(r.taken_at).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
