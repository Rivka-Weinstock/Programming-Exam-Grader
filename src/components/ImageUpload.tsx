import React, { useRef, useState } from 'react';
import { Exercise, StudentInfo } from '../types';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  Trash2,
  RefreshCw,
  User,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Code2
} from 'lucide-react';

interface ImageUploadProps {
  currentImage: string | null;
  studentInfo: StudentInfo;
  exercises?: Exercise[];
  selectedExerciseId?: string;
  onSelectExercise?: (exerciseId: string) => void;
  onImageSelected: (imageDataUrl: string, dimensions: { width: number; height: number }) => void;
  onStudentInfoChanged: (info: StudentInfo) => void;
  onProceedToOcr: () => void;
  onBack: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  studentInfo,
  exercises = [],
  selectedExerciseId,
  onSelectExercise,
  onImageSelected,
  onStudentInfoChanged,
  onProceedToOcr,
  onBack
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const currentExercise = exercises.find((e) => e.id === selectedExerciseId) || exercises[0];

  const processFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
      setImageError('נא לבחור קובץ תמונה בפורמט JPG, PNG או WebP.');
      return;
    }
    setImageError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        onImageSelected(result, {
          width: img.naturalWidth || 900,
          height: img.naturalHeight || 1150
        });
      };
      img.onerror = () => {
        setImageError('טעינת התמונה נכשלה. נא לנסות קובץ תמונה אחר.');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            העלאת מחברת בחינה ופרטי סטודנט
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            בחרו את שאלת המבחן הנבדקת, והעלו סריקה או צילום של פתרון הסטודנט בכתב יד. המערכת תזהה את שם הסטודנט וכותרת הדף באופן אוטומטי.
          </p>
        </div>
      </div>

      {/* Exercise Selector Bar */}
      {exercises.length > 0 && (
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">שאלת המבחן הנבדקת כעת:</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentExercise?.title}</span>
                <span className="text-[11px] font-mono text-sky-400 font-normal dir-ltr">
                  ({currentExercise?.language?.toUpperCase()} · {currentExercise?.maxGrade} נק׳)
                </span>
              </div>
            </div>
          </div>

          {onSelectExercise && (
            <div className="flex items-center gap-2">
              <label htmlFor="exercise-select" className="text-xs text-slate-400 whitespace-nowrap">
                החלף שאלה:
              </label>
              <select
                id="exercise-select"
                value={selectedExerciseId || currentExercise?.id}
                onChange={(e) => onSelectExercise(e.target.value)}
                aria-label="בחר שאלת מבחן לבדיקה"
                className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.maxGrade} נק׳)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {imageError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{imageError}</span>
        </div>
      )}

      {/* 2-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanned Image Upload Area (7 cols) */}
        <div className="lg:col-span-7">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {!currentImage ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[380px] ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-950/20'
                  : 'border-slate-700/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-600'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                העלאת דף בחינה בכתב יד
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                גררו לכאן את קובץ הסריקה, או לחצו לבחירת תמונה (JPG, PNG).
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <FileImage className="w-4 h-4 text-slate-400" />
                <span>צילום או סריקה ברורה של כתב היד</span>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl group">
              <div className="max-h-[460px] overflow-auto flex items-center justify-center bg-slate-950/80 p-2">
                <img
                  src={currentImage}
                  alt="Student exam preview"
                  className="max-h-[440px] w-auto object-contain rounded border border-slate-800 shadow-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl text-xs font-medium border border-slate-700 shadow-md backdrop-blur-xs flex items-center gap-1.5 transition"
                  title="החלף תמונת מבחן"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                  <span>החלף קובץ</span>
                </button>
                <button
                  onClick={() => onImageSelected('', { width: 900, height: 1150 })}
                  className="p-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 rounded-xl text-xs border border-rose-800 shadow-md backdrop-blur-xs transition"
                  title="הסר תמונה"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>הדף מוכן לחילוץ EasyOCR</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">תמונה פעילה</span>
              </div>
            </div>
          )}
        </div>

        {/* Student Information Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>פרטי הסטודנט (זיהוי אוטומטי)</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-400">
                ללא צורך בהקלדה
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              המערכת סורקת את כותרת הדף ומזהה באופן עצמאי את שם הסטודנט וכתובת הדוא״ל, ללא צורך בהזנה ידנית מצד המרצה.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">שם הסטודנט המזוהה:</div>
                <div className={`text-base font-bold ${studentInfo.name ? 'text-white' : 'text-slate-500 italic'}`}>
                  {studentInfo.name || 'טרם זוהה (יחולץ בסריקה)'}
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">כתובת דוא״ל:</div>
                <div className={`text-sm font-mono dir-ltr text-right ${studentInfo.email ? 'text-slate-200' : 'text-slate-500 italic'}`}>
                  {studentInfo.email || 'טרם זוהתה כתובת מייל'}
                </div>
              </div>

              {/* Optional Manual Edit */}
              <details className="pt-2">
                <summary className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer font-medium select-none">
                  עריכה ידנית של פרטי הסטודנט במידת הצורך ▾
                </summary>
                <div className="mt-3 space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">שם מלא:</label>
                    <input
                      type="text"
                      value={studentInfo.name}
                      onChange={(e) => onStudentInfoChanged({ ...studentInfo, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">כתובת דוא״ל:</label>
                    <input
                      type="email"
                      value={studentInfo.email}
                      onChange={(e) => onStudentInfoChanged({ ...studentInfo, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs dir-ltr text-right"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Reference Solution Quick Peek */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span>פתרון ייחוס לשאלה:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">מוכן להשוואה</span>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-28 dir-ltr text-left">
              {currentExercise?.referenceSolution?.slice(0, 180)}...
            </pre>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium transition"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>חזרה ללוח הבקרה</span>
        </button>

        <button
          disabled={!currentImage}
          onClick={onProceedToOcr}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition"
        >
          <span>המשך: הפעל חילוץ EasyOCR</span>
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};
