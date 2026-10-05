import React from 'react';
import { Exercise, ExamSubmission } from '../types';
import {
  FileCheck,
  ArrowRight,
  Award,
  PlusCircle,
  Clock,
  ChevronLeft,
  FolderArchive
} from 'lucide-react';

interface DashboardProps {
  recentSubmissions: ExamSubmission[];
  exercises: Exercise[];
  onNewExam: () => void;
  onViewAllExams: () => void;
  onOpenSubmission: (submission: ExamSubmission) => void;
  onViewSubmissionReport: (submission: ExamSubmission, type: 'teacher' | 'student') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  recentSubmissions,
  exercises,
  onNewExam,
  onViewAllExams,
  onOpenSubmission,
  onViewSubmissionReport
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            סביבת בדיקת מבחני תכנות בכתב יד
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            חילוץ קוביות תווים באמצעות EasyOCR, ניתוח לוגי ותחבירי בעזרת Gemini, ציינון דטרמיניסטי לפי מחוון מוגדר מראש, ודוחות משוב פדגוגיים לסטודנט.
          </p>
        </div>

        {/* Action buttons: All previous exams & New exam */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onViewAllExams}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <FolderArchive className="w-4 h-4 text-sky-400" />
            <span>לכל המבחנים הקודמים</span>
          </button>

          <button
            onClick={onNewExam}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>הגדרת מבחן חדש</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>

      {/* Recent Submissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-400" />
            <span>מבחנים שנבדקו לאחרונה</span>
          </h2>
          <button
            onClick={onViewAllExams}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
          >
            <span>לכל המבחנים הקודמים ({exercises.length})</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="p-10 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="text-white font-semibold text-sm">עדיין לא נבדקו מבחנים</div>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              הגדירו מבחן חדש ולאחר מכן העלו סריקה של פתרון סטודנט בכתב יד לצורך פענוח EasyOCR וציינון מחוון מלא.
            </p>
            <button
              onClick={onNewExam}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>הגדרת מבחן חדש</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSubmissions.map((sub) => {
              const ex = exercises.find((e) => e.id === sub.exerciseId);

              return (
                <div
                  key={sub.id}
                  className="p-4 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                      <Award className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{sub.studentInfo.name || 'סטודנט ללא שם'}</h4>
                      <p className="text-xs text-slate-400 font-mono dir-ltr text-right">
                        {sub.studentInfo.email || 'אין כתובת מייל'}
                      </p>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>{ex?.title || 'מבחן תכנות'}</span>
                        <span>·</span>
                        <span className="font-mono text-emerald-400 font-semibold dir-ltr">
                          {sub.gradingResult.finalGrade} / {sub.gradingResult.maxGrade} נק׳
                        </span>
                        {sub.updatedAt && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              {new Date(sub.updatedAt).toLocaleDateString('he-IL')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenSubmission(sub)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                      title="צפה ובדוק את מחברת המבחן"
                    >
                      <span>פתח בדיקה</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onViewSubmissionReport(sub, 'teacher')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                    >
                      דוח מרצה
                    </button>
                    <button
                      onClick={() => onViewSubmissionReport(sub, 'student')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition"
                    >
                      משוב סטודנט
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
