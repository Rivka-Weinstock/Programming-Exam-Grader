import React, { useState } from 'react';
import { GradingRubric, RubricCategoryConfig, RubricCategoryKey } from '../types';
import {
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Info,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { DEFAULT_RUBRIC } from '../data/defaults';

interface RubricSetupProps {
  rubric: GradingRubric;
  onSaveRubric: (rubric: GradingRubric) => void;
  onProceed: () => void;
  onBack: () => void;
}

export const RubricSetup: React.FC<RubricSetupProps> = ({
  rubric,
  onSaveRubric,
  onProceed,
  onBack
}) => {
  const [currentRubric, setCurrentRubric] = useState<GradingRubric>({ ...rubric });

  const handleCategoryChange = (key: RubricCategoryKey, updates: Partial<RubricCategoryConfig>) => {
    const updated = {
      ...currentRubric,
      categories: {
        ...currentRubric.categories,
        [key]: {
          ...currentRubric.categories[key],
          ...updates
        }
      }
    };
    setCurrentRubric(updated);
    onSaveRubric(updated);
  };

  const handleResetToDefault = () => {
    setCurrentRubric(DEFAULT_RUBRIC);
    onSaveRubric(DEFAULT_RUBRIC);
  };

  const categoriesList = Object.values(currentRubric.categories);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/20">
            <Sliders className="w-3.5 h-3.5" />
            <span>מחוון ניקוד ומדיניות הערכה</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            מחוון ניקוד ומדיניות הערכה
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            הגדר את כללי הניקוד לפני בדיקת מחברות הבחינה. מנוע ה-AI מקפיד באופן מוחלט על הקטגוריות הפעילות
            וניקודי הקנס שהגדרת, ללא המצאת עונשים שרירותיים.
          </p>
        </div>

        <button
          onClick={handleResetToDefault}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>איפוס לברירת מחדל מומלצת</span>
        </button>
      </div>

      {/* Mandatory Rubric Guarantee Banner */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/30 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white">ערבות מחוון דטרמיניסטית:</span>
          <p className="leading-relaxed text-slate-400">
            המרצה קובע את מדיניות הבדיקה. אם בחרת לבטל קטגוריה (למשל, התעלמות משגיאות תחביר בבחינות בכתב יד), ה-AI מנוע לחלוטין מלהוריד ניקוד על תחביר.
            חישוב ההורדות ותקרות הקנס מבוצע באופן דטרמיניסטי על ידי המנוע.
          </p>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="space-y-4">
        {categoriesList.map((cat) => {
          const isEnabled = cat.enabled;

          return (
            <div
              key={cat.key}
              className={`rounded-xl border transition-all p-5 ${
                isEnabled
                  ? 'bg-slate-900/80 border-slate-750 border-slate-800 shadow-md'
                  : 'bg-slate-950/50 border-slate-850 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Header info & category badge */}
                <div className="flex items-start gap-3 max-w-md">
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-base tracking-tight">{cat.name}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider dir-ltr"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                          border: `1px solid ${cat.color}40`
                        }}
                      >
                        {cat.key}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-950/60 p-3 rounded-lg border border-slate-850 border-slate-800">
                  {/* Category Active Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-300">פעיל:</label>
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(cat.key, { enabled: !cat.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        cat.enabled ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          cat.enabled ? '-translate-x-6' : '-translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-slate-400">
                      {cat.enabled ? 'כן' : 'לא'}
                    </span>
                  </div>

                  {/* Affects Grade Toggle */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-300">משפיע על הציון:</label>
                    <button
                      type="button"
                      disabled={!cat.enabled}
                      onClick={() => handleCategoryChange(cat.key, { affectsGrade: !cat.affectsGrade })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40 ${
                        cat.affectsGrade && cat.enabled ? 'bg-emerald-600' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          cat.affectsGrade && cat.enabled ? '-translate-x-6' : '-translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-slate-400">
                      {cat.affectsGrade && cat.enabled ? 'כן' : 'לא'}
                    </span>
                  </div>

                  {/* Deduction Per Error */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-slate-300">קנס לשגיאה:</label>
                    <div className="relative flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        disabled={!cat.enabled || !cat.affectsGrade}
                        value={cat.deductionPerError}
                        onChange={(e) =>
                          handleCategoryChange(cat.key, {
                            deductionPerError: Math.max(0, parseInt(e.target.value, 10) || 0)
                          })
                        }
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-center disabled:opacity-40 outline-none focus:border-indigo-500 dir-ltr"
                      />
                      <span className="text-[10px] text-slate-500">נק׳</span>
                    </div>
                  </div>

                  {/* Maximum Total Deduction Cap */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-medium text-slate-300">תקרת קנס מקסימלית:</label>
                    <div className="relative flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={200}
                        disabled={!cat.enabled || !cat.affectsGrade}
                        value={cat.maxTotalDeduction}
                        onChange={(e) =>
                          handleCategoryChange(cat.key, {
                            maxTotalDeduction: Math.max(0, parseInt(e.target.value, 10) || 0)
                          })
                        }
                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-center disabled:opacity-40 outline-none focus:border-indigo-500 dir-ltr"
                      />
                      <span className="text-[10px] text-slate-500">נק׳</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>חזרה לפרטי התרגיל</span>
        </button>

        <button
          onClick={onProceed}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition"
        >
          <span>המשך: העלאת תמונת בחינה</span>
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};
