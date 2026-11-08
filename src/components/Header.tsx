import type { Screen } from '../types';

interface HeaderProps {
  onNavigate: (screen: Screen) => void;
  studentName: string | null;
  onLogout: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({
  onNavigate,
  studentName,
  onLogout,
  sidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="bg-white border-b-2 border-orange-600 shadow-sm sticky top-0 z-50 flex items-center justify-between px-3 sm:px-4 py-2.5 no-print">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-orange-600 focus:outline-none transition-colors shrink-0"
          title={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-label={sidebarOpen ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
          aria-expanded={sidebarOpen}
        >
          <i className={`fa-solid ${sidebarOpen ? 'fa-xmark' : 'fa-bars'} text-xl`} />
        </button>
        <img
          src="/CIC_LOGO-removebg-preview.png"
          alt="Logotipo CIC"
          className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
        />
        <div className="min-w-0">
          <h1 className="font-bold text-gray-800 text-sm sm:text-base leading-tight truncate">
            Colegio Iberoamericano en Computación
          </h1>
          <p className="text-[11px] sm:text-xs text-sky-600 font-semibold truncate">
            Campus Zimapán | Plataforma de Evaluación
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {studentName ? (
          <>
            <span className="text-xs text-slate-600 font-semibold hidden lg:inline">
              <i className="fa-solid fa-user-graduate text-sky-600 mr-1" />
              {studentName}
            </span>
            <button
              onClick={onLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-sm"
            >
              <i className="fa-solid fa-right-from-bracket" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => onNavigate('welcome')}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-all shadow-sm"
          >
            <i className="fa-solid fa-house" />
            <span className="hidden sm:inline">Volver a Inicio</span>
          </button>
        )}
      </div>
    </header>
  );
}
