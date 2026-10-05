import React from 'react';
import { ExamSubmission, Exercise } from '../types';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Printer,
  ArrowLeft,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface StudentReportProps {
  submission: ExamSubmission;
  exercise: Exercise;
  onBackToReview: () => void;
}

export const StudentReport: React.FC<StudentReportProps> = ({
  submission,
  exercise,
  onBackToReview
}) => {
  const { studentInfo, gradingResult, detectedErrors, codeQualitySummary, alternativeSolutionNotes } =
    submission;

  // Only errors that actually affected the grade
  const penalizedErrors = detectedErrors.filter(
    (e) => e.status !== 'ignored' && e.affectsGrade && e.deduction > 0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      {/* Action Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={onBackToReview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>חזרה לבדיקת המרצה</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>הדפס משוב לסטודנט</span>
        </button>
      </div>

      {/* Student Feedback Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Friendly Header */}
        <div className="border-b border-slate-800 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                דף משוב בחינה בתכנות
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">
                משוב אישי עבור {studentInfo.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                מטלה: <strong>{exercise.title}</strong> ({exercise.language})
              </p>
            </div>

            <div className="text-right bg-slate-950 px-5 py-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                ציון בחינה סופי
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400 dir-ltr text-right">
                {gradingResult.finalGrade}
                <span className="text-sm font-normal text-slate-500"> / {gradingResult.maxGrade}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. What was done correctly */}
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-2">
          <h2 className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>נקודות חוזק ומה שבוצע היטב</span>
          </h2>
          <p className="text-slate-300 leading-relaxed">
            {codeQualitySummary ||
              'הפגנת הבנה מעמיקה של מושגי האלגוריתמיקה המרכזיים, מבנה הפתרון והלוגיקה הנדרשת בתרגיל זה.'}
          </p>
          {alternativeSolutionNotes && (
            <p className="text-emerald-300/90 italic pt-1 border-t border-emerald-500/10">
              {alternativeSolutionNotes}
            </p>
          )}
        </div>

        {/* 2. Errors that affected the grade */}
        <div className="mb-6 space-y-3">
          <h2 className="font-bold text-white text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>סעיפים הדורשים תיקון ({penalizedErrors.length})</span>
          </h2>

          {penalizedErrors.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400">
              עבודה מצוינת! לא בוצעו כל הורדות ניקוד בפתרון שלך.
            </div>
          ) : (
            penalizedErrors.map((err, idx) => (
              <div
                key={err.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">
                    {idx + 1}. {err.description}
                  </span>
                  <span className="font-mono text-amber-400 dir-ltr">-{err.deduction} נק׳</span>
                </div>

                <p className="text-slate-400 leading-relaxed">{err.explanation}</p>

                {err.suggestedCorrection && (
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono dir-ltr text-left">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans mb-1 dir-rtl text-right">
                      מימוש מומלץ:
                    </span>
                    <pre className="text-emerald-300 text-xs leading-relaxed">
                      {err.suggestedCorrection}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 3. Suggestions for future improvement */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <h2 className="font-bold text-slate-200 flex items-center gap-2 text-sm">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>טיפים לשיפור לקראת המבחנים הבאים</span>
          </h2>
          <ul className="space-y-1.5 text-slate-400 list-disc list-inside leading-relaxed">
            <li>
              בדוק היטב אופרטורי השוואה (כגון <code className="text-slate-300">&gt;</code> לעומת{' '}
              <code className="text-slate-300">&lt;</code>) בעת מציאת ערכי קיצון או תנאי עצירה בלולאות.
            </li>
            <li>
              שים לב לאיות מילות מפתח (למשל ודא ש-<code className="text-slate-300">return</code> כתוב ללא טעויות).
            </li>
            <li>
              שמור על קוד נקי ותמציתי על ידי הימנעות ממשתני עזר מיותרים שאינם בשימוש בהמשך הפונקציה.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
