import React, { useState } from 'react';
import { Exercise, ExamSubmission, ProgrammingLanguage } from '../types';
import {
  ArrowRight,
  PlusCircle,
  Search,
  Code2,
  Calendar,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Sliders,
  Clock,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';

interface AllExamsScreenProps {
  exercises: Exercise[];
  submissions: ExamSubmission[];
  onNewExam: () => void;
  onSelectExamToGrade: (exerciseId: string) => void;
  onEditExam: (exerciseId: string) => void;
  onOpenSubmission: (submission: ExamSubmission) => void;
  onViewSubmissionReport: (submission: ExamSubmission, type: 'teacher' | 'student') => void;
  onGoHome: () => void;
}

export const AllExamsScreen: React.FC<AllExamsScreenProps> = ({
  exercises,
  submissions,
  onNewExam,
  onSelectExamToGrade,
  onEditExam,
  onOpenSubmission,
  onViewSubmissionReport,
  onGoHome
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [expandedExamIds, setExpandedExamIds] = useState<Record<string, boolean>>({});

  const toggleExpandExam = (examId: string) => {
    setExpandedExamIds((prev) => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };

  // Filter exercises by search and language
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.language.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      selectedLanguage === 'all' ||
      ex.language.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLanguage;
  });

  // Unique languages in existing exercises
  const availableLanguages = Array.from(new Set(exercises.map((e) => e.language)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Navigation Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <button
              onClick={onGoHome}
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>דף הבית</span>
            </button>
            <span>/</span>
            <span className="text-slate-200 font-semibold">כל המבחנים הקודמים</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ארכיון וניהול כל המבחנים הקודמים
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            ריכוז מסודר של כל שאלוני הבחינה שהוגדרו במערכת, מחברות הסטודנטים שנבדקו עבור כל מבחן, דוחות ציונים והרצת בדיקות חדשות.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onGoHome}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            חזרה לדף הבית
          </button>
          <button
            onClick={onNewExam}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>הגדרת מבחן חדש</span>
          </button>
        </div>
      </div>

      {/* Filters Bar: Search Input & Language Selector */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם מבחן או נושא..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium shrink-0">סינון שפה:</span>
          <button
            onClick={() => setSelectedLanguage('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedLanguage === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            הכל ({exercises.length})
          </button>
          {availableLanguages.map((lang) => {
            const count = exercises.filter((e) => e.language === lang).length;
            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase transition shrink-0 ${
                  selectedLanguage === lang
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {lang} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured Exams List */}
      {filteredExercises.length === 0 ? (
        <div className="p-12 bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Code2 className="w-6 h-6" />
          </div>
          <div className="text-white font-semibold text-sm">לא נמצאו מבחנים התואמים לחיפוש</div>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            נסו לשנות את מילות החיפוש או הגדירו מבחן חדש באמצעות הכפתור למעלה.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExercises.map((exam, index) => {
            // Find all graded submissions for this exam
            const examSubmissions = submissions.filter((s) => s.exerciseId === exam.id);
            const isExpanded = expandedExamIds[exam.id] ?? true; // expanded by default

            // Calculate average score if submissions exist
            const avgGrade =
              examSubmissions.length > 0
                ? Math.round(
                    examSubmissions.reduce((acc, curr) => acc + curr.gradingResult.finalGrade, 0) /
                      examSubmissions.length
                  )
                : null;

            return (
              <div
                key={exam.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl transition overflow-hidden shadow-sm"
              >
                {/* Exam Main Summary Header Card */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold font-mono">
                        {index + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {exam.title || 'מבחן ללא כותרת'}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] uppercase font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 dir-ltr">
                        {exam.language}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        ציון מרבי: {exam.maxGrade} נק׳
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed max-w-3xl line-clamp-2">
                      {exam.description || 'אין תיאור מוגדר לשאלה.'}
                    </p>

                    {/* Stats pills */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{examSubmissions.length} מחברות שנבדקו</span>
                      </span>
                      {avgGrade !== null && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold font-mono">
                            ממוצע: {avgGrade} נק׳
                          </span>
                        </span>
                      )}
                      {exam.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>נוצר: {new Date(exam.createdAt).toLocaleDateString('he-IL')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => onEditExam(exam.id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                      title="ערוך את הגדרת השאלה והמחוון"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>הגדרות ומחוון</span>
                    </button>

                    <button
                      onClick={() => onSelectExamToGrade(exam.id)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>בדוק מחברת למבחן זה</span>
                    </button>

                    <button
                      onClick={() => toggleExpandExam(exam.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition"
                      title={isExpanded ? 'צמצם רשימת מחברות' : 'הצג מחברות שנבדקו'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Submissions Table for this Exam */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-950/40 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>מחברות שנבדקו עבור מבחן זה ({examSubmissions.length})</span>
                      {examSubmissions.length > 0 && (
                        <span className="text-[11px] text-slate-500">לחצו לצפייה בבדיקה המלאה או בדוחות</span>
                      )}
                    </div>

                    {examSubmissions.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/40">
                        טרם נבדקו מחברות עבור מבחן זה.{' '}
                        <button
                          onClick={() => onSelectExamToGrade(exam.id)}
                          className="text-indigo-400 hover:underline font-semibold"
                        >
                          לחצו כאן לבדיקת מחברת ראשונה
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {examSubmissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                                <Award className="w-4 h-4 text-indigo-400" />
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-white block truncate">
                                  {sub.studentInfo.name || 'סטודנט ללא שם'}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono block truncate dir-ltr text-right">
                                  {sub.studentInfo.email || 'ללא מייל'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="px-2.5 py-1 rounded-lg bg-slate-950 font-mono font-bold text-emerald-400 border border-slate-800 dir-ltr">
                                {sub.gradingResult.finalGrade}/{sub.gradingResult.maxGrade}
                              </div>

                              <button
                                onClick={() => onOpenSubmission(sub)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                                title="פתח את מסך הבדיקה של המחברת"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onViewSubmissionReport(sub, 'teacher')}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition"
                              >
                                דוח
                              </button>
                              <button
                                onClick={() => onViewSubmissionReport(sub, 'student')}
                                className="px-2 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 transition"
                              >
                                משוב
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
