import { useState } from 'react';
import { TEACHER_PIN } from '../lib/examData';

interface TeacherLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export function TeacherLoginModal({ onSuccess, onClose }: TeacherLoginModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleVerify() {
    if (pin === TEACHER_PIN) {
      setError(null);
      onSuccess();
    } else {
      setError('PIN Incorrecto. Verifique con la administración.');
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
            <i className="fa-solid fa-user-lock text-orange-600" />
            <span>Acceso Docente / Administrador</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Ingrese la clave de seguridad para acceder al panel de administración.
        </p>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="Ingrese PIN (Defecto: 1234)"
          className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
        {error && (
          <p className="text-rose-600 text-xs font-semibold mb-3">{error}</p>
        )}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="w-1/2 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleVerify}
            className="w-1/2 py-2 rounded-lg text-xs font-semibold btn-cic-primary"
          >
            Ingresar al Panel
          </button>
        </div>
      </div>
    </div>
  );
}
