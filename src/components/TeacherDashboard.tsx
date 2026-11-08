import { useState, useEffect, useCallback } from 'react';
import {
  SHIFTS,
  type Student,
  type StudentInput,
  type Module,
  type ModuleInput,
  type Shift,
  type ExamResultWithStudent,
} from '../types';
import {
  fetchStudents,
  createStudentAccount,
  generateStudentUsername,
  generateTemporaryPassword,
  deleteStudent,
  fetchModules,
  createModule,
  updateModule,
  deleteModule,
  fetchAllExamResults,
  fetchExamResultsByModule,
} from '../lib/api';

type Tab = 'students' | 'grades' | 'modules';

interface TeacherDashboardProps {
  onExit: () => void;
}

export function TeacherDashboard({ onExit }: TeacherDashboardProps) {
  const [tab, setTab] = useState<Tab>('students');

  return (
    <section className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center border-b border-slate-200 pb-6 mb-6">
        <div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Panel de Control Docente
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            Gestión Académica
          </h2>
        </div>
        <button onClick={onExit} className="btn-cic-primary text-xs px-4 py-2 rounded-lg font-bold">
          <i className="fa-solid fa-lock mr-2" />
          Regresar a Modo Alumno
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <TabButton active={tab === 'students'} onClick={() => setTab('students')} icon="fa-users" label="Alumnos" />
        <TabButton active={tab === 'grades'} onClick={() => setTab('grades')} icon="fa-chart-column" label="Calificaciones" />
        <TabButton active={tab === 'modules'} onClick={() => setTab('modules')} icon="fa-book" label="Módulos" />
      </div>

      {tab === 'students' && <StudentsTab />}
      {tab === 'grades' && <GradesTab />}
      {tab === 'modules' && <ModulesTab />}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
        active
          ? 'border-orange-600 text-orange-600'
          : 'border-transparent text-slate-400 hover:text-slate-600'
      }`}
    >
      <i className={`fa-solid ${icon}`} />
      <span>{label}</span>
    </button>
  );
}

// ---------- Students Tab ----------

function StudentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<StudentInput>({
    name: '',
    credencial: '',
    shift: 'Matutino Sábado',
    username: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch {
      setError('No se pudo cargar la lista de alumnos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Genere las credenciales antes de crear la cuenta.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await createStudentAccount(form);
      setStudents((prev) => [...prev, created]);
      setVisiblePasswords((prev) => ({ ...prev, [created.id]: form.password }));
      setForm({ name: '', credencial: '', shift: 'Matutino Sábado', username: '', password: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar alumno.';
      if (msg.includes('already') || msg.includes('registered') || msg.includes('duplicate')) {
        setError('Ya existe un alumno con ese usuario o credencial.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este alumno? Se borrarán también sus calificaciones.')) return;
    try {
      await deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError('No se pudo eliminar al alumno.');
    }
  }

  return (
    <div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
        <h4 className="font-bold text-slate-800 text-sm mb-4">
          Registrar Nuevo Alumno
        </h4>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo:</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Berenice García"
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              No. Credencial / Matrícula:
            </label>
            <input
              type="text"
              required
              value={form.credencial}
              onChange={(e) => setForm({ ...form, credencial: e.target.value })}
              placeholder="Ej. CIC-2026-01"
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Turno:</label>
            <select
              required
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value as Shift })}
              className="w-full px-3 py-2 border rounded-lg text-xs"
            >
              {SHIFTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Usuario generado:
            </label>
            <input
              type="text"
              required
              readOnly
              value={form.username}
              placeholder="Genere las credenciales"
              className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contraseña temporal generada:
            </label>
            <input
              type="text"
              required
              readOnly
              value={form.password}
              placeholder="Se mostrará aquí"
              className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-100"
            />
          </div>
          <div className="md:col-span-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (!form.name.trim() || !form.credencial.trim()) {
                  setError('Capture primero el nombre y la matrícula.');
                  return;
                }
                setError(null);
                setForm({
                  ...form,
                  username: generateStudentUsername(form.name, form.credencial),
                  password: generateTemporaryPassword(),
                });
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm"
            >
              <i className="fa-solid fa-key mr-1" /> Generar acceso
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm disabled:opacity-60"
            >
              <i className="fa-solid fa-user-plus mr-1" />{' '}
              {submitting ? 'Creando cuenta...' : 'Crear cuenta de alumno'}
            </button>
          </div>
        </form>
        <p className="text-[11px] text-slate-400 mt-3">
          <i className="fa-solid fa-circle-info mr-1" />
          El usuario se forma con sus datos y la contraseña se genera de forma segura.
          Guarde la contraseña inicial y comuníquesela al alumno: no podrá recuperarse después.
        </p>
      </div>

      {error && (
        <p className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-200 rounded px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <h4 className="font-bold text-slate-800 text-sm mb-3">
        Lista Oficial de Estudiantes ({students.length})
      </h4>
      {loading ? (
        <p className="text-center text-slate-400 py-6 text-sm">Cargando...</p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 font-bold text-slate-700 uppercase border-b">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Nombre Completo</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Contraseña inicial</th>
                <th className="p-3">Matrícula</th>
                <th className="p-3">Turno</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No hay alumnos registrados. Cree la primera cuenta arriba.
                  </td>
                </tr>
              ) : (
                students.map((st, idx) => (
                  <tr key={st.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-semibold">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-800">{st.name}</td>
                    <td className="p-3">
                      <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {st.username || '—'}
                      </span>
                    </td>
                    <td className="p-3">
                    {visiblePasswords[st.id] ? (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded select-all">
                        {visiblePasswords[st.id]}
                      </span>
                    ) : (
                      <span className="text-slate-400">No disponible</span>
                    )}
                  </td>
                  <td className="p-3">{st.credencial}</td>
                    <td className="p-3">{st.shift}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(st.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- Grades Tab ----------

function GradesTab() {
  const [results, setResults] = useState<ExamResultWithStudent[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, mods] = await Promise.all([fetchAllExamResults(), fetchModules()]);
      setResults(res);
      setModules(mods);
    } catch {
      setError('No se pudieron cargar las calificaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleFilterChange(moduleId: string) {
    setFilterModule(moduleId);
    setLoading(true);
    setError(null);
    try {
      if (moduleId === 'all') {
        const res = await fetchAllExamResults();
        setResults(res);
      } else {
        const res = await fetchExamResultsByModule(moduleId);
        setResults(res);
      }
    } catch {
      setError('No se pudieron cargar las calificaciones.');
    } finally {
      setLoading(false);
    }
  }

  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
      : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Filtrar por módulo:</label>
          <select
            value={filterModule}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border rounded-lg text-xs"
          >
            <option value="all">Todos los módulos</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        {avgScore !== null && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs">
            <span className="text-slate-500">Promedio general: </span>
            <span className="font-bold text-orange-600">{avgScore}/100</span>
            <span className="text-slate-400 ml-2">({results.length} exámenes)</span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-200 rounded px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-slate-400 py-6 text-sm">Cargando...</p>
      ) : results.length === 0 ? (
        <p className="text-center text-slate-400 py-6 text-sm">
          No hay calificaciones registradas todavía.
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 font-bold text-slate-700 uppercase border-b">
              <tr>
                <th className="p-3">Alumno</th>
                <th className="p-3">Matrícula</th>
                <th className="p-3">Módulo</th>
                <th className="p-3 text-center">Calificación</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{r.student_name}</td>
                  <td className="p-3">{r.student_credencial}</td>
                  <td className="p-3">{r.module}</td>
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
                  <td className="p-3">{new Date(r.taken_at).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- Modules Tab ----------

function ModulesTab() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ModuleInput>({ slug: '', name: '', teacher: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchModules();
      setModules(data);
    } catch {
      setError('No se pudieron cargar los módulos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    try {
      if (editingId) {
        await updateModule(editingId, payload);
        setEditingId(null);
      } else {
        const created = await createModule(payload);
        setModules((prev) => [...prev, created]);
      }
      setForm({ slug: '', name: '', teacher: '', description: '' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el módulo.';
      setError(msg.includes('duplicate') ? 'Ya existe un módulo con ese identificador.' : msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(mod: Module) {
    setEditingId(mod.id);
    setForm({ slug: mod.slug, name: mod.name, teacher: mod.teacher, description: mod.description || '' });
  }

  async function handleToggleActive(mod: Module) {
    try {
      await updateModule(mod.id, { is_active: !mod.is_active });
      setModules((prev) => prev.map((m) => (m.id === mod.id ? { ...m, is_active: !m.is_active } : m)));
    } catch {
      setError('No se pudo actualizar el módulo.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este módulo? Las calificaciones existentes se conservarán.')) return;
    try {
      await deleteModule(id);
      setModules((prev) => prev.filter((m) => m.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm({ slug: '', name: '', teacher: '', description: '' });
      }
    } catch {
      setError('No se pudo eliminar el módulo.');
    }
  }

  return (
    <div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
        <h4 className="font-bold text-slate-800 text-sm mb-4">
          {editingId ? 'Editar Módulo' : 'Registrar Nuevo Módulo'}
        </h4>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Módulo:</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Redes de Computadoras"
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Profesor Asignado:</label>
            <input
              type="text"
              required
              value={form.teacher}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              placeholder="Ej. Ing. Roberto Martínez"
              className="w-full px-3 py-2 border rounded-lg text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Identificador (slug): <span className="text-slate-400 font-normal">(se genera automáticamente si se deja vacío)</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Ej. redes-computadoras"
              className="w-full px-3 py-2 border rounded-lg text-xs"
              disabled={!!editingId}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Descripción:</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Breve descripción del módulo..."
              className="w-full px-3 py-2 border rounded-lg text-xs h-16"
            />
          </div>
          <div className="md:col-span-2 text-right space-x-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ slug: '', name: '', teacher: '', description: '' });
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-lg"
              >
                Cancelar edición
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm disabled:opacity-60"
            >
              <i className="fa-solid fa-book-medical mr-1" />
              {submitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear Módulo'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <p className="text-rose-600 text-xs font-semibold bg-rose-50 border border-rose-200 rounded px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <h4 className="font-bold text-slate-800 text-sm mb-3">
        Módulos Registrados ({modules.length})
      </h4>
      {loading ? (
        <p className="text-center text-slate-400 py-6 text-sm">Cargando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`border rounded-xl p-4 ${
                mod.is_active ? 'border-slate-200' : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{mod.name}</h4>
                  <p className="text-xs text-slate-500">Profesor: {mod.teacher}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    mod.is_active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {mod.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              {mod.description && (
                <p className="text-xs text-slate-600 mb-3">{mod.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleEdit(mod)}
                  className="text-sky-600 hover:text-sky-800 font-bold text-xs"
                >
                  <i className="fa-solid fa-pen mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(mod)}
                  className="text-amber-600 hover:text-amber-800 font-bold text-xs"
                >
                  <i className="fa-solid fa-power-off mr-1" />
                  {mod.is_active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(mod.id)}
                  className="text-rose-600 hover:text-rose-800 font-bold text-xs ml-auto"
                >
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
