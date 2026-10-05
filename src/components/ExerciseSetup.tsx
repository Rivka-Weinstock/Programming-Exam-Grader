import React, { useState } from 'react';
import { Exercise, ProgrammingLanguage, TestCase } from '../types';
import {
  Code2,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface ExerciseSetupProps {
  exercise: Exercise;
  exercisesList: Exercise[];
  onSelectExercise: (ex: Exercise) => void;
  onSaveExercise: (ex: Exercise) => void;
  onProceed: () => void;
}

export const ExerciseSetup: React.FC<ExerciseSetupProps> = ({
  exercise,
  exercisesList,
  onSelectExercise,
  onSaveExercise,
  onProceed
}) => {
  const [formData, setFormData] = useState<Exercise>({ ...exercise });
  const [newTestCase, setNewTestCase] = useState<TestCase>({
    id: `tc_${Date.now()}`,
    input: '',
    expectedOutput: '',
    explanation: ''
  });
  const [showNewTestModal, setShowNewTestModal] = useState(false);

  React.useEffect(() => {
    setFormData({ ...exercise });
  }, [exercise]);

  const handleFieldChange = (field: keyof Exercise, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveExercise(updated);
  };

  const handleAddTestCase = () => {
    if (!newTestCase.input && !newTestCase.expectedOutput) return;
    const testCases = [...(formData.testCases || []), { ...newTestCase, id: `tc_${Date.now()}` }];
    handleFieldChange('testCases', testCases);
    setNewTestCase({ id: `tc_${Date.now()}`, input: '', expectedOutput: '', explanation: '' });
    setShowNewTestModal(false);
  };

  const handleRemoveTestCase = (id: string) => {
    const testCases = (formData.testCases || []).filter((tc) => tc.id !== id);
    handleFieldChange('testCases', testCases);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 text-xs font-semibold mb-2 border border-sky-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>הגדרת מבחן ומטלה</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            הגדרת תרגיל ומטלת בחינה
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            הגדר את דרישות השאלה, פתרון הייחוס (Reference Solution) והאלגוריתם המצופה.
            לאחר שמירת המבחן, מחוון הבדיקה ייפתח להגדרה.
          </p>
        </div>

        {/* Existing Exercise Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium whitespace-nowrap">טען תרגיל מוכן:</label>
          <select
            value={formData.id}
            onChange={(e) => {
              const selected = exercisesList.find((ex) => ex.id === e.target.value);
              if (selected) {
                setFormData({ ...selected });
                onSelectExercise(selected);
              }
            }}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {exercisesList.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.language})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-850 bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span>פרטי התרגיל והמטלה</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  כותרת התרגיל *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="למשל: מציאת ערך מקסימלי במערך"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    שפת תכנות *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleFieldChange('language', e.target.value as ProgrammingLanguage)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none dir-ltr text-right"
                  >
                    <option value="python">Python (3.x)</option>
                    <option value="cpp">C++ (17/20)</option>
                    <option value="java">Java (17+)</option>
                    <option value="javascript">JavaScript / TypeScript</option>
                    <option value="csharp">C# (.NET)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    ציון מקסימלי (ניקוד כולל) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={formData.maxGrade}
                    onChange={(e) => handleFieldChange('maxGrade', parseInt(e.target.value, 10) || 100)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  הוראות השאלה ותיאור הבעיה כפי שהופיעו במבחן *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="כתוב פונקציה המקבלת מערך ומחזירה את האיבר המקסימלי..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y"
                />
              </div>
            </div>
          </div>

          {/* Reference Solution Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>פתרון ייחוס (Reference Solution)</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 dir-ltr">
                {formData.language}
              </span>
            </div>

            {/* Crucial Rule Notice */}
            <div className="mb-3 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p>
                <strong>עקרון מרכזי:</strong> פתרון ייחוס זה <em>אינו</em> משמש להשוואת טקסט קשיחה. ה-AI בודק האם פתרון הסטודנט שקול לוגית ותקין פונקציונלית, גם אם הסטודנט השתמש בלולאות או מבני נתונים שונים.
              </p>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950">
              <div className="bg-slate-900 px-4 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="dir-ltr">Source Code ({formData.language})</span>
                <span className="dir-ltr">Tab = 4 spaces</span>
              </div>
              <textarea
                rows={8}
                value={formData.referenceSolution}
                onChange={(e) => handleFieldChange('referenceSolution', e.target.value)}
                placeholder="def solve(...):"
                className="w-full bg-slate-950 p-4 font-mono text-sm text-emerald-300 focus:outline-none resize-y leading-relaxed dir-ltr text-left"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Expected Algorithm & Test Cases */}
        <div className="space-y-6">
          {/* Expected Algorithm */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>הנחיות אלגוריתמיות מצופות (רשות)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              עזור ל-AI להבין אילוצי יעילות או אלגוריתם (למשל מעבר יחיד O(N), איסור רקורסיה וכו׳).
            </p>
            <textarea
              rows={4}
              value={formData.expectedAlgorithmExplanation || ''}
              onChange={(e) => handleFieldChange('expectedAlgorithmExplanation', e.target.value)}
              placeholder="למשל: אתחול משתנה מקסימום באיבר הראשון. מעבר בלולאה בודדת ועדכון אם האיבר הנוכחי גדול יותר..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-indigo-500 outline-none leading-relaxed"
            />
          </div>

          {/* Test Cases */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">מקרי בדיקה (Test Cases)</h3>
                <p className="text-xs text-slate-400">משמשים לסימולציה מחשבתית בזמן ניתוח הקוד.</p>
              </div>
              <button
                onClick={() => setShowNewTestModal(!showNewTestModal)}
                className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>הוסף</span>
              </button>
            </div>

            {/* Test Cases List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pl-1">
              {(formData.testCases || []).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                  לא הוגדרו עדיין מקרי בדיקה מותאמים.
                </div>
              ) : (
                formData.testCases?.map((tc, idx) => (
                  <div
                    key={tc.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">מקרה #{idx + 1}</span>
                      <button
                        onClick={() => handleRemoveTestCase(tc.id)}
                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-mono text-slate-400 dir-ltr text-right">
                      <span className="text-slate-500">In:</span> {tc.input}
                    </div>
                    <div className="font-mono text-emerald-400 dir-ltr text-right">
                      <span className="text-slate-500">Out:</span> {tc.expectedOutput}
                    </div>
                    {tc.explanation && (
                      <p className="text-[11px] text-slate-500 italic">{tc.explanation}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Inline Add Test Case Drawer */}
            {showNewTestModal && (
              <div className="mt-3 p-3 bg-slate-950 border border-indigo-500/30 rounded-lg space-y-2">
                <input
                  type="text"
                  placeholder="קלט (למשל: [1, 99, 4])"
                  value={newTestCase.input}
                  onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white dir-ltr text-right"
                />
                <input
                  type="text"
                  placeholder="פלט מצופה (למשל: 99)"
                  value={newTestCase.expectedOutput}
                  onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white dir-ltr text-right"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowNewTestModal(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleAddTestCase}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded"
                  >
                    שמור מקרה בדיקה
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>התרגיל מוכן למעבר להגדרת מחוון הניקוד</span>
        </div>

        <button
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition"
        >
          <span>המשך: הגדרת מחוון ניקוד</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};
