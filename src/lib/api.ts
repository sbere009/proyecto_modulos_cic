import { supabase } from './supabase';
import type {
  Student,
  StudentInput,
  Module,
  ModuleInput,
  ExamResult,
  ExamResultWithStudent,
  ExamResultWithModule,
} from '../types';

// ---------- Auth ----------

// Synthetic email domain for student accounts (Supabase Auth requires an email)
const STUDENT_EMAIL_DOMAIN = 'alumno.cic.edu';

function usernameToEmail(username: string): string {
  const clean = username.toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return `${clean}@${STUDENT_EMAIL_DOMAIN}`;
}

function numericCode(value: string): string {
  let hash = 0;
  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return String(hash % 100000000).padStart(8, '0');
}

export function generateStudentUsername(name: string, credencial: string): string {
  const digits = credencial.replace(/\D/g, '');
  return digits.length === 8 ? digits : numericCode(`${name}-${credencial}`);
}

export function generateTemporaryPassword(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % 10000).padStart(4, '0');
}

export async function signInStudent(username: string, password: string): Promise<Student> {
  const email = usernameToEmail(username);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (authError) throw authError;

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('auth_user_id', authData.user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se encontró el perfil del alumno.');
  return data as Student;
}

export async function signOutStudent(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentStudent(): Promise<Student | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return null;

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('auth_user_id', sessionData.session.user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as Student) ?? null;
}

// ---------- Students (admin) ----------

export async function fetchStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as Student[];
}

export async function createStudentAccount(input: StudentInput): Promise<Student> {
  const email = usernameToEmail(input.username);

  // Create the auth user via admin API
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: input.password,
  });
  if (authError) throw authError;
  if (!authData.user) throw new Error('No se pudo crear la cuenta de acceso.');

  // Insert the roster row linked to the auth user
  const { data, error } = await supabase
    .from('students')
    .insert({
      name: input.name,
      credencial: input.credencial,
      shift: input.shift,
      username: input.username,
      auth_user_id: authData.user.id,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Student;
}

export async function deleteStudent(id: string): Promise<void> {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

export async function findStudentByCredencial(credencial: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('credencial', credencial)
    .maybeSingle();
  if (error) throw error;
  return (data as Student) ?? null;
}

// ---------- Modules ----------

export async function fetchModules(activeOnly = false): Promise<Module[]> {
  let query = supabase.from('modules').select('*').order('created_at', { ascending: true });
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Module[];
}

export async function fetchModuleBySlug(slug: string): Promise<Module | null> {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Module) ?? null;
}

export async function createModule(input: ModuleInput): Promise<Module> {
  const { data, error } = await supabase
    .from('modules')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Module;
}

export async function updateModule(id: string, input: Partial<ModuleInput> & { is_active?: boolean }): Promise<void> {
  const { error } = await supabase.from('modules').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteModule(id: string): Promise<void> {
  const { error } = await supabase.from('modules').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Exam Results ----------

export async function saveExamResult(
  studentId: string,
  moduleId: string,
  moduleName: string,
  score: number,
  answers: Record<string, string>
): Promise<ExamResult> {
  const { data, error } = await supabase
    .from('exam_results')
    .insert({ student_id: studentId, module_id: moduleId, module: moduleName, score, answers })
    .select()
    .single();
  if (error) throw error;
  return data as ExamResult;
}

export async function hasExamAttempt(studentId: string, moduleId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('exam_results')
    .select('id')
    .eq('student_id', studentId)
    .eq('module_id', moduleId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function fetchExamResultsByStudent(studentId: string): Promise<ExamResultWithModule[]> {
  const { data, error } = await supabase
    .from('exam_results')
    .select('*, modules!left(name)')
    .eq('student_id', studentId)
    .order('taken_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    module_name: row.modules?.name,
  })) as ExamResultWithModule[];
}

export async function fetchAllExamResults(): Promise<ExamResultWithStudent[]> {
  const { data, error } = await supabase
    .from('exam_results')
    .select('*, students!inner(name, credencial)')
    .order('taken_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    student_name: row.students?.name,
    student_credencial: row.students?.credencial,
  })) as ExamResultWithStudent[];
}

export async function fetchExamResultsByModule(moduleId: string): Promise<ExamResultWithStudent[]> {
  const { data, error } = await supabase
    .from('exam_results')
    .select('*, students!inner(name, credencial)')
    .eq('module_id', moduleId)
    .order('taken_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    ...row,
    student_name: row.students?.name,
    student_credencial: row.students?.credencial,
  })) as ExamResultWithStudent[];
}
