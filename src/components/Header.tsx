import React from 'react';
import {
  GraduationCap,
  Sliders,
  FileCheck,
  FileText,
  Settings,
  Home,
  FileCode,
  Lock
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'exercise' | 'rubric' | 'grade' | 'reports' | 'all_exams';
  onSelectTab: (tab: 'dashboard' | 'exercise' | 'rubric' | 'grade' | 'reports' | 'all_exams') => void;
  onGoHome: () => void;
  isExamActive: boolean;
  activeExamTitle?: string;
  isRubricUnlocked: boolean;
  hasSubmissionForReports: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onGoHome,
  isExamActive,
  activeExamTitle,
  isRubricUnlocked,
  hasSubmissionForReports,
  onOpenSettings
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Clicking takes the user to the home page */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={onGoHome}
            title="חזרה לדף הבית"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-200 transition">
                  בודק מבחני תכנות
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  EasyOCR + Gemini
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">בדיקת מבחני קוד בכתב יד וציינון דטרמיניסטי</p>
            </div>
          </div>

          {/* Exam Context Specific Navigation or All Exams view */}
          {currentTab === 'all_exams' ? (
            <nav className="flex items-center gap-2 overflow-x-auto py-1">
              <button
                onClick={onGoHome}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-450 text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 shrink-0"
                title="חזרה לדף הבית"
              >
                <Home className="w-3.5 h-3.5" />
                <span>דף הבית</span>
              </button>
              <div className="h-4 w-px bg-slate-800 shrink-0" />
              <span className="text-xs text-sky-300 font-semibold px-2.5 py-1 bg-sky-500/10 rounded-lg border border-sky-500/20 shrink-0">
                כל המבחנים הקודמים
              </span>
            </nav>
          ) : isExamActive ? (
            <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
              {/* Return to Home link */}
              <button
                onClick={onGoHome}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 shrink-0"
                title="חזרה לדף הבית"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">דף הבית</span>
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1 shrink-0" />

              {/* 1. Exam Setup */}
              <button
                onClick={() => onSelectTab('exercise')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                  currentTab === 'exercise'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>הגדרת מבחן</span>
              </button>

              {/* 2. Grading Rubric (Unlocked only after exam is defined) */}
              {isRubricUnlocked ? (
                <button
                  onClick={() => onSelectTab('rubric')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                    currentTab === 'rubric'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>מחוון בדיקה</span>
                </button>
              ) : (
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 text-slate-600 cursor-not-allowed bg-slate-900/40 border border-slate-800/40 shrink-0"
                  title="מחוון הבדיקה יהיה זמין לאחר הגדרת המבחן"
                >
                  <Lock className="w-3 h-3 text-slate-600" />
                  <span>מחוון בדיקה (נעול)</span>
                </div>
              )}

              {/* 3. Grading Process (Upload / OCR / Review) */}
              <button
                onClick={() => onSelectTab('grade')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                  currentTab === 'grade'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-indigo-300" />
                <span>בדיקת מבחן</span>
              </button>

              {/* 4. Reports & Feedback */}
              {hasSubmissionForReports ? (
                <button
                  onClick={() => onSelectTab('reports')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                    currentTab === 'reports'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>דוחות ומשוב</span>
                </button>
              ) : (
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 text-slate-600 cursor-not-allowed bg-slate-900/40 border border-slate-800/40 shrink-0"
                  title="דוחות ומשוב יהיו זמינים לאחר בדיקת מחברת מבחן"
                >
                  <FileText className="w-3 h-3 text-slate-600" />
                  <span>דוחות ומשוב</span>
                </div>
              )}
            </nav>
          ) : (
            /* Home Page state: Navigation is empty, clean header */
            <div />
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
              title="הגדרות ומצב שירות EasyOCR"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
