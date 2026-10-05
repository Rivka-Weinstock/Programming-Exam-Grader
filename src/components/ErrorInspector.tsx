import React, { useState } from 'react';
import {
  DetectedError,
  GradingRubric,
  RubricCategoryKey,
  OCRToken
} from '../types';
import {
  AlertTriangle,
  CheckCircle,
  EyeOff,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  Shield,
  HelpCircle,
  Info,
  Check,
  X
} from 'lucide-react';
import { COLOR_MAP } from '../data/defaults';

interface ErrorInspectorProps {
  errors: DetectedError[];
  selectedErrorId: string | null;
  rubric: GradingRubric;
  tokens: OCRToken[];
  onSelectError: (id: string) => void;
  onAcceptError: (id: string) => void;
  onIgnoreError: (id: string) => void;
  onUpdateError: (updatedError: DetectedError) => void;
  onDeleteError: (id: string) => void;
  onAddNewManualError: (newError: Partial<DetectedError>) => void;
}

export const ErrorInspector: React.FC<ErrorInspectorProps> = ({
  errors,
  selectedErrorId,
  rubric,
  tokens,
  onSelectError,
  onAcceptError,
  onIgnoreError,
  onUpdateError,
  onDeleteError,
  onAddNewManualError
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Editing form state
  const selectedError = errors.find((e) => e.id === selectedErrorId) || errors[0];
  const [editFormData, setEditFormData] = useState<DetectedError | null>(null);

  // New manual error state
  const [newManualCategory, setNewManualCategory] = useState<RubricCategoryKey>('logical');
  const [newManualLine, setNewManualLine] = useState<number>(1);
  const [newManualDeduction, setNewManualDeduction] = useState<number>(10);
  const [newManualDescription, setNewManualDescription] = useState<string>('');
  const [newManualExplanation, setNewManualExplanation] = useState<string>('');

  const startEditing = () => {
    if (!selectedError) return;
    setEditFormData({ ...selectedError });
    setIsEditing(true);
  };

  const saveEditing = () => {
    if (!editFormData) return;
    onUpdateError({
      ...editFormData,
      origin: 'lecturer_modified'
    });
    setIsEditing(false);
    setEditFormData(null);
  };

  const handleCreateManualError = () => {
    if (!newManualDescription.trim()) return;

    onAddNewManualError({
      type: newManualCategory,
      severity: 'medium',
      description: newManualDescription,
      explanation: newManualExplanation || newManualDescription,
      location: {
        line: newManualLine,
        tokenIds: [],
        boundingBoxes: []
      },
      confidence: 1.0,
      affectsGrade: true,
      deduction: newManualDeduction,
      origin: 'lecturer_manually_added',
      status: 'accepted',
      expectedBehavior: 'Lecturer specified correction'
    });

    setShowAddModal(false);
    setNewManualDescription('');
    setNewManualExplanation('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-sm px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-white">סעיפי בדיקה ושגיאות</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
            {errors.length}
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>הוסף שגיאה ידנית</span>
        </button>
      </div>

      {/* Issues List Pills */}
      <div className="bg-slate-900/40 p-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {errors.map((err, idx) => {
          const isSelected = err.id === (selectedError?.id);
          const isIgnored = err.status === 'ignored';

          const typeLabelMap: Record<string, string> = {
            logical: 'לוגית',
            spelling: 'איות',
            redundant: 'קוד מיותר',
            syntax: 'תחביר',
            incomplete: 'חסר',
            efficiency: 'יעילות',
            other: 'אחר'
          };

          return (
            <button
              key={err.id}
              onClick={() => {
                onSelectError(err.id);
                setIsEditing(false);
              }}
              style={{
                borderColor: isSelected ? '#6366f1' : 'transparent',
                backgroundColor: isSelected
                  ? 'rgba(99, 102, 241, 0.2)'
                  : isIgnored
                  ? 'rgba(51, 65, 85, 0.3)'
                  : 'rgba(30, 41, 59, 0.6)'
              }}
              className={`px-2.5 py-1 rounded-lg border text-right flex items-center gap-1.5 whitespace-nowrap transition ${
                isIgnored ? 'opacity-60 line-through text-slate-500' : 'text-slate-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    err.type === 'logical'
                      ? COLOR_MAP.logical
                      : err.type === 'spelling'
                      ? COLOR_MAP.spelling
                      : err.type === 'redundant'
                      ? COLOR_MAP.redundant
                      : COLOR_MAP.syntax
                }}
              />
              <span className="font-semibold text-[11px]">
                #{idx + 1} {typeLabelMap[err.type] || err.type}
              </span>
              <span className="text-[10px] text-slate-400 font-mono dir-ltr">
                {isIgnored ? '(בוטל)' : `-${err.deduction} נק׳`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Error Detailed Inspector */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {selectedError ? (
          <>
            {/* Status & Origin Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    backgroundColor:
                      selectedError.type === 'logical'
                        ? `${COLOR_MAP.logical}25`
                        : selectedError.type === 'spelling'
                        ? `${COLOR_MAP.spelling}25`
                        : `${COLOR_MAP.redundant}25`
                  }}
                  className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white border border-white/10"
                >
                  שגיאה מסוג {selectedError.type === 'logical' ? 'לוגית' : selectedError.type === 'spelling' ? 'איות' : selectedError.type === 'redundant' ? 'מיותר' : 'תחביר'}
                </span>

                {/* Origin tag */}
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                  {selectedError.origin === 'ai_detected'
                    ? 'זוהה ע״י AI'
                    : selectedError.origin === 'lecturer_manually_added'
                    ? 'הוסף ידנית'
                    : 'עודכן ע״י המרצה'}
                </span>
              </div>

              {/* Status pill */}
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  selectedError.status === 'ignored'
                    ? 'bg-slate-800 text-slate-400 line-through'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {selectedError.status === 'ignored' ? 'סטטוס: נמחל (0 נק׳)' : 'סטטוס: פעיל'}
              </span>
            </div>

            {/* Error Content */}
            {!isEditing ? (
              <div className="space-y-3">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{selectedError.description}</h4>
                  <p className="text-slate-400 leading-relaxed text-xs">{selectedError.explanation}</p>
                </div>

                {/* Detected Code vs Expected Correction */}
                <div className="space-y-2 pt-1">
                  {selectedError.location.codeSnippet && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        קוד הסטודנט שזוהה (שורה {selectedError.location.line}):
                      </span>
                      <pre className="mt-1 font-mono text-red-400 text-xs dir-ltr text-left">
                        {selectedError.location.codeSnippet}
                      </pre>
                    </div>
                  )}

                  {selectedError.expectedBehavior && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">
                        התנהגות מצופה לפי הדרישות:
                      </span>
                      <p className="mt-0.5 text-slate-300 text-xs leading-relaxed">
                        {selectedError.expectedBehavior}
                      </p>
                    </div>
                  )}

                  {selectedError.suggestedCorrection && (
                    <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                        תיקון מוצע מומלץ:
                      </span>
                      <pre className="mt-0.5 font-mono text-emerald-300 text-xs dir-ltr text-left">
                        {selectedError.suggestedCorrection}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Meta details table */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">הורדת נקודות:</span>
                    <span className="font-mono text-sm font-bold text-amber-400">
                      {selectedError.status === 'ignored' ? '0 נק׳ (בוטל)' : `-${selectedError.deduction} נק׳`}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">רמת ודאות AI:</span>
                    <span className="font-mono text-sm font-bold text-emerald-400 dir-ltr text-right">
                      {Math.round(selectedError.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Inline Editing Form */
              <div className="space-y-3 bg-slate-900/90 p-3 rounded-lg border border-indigo-500/40">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-semibold text-white">עריכת פרטי סעיף השגיאה</span>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">קטגוריה:</label>
                  <select
                    value={editFormData?.type}
                    onChange={(e) =>
                      setEditFormData((prev) =>
                        prev ? { ...prev, type: e.target.value as RubricCategoryKey } : null
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                  >
                    <option value="logical">שגיאה לוגית (Logical)</option>
                    <option value="spelling">שגיאת איות במזהה (Spelling)</option>
                    <option value="redundant">קוד מיותר / בלוק מת (Redundant)</option>
                    <option value="syntax">שגיאת תחביר (Syntax)</option>
                    <option value="incomplete">פתרון חלקי (Incomplete)</option>
                    <option value="efficiency">יעילות וסיבוכיות (Efficiency)</option>
                    <option value="other">אחר (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">
                    הורדת נקודות:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editFormData?.deduction ?? 0}
                    onChange={(e) =>
                      setEditFormData((prev) =>
                        prev ? { ...prev, deduction: parseInt(e.target.value, 10) || 0 } : null
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white mt-1 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">
                    תיאור קצר:
                  </label>
                  <input
                    type="text"
                    value={editFormData?.description ?? ''}
                    onChange={(e) =>
                      setEditFormData((prev) => (prev ? { ...prev, description: e.target.value } : null))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">
                    הסבר מפורט למרצה ולסטודנט:
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData?.explanation ?? ''}
                    onChange={(e) =>
                      setEditFormData((prev) => (prev ? { ...prev, explanation: e.target.value } : null))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={saveEditing}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded text-xs"
                  >
                    שמור שינויים
                  </button>
                </div>
              </div>
            )}

            {/* Lecturer Action Buttons (Section 13) */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                בקרת החלטות המרצה
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedError.status === 'ignored' ? (
                  <button
                    onClick={() => onAcceptError(selectedError.id)}
                    className="py-1.5 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>אשר הורדה</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onIgnoreError(selectedError.id)}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium flex items-center justify-center gap-1.5 transition"
                    title="השגיאה תישמר בדוח אך לא תגרור הורדת נקודות"
                  >
                    <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>התעלם (0 נק׳)</span>
                  </button>
                )}

                <button
                  onClick={startEditing}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                  <span>ערוך ניכוד</span>
                </button>
              </div>

              <button
                onClick={() => onDeleteError(selectedError.id)}
                className="w-full py-1.5 px-2.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-transparent hover:border-red-900 font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>מחק סעיף זה</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Check className="w-8 h-8 mx-auto text-emerald-500/40 mb-2" />
            <p>אין שגיאות רשומות. הפתרון זכאי לניקוד מלא!</p>
          </div>
        )}
      </div>

      {/* Modal: Add Manual Error */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>הוספת שגיאה ידנית ע״י המרצה</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  קטגוריה במחוון:
                </label>
                <select
                  value={newManualCategory}
                  onChange={(e) => {
                    const cat = e.target.value as RubricCategoryKey;
                    setNewManualCategory(cat);
                    const defaultDed = rubric.categories[cat]?.deductionPerError || 5;
                    setNewManualDeduction(defaultDed);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                >
                  <option value="logical">שגיאה לוגית (Logical)</option>
                  <option value="syntax">שגיאת תחביר (Syntax)</option>
                  <option value="spelling">איות מזהה (Spelling)</option>
                  <option value="redundant">קוד מיותר (Redundant)</option>
                  <option value="incomplete">פתרון חלקי (Incomplete)</option>
                  <option value="efficiency">יעילות (Efficiency)</option>
                  <option value="other">אחר / מותאם אישית</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    מספר שורה בקוד:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newManualLine}
                    onChange={(e) => setNewManualLine(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                    הורדת נקודות:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newManualDeduction}
                    onChange={(e) => setNewManualDeduction(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  תיאור קצר:
                </label>
                <input
                  type="text"
                  placeholder="למשל: בדיקת גבולות חסרה עבור מערך ריק"
                  value={newManualDescription}
                  onChange={(e) => setNewManualDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                  הסבר למשוב הסטודנט ולדוח המרצה:
                </label>
                <textarea
                  rows={3}
                  placeholder="הסבר פדגוגי מדוע סעיף זה גורר הורדת ניקוד..."
                  value={newManualExplanation}
                  onChange={(e) => setNewManualExplanation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-white rounded text-xs"
              >
                ביטול
              </button>
              <button
                onClick={handleCreateManualError}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded text-xs shadow-md"
              >
                הוסף והחל שגיאה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
