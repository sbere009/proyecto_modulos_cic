import { useState } from 'react';
import { signInStudent } from '../lib/api';
import type { Student } from '../types';

interface StudentLoginScreenProps {
  onLogin: (student: Student) => void;
  onBack: () => void;
}

export function StudentLoginScreen({ onLogin, onBack }: StudentLoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const student = await signInStudent(username.trim(), password);
      onLogin(student);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      if (msg.includes('Invalid login') || msg.includes('credentials')) {
        setError('Usuario o contraseña incorrectos. Verifique sus datos.');
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-600 rounded-2xl text-white text-2xl mb-4 shadow-md">
          <i className="fa-solid fa-user-graduate" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Acceso de Alumnos</h2>
        <p className="text-sm text-slate-600 mt-1">
          Ingrese su usuario y contraseña para ver sus módulos y calificaciones.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Usuario:
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="8 dígitos"
            className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Contraseña:
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="4 dígitos"
            className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-bold text-sm shadow-md disabled:opacity-60"
        >
          {loading ? 'Validando...' : 'Ingresar a mi Portal'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-slate-500 hover:text-slate-700 text-xs font-semibold py-2"
        >
          <i className="fa-solid fa-arrow-left mr-1" />
          Volver al inicio
        </button>
      </form>
    </section>
  );
}
