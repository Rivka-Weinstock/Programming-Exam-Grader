import React, { useState } from 'react';
import { ExamSubmission, OCRToken } from '../types';
import { OcrImageViewer } from './OcrImageViewer';
import {
  ScanText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Layers,
  Cpu,
  RefreshCw
} from 'lucide-react';

interface OcrProcessingStageProps {
  submission: ExamSubmission;
  isProcessingOcr: boolean;
  isProcessingAi: boolean;
  onRunAiAnalysis: () => void;
  onBackToUpload: () => void;
}

export const OcrProcessingStage: React.FC<OcrProcessingStageProps> = ({
  submission,
  isProcessingOcr,
  isProcessingAi,
  onRunAiAnalysis,
  onBackToUpload
}) => {
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const selectedToken = submission.ocrTokens.find((t) => t.id === selectedTokenId);

  const lowConfidenceTokens = submission.ocrTokens.filter((t) => t.confidence < 0.9);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-slate-800 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            פענוח וזיהוי כתב היד (EasyOCR)
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            כל מילה וסימן זוהו ושומרים על מיקומם המרחבי המדויק על גבי הדף המקורי. לחצו על קוביות לצפייה ברמת הוודאות.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToUpload}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium transition"
          >
            חזרה להעלאה
          </button>

          <button
            disabled={isProcessingAi || submission.ocrTokens.length === 0}
            onClick={onRunAiAnalysis}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-95 transition disabled:opacity-50"
          >
            {isProcessingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>מריץ ניתוח Gemini מול המחוון...</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                <span>שחזר קוד ובצע ניתוח AI</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Viewer + Token Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[620px]">
        {/* Left: Zoomable Bounding Box Canvas (8 cols) */}
        <div className="lg:col-span-8 h-full">
          <OcrImageViewer
            imageUrl={submission.imageUrl}
            tokens={submission.ocrTokens}
            errors={[]}
            selectedErrorId={null}
            selectedTokenId={selectedTokenId}
            onSelectToken={(token) => setSelectedTokenId(token.id)}
            onSelectError={() => {}}
            showLabels={true}
            isAnalyzed={false}
          />
        </div>

        {/* Right: OCR Tokens & Confidence Inspector (4 cols) */}
        <div className="lg:col-span-4 h-full flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>קוביות מילים שחולצו ({submission.ocrTokens.length})</span>
            </h3>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              דגם: פייתון / אנגלית
            </span>
          </div>

          {/* Uncertainty notice if applicable */}
          {lowConfidenceTokens.length > 0 && (
            <div className="my-2.5 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>סומנו מילים ברמת ודאות נמוכה:</strong> {lowConfidenceTokens.length} מילים זוהו עם אי-ודאות וסומנו לעיון המרצה בשלב הבדיקה.
              </div>
            </div>
          )}

          {/* Selected Token Details */}
          {selectedToken ? (
            <div className="p-3 my-2 bg-slate-950 rounded-lg border border-indigo-500/30 space-y-1.5">
              <div className="flex justify-between items-center text-slate-400 font-semibold">
                <span>מילה נבחרת #{selectedToken.id}</span>
                <span className="text-emerald-400 font-mono">
                  {Math.round(selectedToken.confidence * 100)}% ודאות
                </span>
              </div>
              <div className="text-sm font-mono text-white font-bold bg-slate-900 p-2 rounded border border-slate-800 dir-ltr text-left">
                "{selectedToken.text}"
              </div>
              <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-1 font-mono">
                <span>שורה: {selectedToken.lineNumber}</span>
                <span className="dir-ltr text-right">
                  {selectedToken.boundingBox.width}x{selectedToken.boundingBox.height}px
                </span>
              </div>
            </div>
          ) : (
            <div className="my-2 p-3 text-slate-500 text-center bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
              לחץ על קובייה על גבי התמונה כדי לראות את פרטי הזיהוי ורמת הוודאות שלה.
            </div>
          )}

          {/* Token Stream List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1 mt-1">
            {submission.ocrTokens.map((t) => {
              const isSelected = t.id === selectedTokenId;
              const isLow = t.confidence < 0.9;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTokenId(t.id)}
                  className={`p-2 rounded flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-600/30 border border-indigo-500 text-white'
                      : 'bg-slate-950/80 hover:bg-slate-800 border border-slate-850 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono w-5">ש{t.lineNumber}</span>
                    <span className="font-mono text-xs font-semibold text-slate-200 dir-ltr">"{t.text}"</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isLow && (
                      <span className="text-amber-400 text-[10px] font-bold" title="רמת ודאות נמוכה">
                        ⚠
                      </span>
                    )}
                    <span
                      className={`font-mono text-[10px] ${
                        t.confidence >= 0.95
                          ? 'text-emerald-400'
                          : t.confidence >= 0.9
                          ? 'text-sky-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {Math.round(t.confidence * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
