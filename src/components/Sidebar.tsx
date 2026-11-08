import type { Screen } from '../types';

interface SidebarProps {
  open: boolean;
  current: Screen;
  hasStudent: boolean;
  studentName: string | null;
  onNavigate: (screen: Screen) => void;
  onClose: () => void;
  onOpenTeacherLogin: () => void;
}

export function Sidebar({
  open,
  current,
  hasStudent,
  studentName,
  onNavigate,
  onClose,
  onOpenTeacherLogin,
}: SidebarProps) {
  const isWelcome = current === 'welcome';
  const isStudentArea =
    current === 'student-login' ||
    current === 'student-portal' ||
    current === 'module-detail' ||
    current === 'exam';
  const isTeacher = current === 'teacher-dashboard';

  function navigate(screen: Screen) {
    onNavigate(screen);
    onClose();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Cerrar menú lateral"
          onClick={onClose}
          className="fixed inset-0 top-[74px] bg-slate-900/30 z-30 md:hidden"
        />
      )}
      <aside
        className={`fixed left-0 top-[74px] bottom-0 w-64 bg-slate-900 text-slate-300 flex flex-col no-print z-40 border-r border-slate-800 shadow-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Menú Principal
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 md:hidden"
            aria-label="Cerrar menú lateral"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <button
              onClick={() => navigate('welcome')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isWelcome
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <i className="fa-solid fa-house w-5 text-center" />
              <span>Inicio</span>
            </button>
          </div>

          <div>
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Portal del Alumno
            </p>
            <button
              onClick={() => navigate(hasStudent ? 'student-portal' : 'student-login')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                isStudentArea
                  ? 'bg-slate-800 text-white'
                  : 'hover:bg-slate-800 hover:text-white text-slate-300'
              }`}
            >
              <i className="fa-solid fa-user-graduate text-sky-400 w-5 text-center" />
              <span className="truncate">
                {hasStudent ? `Hola, ${studentName || 'Alumno'}` : 'Acceso de Alumnos'}
              </span>
            </button>
          </div>

          {!hasStudent && (
            <div>
              <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Administración
              </p>
              <button
                onClick={onOpenTeacherLogin}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isTeacher
                    ? 'bg-slate-800 text-white'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-gear text-amber-500 w-5 text-center" />
                <span>Configuración / Docente</span>
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          <p className="font-semibold text-slate-400">Campus Zimapán</p>
          <p>Plataforma de Evaluación v3.2</p>
        </div>
      </aside>
    </>
  );
}
