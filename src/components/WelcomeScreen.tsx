interface WelcomeScreenProps {
  onGoToStudentLogin: () => void;
}

export function WelcomeScreen({ onGoToStudentLogin }: WelcomeScreenProps) {
  return (
    <section className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
      <div className="inline-flex items-center justify-center w-28 h-28 bg-orange-600 rounded-3xl text-white text-4xl font-extrabold mb-6 shadow-md border-4 border-white">
        CIC
      </div>

      <div className="space-y-3 mb-8">
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Portal Oficial de Evaluaciones
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Colegio Iberoamericano en Computación
        </h2>
        <p className="text-lg font-semibold text-sky-600">
          Campus Zimapán — Sistema de Evaluación Práctica y Teórica
        </p>
      </div>

      <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-6 max-w-2xl mx-auto my-6 shadow-sm">
        <i className="fa-solid fa-quote-left text-amber-600 text-xl mb-2 block" />
        <p className="text-xl font-bold text-slate-800 italic leading-relaxed">
          “No importa en la vida cuánto sabes, sino cuánto aplicas lo que sabes.”
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          onClick={onGoToStudentLogin}
          className="btn-cic-primary px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 inline-flex items-center space-x-3"
        >
          <i className="fa-solid fa-right-to-bracket" />
          <span>Ingresar con mi Credencial</span>
        </button>
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 max-w-md text-xs text-slate-600 flex items-center justify-center space-x-3">
          <i className="fa-solid fa-circle-info text-orange-500 text-base" />
          <span>
            Ingrese su número de credencial para ver sus módulos y calificaciones.
            Debe estar registrado previamente por su docente.
          </span>
        </div>
      </div>
    </section>
  );
}
