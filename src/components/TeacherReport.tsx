import React from 'react';
import { ExamSubmission, Exercise } from '../types';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  Calendar,
  Building,
  User,
  Mail,
  ArrowLeft
} from 'lucide-react';

interface TeacherReportProps {
  submission: ExamSubmission;
  exercise: Exercise;
  onBackToReview: () => void;
}

export const TeacherReport: React.FC<TeacherReportProps> = ({
  submission,
  exercise,
  onBackToReview
}) => {
  const { studentInfo, gradingResult, detectedErrors, rubric, ocrUncertainties } = submission;

  const acceptedErrors = detectedErrors.filter((e) => e.status !== 'ignored');
  const ignoredErrors = detectedErrors.filter((e) => e.status === 'ignored');
  const manualErrors = detectedErrors.filter((e) => e.origin === 'lecturer_manually_added');
  const modifiedErrors = detectedErrors.filter((e) => e.origin === 'lecturer_modified');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      {/* Top Header Actions (Hidden in Print) */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={onBackToReview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>חזרה לבדיקת המרצה</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>הדפס דוח מרצה רשמי</span>
          </button>
        </div>
      </div>

      {/* Official Teacher Grading Document */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Department Header */}
        <div className="border-b border-slate-800 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                דוח הערכה והערות מחלקתי רשמי
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">
                דוח בדיקת מרצה וביקורת הערכה
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                בחינת תכנות בכתב יד • הערכה ממוחשבת EasyOCR &amp; AI
              </p>
            </div>

            {/* Final Grade Stamp */}
            <div className="text-right bg-slate-950 px-5 py-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                ציון סופי
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400 dir-ltr text-right">
                {gradingResult.finalGrade}
                <span className="text-sm font-normal text-slate-500"> / {gradingResult.maxGrade}</span>
              </div>
            </div>
          </div>

          {/* Student & Exam Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">שם הסטודנט/ית:</span>
              <span className="font-semibold text-white">{studentInfo.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">דוא״ל:</span>
              <span className="font-mono text-slate-300 dir-ltr text-right">{studentInfo.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">מטלה / תרגיל:</span>
              <span className="font-medium text-white">{exercise.title}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">שפת תכנות:</span>
              <span className="font-mono uppercase text-sky-400 font-semibold dir-ltr text-right">{exercise.language}</span>
            </div>
          </div>
        </div>

        {/* Section 1: Summary Table of Detected Errors */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span>פירוט מחוון הערכה והורדות ניקוד</span>
          </h2>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 text-right">סוג שגיאה במחוון</th>
                  <th className="py-2.5 px-4 text-center">סטטוס</th>
                  <th className="py-2.5 px-4 text-center">כמות</th>
                  <th className="py-2.5 px-4 text-center">קנס לשגיאה</th>
                  <th className="py-2.5 px-4 text-center">תקרת קנס (Cap)</th>
                  <th className="py-2.5 px-4 text-left">סך הורדה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {gradingResult.categoryBreakdown.map((cat) => {
                  return (
                    <tr key={cat.category} className="hover:bg-slate-850/40">
                      <td className="py-2.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.categoryName}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center font-sans text-[11px]">
                        {cat.affectsGrade ? (
                          <span className="text-emerald-400">פעיל</span>
                        ) : (
                          <span className="text-slate-500">נמחל</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-300">{cat.errorCount}</td>
                      <td className="py-2.5 px-4 text-center text-slate-400 dir-ltr">
                        -{rubric.categories[cat.category]?.deductionPerError || 0} נק׳
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-500 dir-ltr">
                        {cat.maxCap === Infinity ? 'ללא תקרת קנס' : `עד -${cat.maxCap} נק׳`}
                      </td>
                      <td className="py-2.5 px-4 text-left font-bold text-amber-400 dir-ltr">
                        {cat.cappedDeductions > 0 ? `-${cat.cappedDeductions} נק׳` : '0 נק׳'}
                        {cat.maxCapReached && (
                          <span className="text-[10px] text-slate-500 mr-1 font-normal">(הגיעה לתקרה)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-950 font-bold border-t border-slate-800 text-xs">
                <tr>
                  <td colSpan={5} className="py-3 px-4 text-right font-sans uppercase text-slate-400">
                    סך כל ההורדות המחושבות:
                  </td>
                  <td className="py-3 px-4 text-left font-mono text-red-400 dir-ltr">
                    -{gradingResult.totalDeductions} נק׳
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Section 2: Detailed Explanations for Accepted Errors */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span>ניתוח שגיאות פעילות והורדות ניקוד ({acceptedErrors.length})</span>
          </h2>

          <div className="space-y-3">
            {acceptedErrors.length === 0 ? (
              <p className="text-xs text-slate-400 italic">אין שגיאות הגוררות הורדת ניקוד בבחינה זו.</p>
            ) : (
              acceptedErrors.map((err, idx) => (
                <div
                  key={err.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="text-slate-500">#{idx + 1}</span>
                      <span>{err.description}</span>
                    </span>
                    <span className="font-mono font-bold text-red-400 dir-ltr">-{err.deduction} נק׳</span>
                  </div>

                  <p className="text-slate-400 leading-relaxed">{err.explanation}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    {err.location.codeSnippet && (
                      <div className="p-2 bg-slate-900 rounded border border-slate-850 dir-ltr text-left">
                        <span className="text-slate-500 block text-[10px] font-sans dir-rtl text-right">
                          קוד שזוהה בשורה {err.location.line}:
                        </span>
                        <span className="text-red-300">{err.location.codeSnippet}</span>
                      </div>
                    )}
                    {err.expectedBehavior && (
                      <div className="p-2 bg-slate-900 rounded border border-slate-850">
                        <span className="text-slate-500 block text-[10px] font-sans">התנהגות מצופה:</span>
                        <span className="text-emerald-300">{err.expectedBehavior}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>
                      רמת ודאות AI:{' '}
                      <strong className="text-slate-400 dir-ltr">{Math.round(err.confidence * 100)}%</strong>
                    </span>
                    <span>
                      מקור:{' '}
                      <strong className="text-slate-400">
                        {err.origin === 'ai_detected'
                          ? 'זוהה ע״י AI'
                          : err.origin === 'lecturer_manually_added'
                          ? 'הוסף ידנית ע״י המרצה'
                          : 'עודכן ע״י המרצה'}
                      </strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 3: Lecturer Modifications, Ignored & Manually Added Errors */}
        <div className="mb-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">שינויי מרצה, סעיפים שנמחלו וסעיפים ידניים</h3>
            {ignoredErrors.length === 0 && manualErrors.length === 0 ? (
              <p className="text-slate-500 italic">לא נרשמו שינויים ידניים או מחילות בבחינה זו.</p>
            ) : (
              <ul className="space-y-1.5 text-slate-400">
                {ignoredErrors.map((ign) => (
                  <li key={ign.id} className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span>
                    <span>
                      <strong>נמחל:</strong> {ign.description} (בוטלה הורדה מקורית של -{ign.deduction} נק׳)
                    </span>
                  </li>
                ))}
                {manualErrors.map((man) => (
                  <li key={man.id} className="flex items-start gap-1.5">
                    <span className="text-indigo-400">•</span>
                    <span>
                      <strong>הוסף ידנית:</strong> {man.description} (-{man.deduction} נק׳)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 mb-2">אי-ודאויות OCR והערות זיהוי כתב יד</h3>
            {ocrUncertainties && ocrUncertainties.length > 0 ? (
              <ul className="space-y-1 text-slate-400">
                {ocrUncertainties.map((u, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400">⚠</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">כל התווים בכתב היד זוהו ברמת ודאות גבוהה.</p>
            )}
          </div>
        </div>

        {/* Section 4: Sign-off block */}
        <div className="pt-8 border-t border-slate-800 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p>מנוע הערכה: EasyOCR + Gemini 3.8 Flash</p>
            <p>תאריך הפקה: {new Date().toLocaleDateString('he-IL')} {new Date().toLocaleTimeString('he-IL')}</p>
          </div>

          <div className="text-left border-t border-slate-700 pt-2 w-48">
            <span className="text-[11px] block text-slate-400">חתימת ואישור המרצה / בודק</span>
          </div>
        </div>
      </div>
    </div>
  );
};
