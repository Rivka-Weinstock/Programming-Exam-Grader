import React, { useState } from 'react';
import {
  ExamSubmission,
  DetectedError,
  OCRToken,
  OCRBoundingBox
} from '../types';
import { OcrImageViewer } from './OcrImageViewer';
import { CodeViewer } from './CodeViewer';
import { ErrorInspector } from './ErrorInspector';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  EyeOff,
  Plus,
  Save,
  FileCheck2,
  FileText,
  User,
  Mail,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface TeacherReviewScreenProps {
  submission: ExamSubmission;
  onUpdateErrors: (errors: DetectedError[]) => void;
  onSaveSubmission: () => void;
  onProceedToReports: () => void;
}

export const TeacherReviewScreen: React.FC<TeacherReviewScreenProps> = ({
  submission,
  onUpdateErrors,
  onSaveSubmission,
  onProceedToReports
}) => {
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(
    submission.detectedErrors[0]?.id || null
  );
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [showInterpretedCode, setShowInterpretedCode] = useState(false);
  const [viewLayout, setViewLayout] = useState<'all' | 'image-focus' | 'code-focus'>('all');

  const errors = submission.detectedErrors;
  const currentErrorIndex = errors.findIndex((e) => e.id === selectedErrorId);
  const currentError = errors[currentErrorIndex] || errors[0];

  // Navigation between errors
  const handlePrevError = () => {
    if (errors.length === 0) return;
    const newIdx = currentErrorIndex <= 0 ? errors.length - 1 : currentErrorIndex - 1;
    setSelectedErrorId(errors[newIdx].id);
  };

  const handleNextError = () => {
    if (errors.length === 0) return;
    const newIdx = currentErrorIndex >= errors.length - 1 ? 0 : currentErrorIndex + 1;
    setSelectedErrorId(errors[newIdx].id);
  };

  // Lecturer Actions: Accept, Ignore, Update, Delete, Add
  const handleAcceptError = (id: string) => {
    const updated = errors.map((err) =>
      err.id === id ? { ...err, status: 'accepted' as const, origin: 'lecturer_accepted' as const } : err
    );
    onUpdateErrors(updated);
  };

  const handleIgnoreError = (id: string) => {
    const updated = errors.map((err) =>
      err.id === id ? { ...err, status: 'ignored' as const, origin: 'lecturer_ignored' as const } : err
    );
    onUpdateErrors(updated);
  };

  const handleUpdateError = (updatedError: DetectedError) => {
    const updated = errors.map((err) => (err.id === updatedError.id ? updatedError : err));
    onUpdateErrors(updated);
  };

  const handleDeleteError = (id: string) => {
    const updated = errors.filter((err) => err.id !== id);
    onUpdateErrors(updated);
    if (selectedErrorId === id) {
      setSelectedErrorId(updated[0]?.id || null);
    }
  };

  const handleAddNewManualError = (newErrorData: Partial<DetectedError>) => {
    const newErr: DetectedError = {
      id: `err_manual_${Date.now()}`,
      type: newErrorData.type || 'logical',
      severity: newErrorData.severity || 'medium',
      description: newErrorData.description || 'Manual lecturer deduction',
      explanation: newErrorData.explanation || '',
      location: newErrorData.location || {
        line: 1,
        tokenIds: [],
        boundingBoxes: []
      },
      confidence: 1.0,
      affectsGrade: true,
      deduction: newErrorData.deduction ?? 5,
      origin: 'lecturer_manually_added',
      status: 'accepted',
      expectedBehavior: newErrorData.expectedBehavior || '',
      suggestedCorrection: newErrorData.suggestedCorrection || ''
    };

    const updated = [...errors, newErr];
    onUpdateErrors(updated);
    setSelectedErrorId(newErr.id);
  };

  const handleAddManualErrorAtBox = (box: OCRBoundingBox, intersectingTokens: OCRToken[]) => {
    const tokenIds = intersectingTokens.map((t) => t.id);
    const lineNum = intersectingTokens[0]?.lineNumber || 1;
    const codeSnippet = intersectingTokens.map((t) => t.text).join(' ');

    handleAddNewManualError({
      location: {
        line: lineNum,
        tokenIds,
        boundingBoxes: [box],
        codeSnippet
      },
      description: `Manual issue marked on token(s): "${codeSnippet}"`,
      explanation: `Lecturer highlighted region on line ${lineNum} during exam review.`
    });
  };

  const grading = submission.gradingResult;

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] bg-slate-950 overflow-hidden">
      {/* TOP BAR: Student Info & Live Grade Summary */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        {/* Student & Exam Details */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{submission.studentInfo.name}</span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline dir-ltr">
                  &lt;{submission.studentInfo.email}&gt;
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-sky-400" />
                <span>שאלה נבדקת</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-emerald-400">{submission.ocrEngine}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: View Layout Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewLayout('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              viewLayout === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3 חלונות משולבים
          </button>
          <button
            onClick={() => setViewLayout('image-focus')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              viewLayout === 'image-focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            מיקוד בכתב יד
          </button>
          <button
            onClick={() => setViewLayout('code-focus')}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              viewLayout === 'code-focus'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            מיקוד בקוד
          </button>
        </div>

        {/* Live Deterministic Grade Card */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-sm">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                ציון דטרמיניסטי חי
              </span>
              <span className="text-xs text-slate-500 font-mono dir-ltr text-right">
                ניכויים: -{grading.totalDeductions}
              </span>
            </div>

            <div
              className={`px-3 py-1 rounded-lg text-lg font-mono font-black border flex items-center gap-1 shadow-inner dir-ltr ${
                grading.finalGrade >= 85
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : grading.finalGrade >= 70
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : grading.finalGrade >= 55
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}
            >
              <span>{grading.finalGrade}</span>
              <span className="text-xs text-slate-400">/{grading.maxGrade}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-PANE WORKSPACE: LEFT (IMAGE), CENTER (CODE), RIGHT (ERROR INSPECTOR) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 overflow-hidden">
        {/* LEFT PANE: Zoomable & Pannable OCR Image with Colored Bounding Boxes */}
        {(viewLayout === 'all' || viewLayout === 'image-focus') && (
          <div
            className={`${
              viewLayout === 'image-focus' ? 'lg:col-span-8' : 'lg:col-span-5'
            } h-full overflow-hidden transition-all`}
          >
            <OcrImageViewer
              imageUrl={submission.imageUrl}
              tokens={submission.ocrTokens}
              errors={submission.detectedErrors}
              selectedErrorId={selectedErrorId}
              selectedTokenId={selectedTokenId}
              onSelectToken={(tok) => setSelectedTokenId(tok.id)}
              onSelectError={(errId) => setSelectedErrorId(errId)}
              onAddManualErrorAtBox={handleAddManualErrorAtBox}
              showLabels={true}
              isAnalyzed={true}
            />
          </div>
        )}

        {/* CENTER PANE: Reconstructed Code Viewer */}
        {(viewLayout === 'all' || viewLayout === 'code-focus') && (
          <div
            className={`${
              viewLayout === 'code-focus' ? 'lg:col-span-8' : 'lg:col-span-3'
            } h-full overflow-hidden transition-all`}
          >
            <CodeViewer
              reconstructedCode={submission.reconstructedCode}
              errors={submission.detectedErrors}
              selectedErrorId={selectedErrorId}
              onSelectError={(errId) => setSelectedErrorId(errId)}
              tokens={submission.ocrTokens}
              onSelectToken={(tok) => setSelectedTokenId(tok.id)}
              showInterpreted={showInterpretedCode}
              onToggleInterpreted={() => setShowInterpretedCode(!showInterpretedCode)}
            />
          </div>
        )}

        {/* RIGHT PANE (4 cols): Error Inspector & Lecturer Override Panel */}
        <div className="lg:col-span-4 h-full overflow-hidden">
          <ErrorInspector
            errors={submission.detectedErrors}
            selectedErrorId={selectedErrorId}
            rubric={submission.rubric}
            tokens={submission.ocrTokens}
            onSelectError={(id) => setSelectedErrorId(id)}
            onAcceptError={handleAcceptError}
            onIgnoreError={handleIgnoreError}
            onUpdateError={handleUpdateError}
            onDeleteError={handleDeleteError}
            onAddNewManualError={handleAddNewManualError}
          />
        </div>
      </div>

      {/* BOTTOM ACTION TOOLBAR */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 text-xs z-10">
        {/* Previous / Next Error Buttons */}
        <div className="flex items-center gap-2">
          <button
            disabled={errors.length === 0}
            onClick={handlePrevError}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium flex items-center gap-1 border border-slate-700 disabled:opacity-40"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>סעיף קודם</span>
          </button>
          <button
            disabled={errors.length === 0}
            onClick={handleNextError}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium flex items-center gap-1 border border-slate-700 disabled:opacity-40"
          >
            <span>סעיף הבא</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] text-slate-500 mr-2 hidden sm:inline">
            סעיף {errors.length > 0 ? currentErrorIndex + 1 : 0} מתוך {errors.length}
          </span>
        </div>

        {/* Quick Decision Overrides for current error */}
        {currentError && (
          <div className="hidden md:flex items-center gap-2">
            {currentError.status === 'ignored' ? (
              <button
                onClick={() => handleAcceptError(currentError.id)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 font-medium flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>אשר הורדה לסעיף נוכחי</span>
              </button>
            ) : (
              <button
                onClick={() => handleIgnoreError(currentError.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 font-medium flex items-center gap-1.5"
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>התעלם מהסעיף (0 נק׳)</span>
              </button>
            )}
          </div>
        )}

        {/* Save & Generate Reports Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveSubmission}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 transition"
          >
            <Save className="w-3.5 h-3.5 text-sky-400" />
            <span>שמור טיוטה</span>
          </button>

          <button
            onClick={onProceedToReports}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>הפק דוחות ומשוב</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
