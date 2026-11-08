import { useState, useEffect } from 'react';
import type { Screen, Student, Module } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { StudentLoginScreen } from './components/StudentLoginScreen';
import { StudentPortal } from './components/StudentPortal';
import { ModuleDetailScreen } from './components/ModuleDetailScreen';
import { ExamForm } from './components/ExamForm';
import { ExamResultScreen } from './components/ExamResultScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import type { GradingResult } from './lib/examData';
import { getCurrentStudent, signOutStudent } from './lib/api';

type ExamPhase = 'questions' | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [examPhase, setExamPhase] = useState<ExamPhase>('questions');
  const [examResult, setExamResult] = useState<GradingResult | null>(null);

  // Restore session on load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const student = await getCurrentStudent();
        if (active && student) {
          setCurrentStudent(student);
          setScreen('student-portal');
        }
      } catch {
        // ignore — no active session
      } finally {
        if (active) setAuthChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function navigateTo(target: Screen) {
    setScreen(target);
    if (target !== 'exam') {
      setExamPhase('questions');
      setExamResult(null);
    }
  }

  function handleStudentLogin(student: Student) {
    setCurrentStudent(student);
    navigateTo('student-portal');
  }

  async function handleStudentLogout() {
    await signOutStudent();
    setCurrentStudent(null);
    setSelectedModule(null);
    navigateTo('welcome');
  }

  function handleOpenModule(mod: Module) {
    setSelectedModule(mod);
    navigateTo('module-detail');
  }

  function startExam() {
    setExamPhase('questions');
    setExamResult(null);
    navigateTo('exam');
  }

  function handleExamCompleted(result: GradingResult) {
    setExamResult(result);
    setExamPhase('result');
  }

  function backToPortal() {
    setExamPhase('questions');
    setExamResult(null);
    setSelectedModule(null);
    navigateTo('student-portal');
  }

  if (!authChecked) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">
          <i className="fa-solid fa-circle-notch fa-spin mr-2" />
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <Header
        onNavigate={navigateTo}
        studentName={currentStudent?.name ?? null}
        onLogout={handleStudentLogout}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
      />

      <div className="relative flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          current={screen}
          hasStudent={!!currentStudent}
          studentName={currentStudent?.name ?? null}
          onNavigate={navigateTo}
          onClose={() => setSidebarOpen(false)}
          onOpenTeacherLogin={() => {
            setSidebarOpen(false);
            setTeacherModalOpen(true);
          }}
        />

        <main className="w-full h-full overflow-y-auto bg-slate-50 p-4 sm:p-6 flex flex-col items-center justify-start">
          {screen === 'welcome' && (
            <WelcomeScreen onGoToStudentLogin={() => navigateTo('student-login')} />
          )}

          {screen === 'student-login' && (
            <StudentLoginScreen
              onLogin={handleStudentLogin}
              onBack={() => navigateTo('welcome')}
            />
          )}

          {screen === 'student-portal' && currentStudent && (
            <StudentPortal
              student={currentStudent}
              onLogout={handleStudentLogout}
              onOpenModule={handleOpenModule}
            />
          )}

          {screen === 'module-detail' && selectedModule && (
            <ModuleDetailScreen
              module={selectedModule}
              onStart={startExam}
              onBack={() => {
                setSelectedModule(null);
                if (currentStudent) {
                  navigateTo('student-portal');
                } else {
                  navigateTo('welcome');
                }
              }}
            />
          )}

          {screen === 'exam' && selectedModule && currentStudent && (
            <section className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              {examPhase === 'questions' && (
                <ExamForm
                  module={selectedModule}
                  student={currentStudent}
                  shift={currentStudent.shift}
                  onCompleted={handleExamCompleted}
                />
              )}
              {examPhase === 'result' && examResult && (
                <ExamResultScreen
                  result={examResult}
                  student={currentStudent}
                  shift={currentStudent.shift}
                  onRestart={backToPortal}
                />
              )}
            </section>
          )}

          {screen === 'teacher-dashboard' && (
            <TeacherDashboard onExit={() => navigateTo('welcome')} />
          )}
        </main>
      </div>

      {teacherModalOpen && (
        <TeacherLoginModal
          onSuccess={() => {
            setTeacherModalOpen(false);
            navigateTo('teacher-dashboard');
          }}
          onClose={() => setTeacherModalOpen(false)}
        />
      )}
    </div>
  );
}
