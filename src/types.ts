export type Shift =
  | 'Matutino Sábado'
  | 'Matutino Domingo'
  | 'Vespertino Sábado'
  | 'Vespertino Domingo';

export const SHIFTS: Shift[] = [
  'Matutino Sábado',
  'Matutino Domingo',
  'Vespertino Sábado',
  'Vespertino Domingo',
];

export interface Student {
  id: string;
  name: string;
  credencial: string;
  shift: Shift;
  username: string | null;
  auth_user_id: string | null;
  created_at?: string;
}

export interface StudentInput {
  name: string;
  credencial: string;
  shift: Shift;
  username: string;
  password: string;
}

export interface Module {
  id: string;
  slug: string;
  name: string;
  teacher: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface ModuleInput {
  slug: string;
  name: string;
  teacher: string;
  description?: string;
}

export interface ExamResult {
  id: string;
  student_id: string;
  module_id: string | null;
  module: string;
  score: number;
  answers: Record<string, string>;
  taken_at: string;
}

export interface ExamResultWithStudent extends ExamResult {
  student_name?: string;
  student_credencial?: string;
}

export interface ExamResultWithModule extends ExamResult {
  module_name?: string;
}

export type Screen =
  | 'welcome'
  | 'student-login'
  | 'student-portal'
  | 'module-detail'
  | 'exam'
  | 'teacher-dashboard';
