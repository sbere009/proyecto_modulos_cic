import type { Module } from '../types';
import { getMaxScoreForModule } from '../lib/examData';

interface ModuleDetailScreenProps {
  module: Module;
  onStart: () => void;
  onBack: () => void;
}

export function ModuleDetailScreen({ module, onStart, onBack }: ModuleDetailScreenProps) {
  const maxScore = getMaxScoreForModule(module.slug);

  return (
    <section className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="border-b border-slate-200 pb-6 mb-6">
        <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
          Módulo Didáctico
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mt-2">{module.name}</h2>
        <p className="text-sm text-slate-600 mt-1">
          Profesor: {module.teacher} | Campus Zimapán
        </p>
        {module.description && (
          <p className="text-sm text-slate-500 mt-2">{module.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
          <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center space-x-2">
            <i className="fa-solid fa-list-check text-orange-500" />
            <span>Estructura de la Evaluación</span>
          </h4>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex justify-between border-b border-slate-200 pb-1">
              <span>Ficha del Alumno (Datos):</span>
              <span className="font-semibold text-slate-800">6 Pts</span>
            </li>
            <li className="flex justify-between border-b border-slate-200 pb-1">
              <span>Sección I Práctica (Hardware):</span>
              <span className="font-semibold text-slate-800">34 Pts</span>
            </li>
            <li className="flex justify-between border-b border-slate-200 pb-1">
              <span>Sección II Teórica (Conceptos):</span>
              <span className="font-semibold text-slate-800">60 Pts</span>
            </li>
            <li className="flex justify-between">
              <span className="font-bold">Total del Examen:</span>
              <span className="font-bold text-orange-600">{maxScore} Pts</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-xl">
          <h4 className="font-bold text-amber-900 text-sm mb-3 flex items-center space-x-2">
            <i className="fa-solid fa-triangle-exclamation text-amber-600" />
            <span>Instrucciones Importantes</span>
          </h4>
          <p className="text-xs text-amber-900/80 leading-relaxed">
            Asegúrese de tener su credencial a la mano. Al finalizar, podrá revisar
            sus errores y descargar su comprobante oficial. La calificación se
            guardará automáticamente en su historial.
          </p>
        </div>
      </div>

      <div className="text-center pt-4 space-x-3">
        <button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-xl font-bold text-sm"
        >
          <i className="fa-solid fa-arrow-left mr-2" />
          Regresar
        </button>
        <button
          onClick={onStart}
          className="btn-cic-primary px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 inline-flex items-center space-x-3"
        >
          <span>Iniciar Evaluación</span>
          <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </section>
  );
}
