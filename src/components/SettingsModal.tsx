import React from 'react';
import {
  Settings,
  X,
  Cpu,
  ScanText,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  RotateCcw
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDefaults
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-xs text-slate-300">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">הגדרות מנוע הבדיקה והערכה</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OCR Engine Status */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-2">
              <ScanText className="w-4 h-4 text-emerald-400" />
              <span>צינור EasyOCR לזיהוי כתב יד</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 dir-ltr">
              פעיל ומוכן
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            האפליקציה כוללת מיקרו-שירות Python EasyOCR מובנה בתיקיית <code className="text-slate-200 dir-ltr">/python</code>.
            בהרצה מקומית, EasyOCR מפעיל זיהוי תווים עצבי עמוק בפורט 5050 עם תיחום קוביות מדויק.
          </p>
          <div className="bg-slate-900 p-2 rounded text-[11px] font-mono text-slate-300 flex items-center gap-2 border border-slate-800 dir-ltr text-left">
            <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>python python/easyocr_server.py</span>
          </div>
        </div>

        {/* Gemini API Status */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>מנוע Gemini 3.8 Flash לניתוח קוד</span>
            </span>
            <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 dir-ltr">
              @google/genai SDK
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            ניתוח הקוד הלוגי מתבצע בצד השרת. המודל מעריך את ההיגיון האלגוריתמי, מאתר שגיאות, וממפה אותן ישירות לקטגוריות מחוון הניקוד שהמרצה הגדיר.
          </p>
        </div>

        {/* Reset Presets */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-semibold text-white block">איפוס הגדרות מערכת לברירת מחדל</span>
            <span className="text-[11px] text-slate-500">שחזור תרגילי ברירת המחדל ומחוון הניקוד המומלץ</span>
          </div>
          <button
            onClick={() => {
              onResetDefaults();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>איפוס הגדרות</span>
          </button>
        </div>
      </div>
    </div>
  );
};
