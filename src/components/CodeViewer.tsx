import React from 'react';
import { ReconstructedCode, DetectedError, OCRToken } from '../types';
import {
  Code,
  FileCode,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { COLOR_MAP } from '../data/defaults';

interface CodeViewerProps {
  reconstructedCode: ReconstructedCode;
  errors: DetectedError[];
  selectedErrorId: string | null;
  onSelectError: (errorId: string) => void;
  tokens: OCRToken[];
  onSelectToken: (token: OCRToken) => void;
  showInterpreted?: boolean;
  onToggleInterpreted?: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  reconstructedCode,
  errors,
  selectedErrorId,
  onSelectError,
  tokens,
  onSelectToken,
  showInterpreted = false,
  onToggleInterpreted
}) => {
  // Map errors to line numbers
  const getErrorsForLine = (lineNum: number) => {
    return errors.filter((e) => e.location.line === lineNum);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-sm px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">קוד הסטודנט המשוחזר</span>
        </div>

        {/* OCR Literal vs AI Interpreted Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">תצוגה:</span>
          <button
            onClick={onToggleInterpreted}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              showInterpreted
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="מעבר בין טקסט גולמי ישיר מה-OCR לבין קוד מנורמל ומפורש ע״י AI"
          >
            {showInterpreted ? 'קוד מפורש (מנורמל AI)' : 'טקסט EasyOCR גולמי'}
          </button>
        </div>
      </div>

      {/* Distinction explanation banner */}
      <div className="bg-slate-900/40 px-4 py-1.5 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>לחץ על שורה לסימון הקובייה המקבילה בתמונה ופרטי השגיאה.</span>
        <span className="text-[10px] text-slate-500 font-mono dir-ltr">
          {reconstructedCode.lines.length} שורות
        </span>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 overflow-auto p-4 space-y-1 dir-ltr text-left">
        {reconstructedCode.lines.map((line) => {
          const lineErrors = getErrorsForLine(line.lineNumber);
          const hasError = lineErrors.length > 0;
          const isSelected = lineErrors.some((e) => e.id === selectedErrorId);
          const firstError = lineErrors[0];

          // Determine line border / badge color
          let lineColor = 'transparent';
          if (hasError && firstError) {
            switch (firstError.type) {
              case 'logical':
                lineColor = COLOR_MAP.logical;
                break;
              case 'spelling':
                lineColor = COLOR_MAP.spelling;
                break;
              case 'redundant':
                lineColor = COLOR_MAP.redundant;
                break;
              case 'syntax':
                lineColor = COLOR_MAP.syntax;
                break;
              default:
                lineColor = COLOR_MAP.other;
            }
          }

          return (
            <div
              key={line.lineNumber}
              onClick={() => {
                if (hasError) {
                  onSelectError(firstError.id);
                }
              }}
              style={{
                borderLeftColor: hasError ? lineColor : 'transparent',
                backgroundColor: isSelected
                  ? 'rgba(99, 102, 241, 0.15)'
                  : hasError
                  ? `${lineColor}10`
                  : 'transparent'
              }}
              className={`group flex items-start border-l-3 pl-2 py-1 rounded-r transition cursor-pointer hover:bg-slate-850 hover:bg-slate-900/80 ${
                isSelected ? 'ring-1 ring-indigo-500/40' : ''
              }`}
            >
              {/* Line Number */}
              <span className="w-8 text-right pr-3 select-none text-slate-600 group-hover:text-slate-400 font-mono text-[11px]">
                {line.lineNumber}
              </span>

              {/* Code Content */}
              <div className="flex-1 font-mono text-sm leading-relaxed whitespace-pre text-slate-200">
                {showInterpreted && line.interpretedText ? line.interpretedText : line.text}
              </div>

              {/* Error Badge on Line */}
              {hasError && (
                <div className="flex items-center gap-1.5 ml-2">
                  {lineErrors.map((err) => (
                    <span
                      key={err.id}
                      style={{
                        backgroundColor: `${lineColor}25`,
                        color: lineColor,
                        borderColor: `${lineColor}40`
                      }}
                      className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border"
                    >
                      {err.type === 'logical' ? 'לוגי' : err.type === 'spelling' ? 'איות' : err.type === 'redundant' ? 'מיותר' : 'תחביר'} {err.status === 'ignored' ? '(בוטל)' : `-${err.deduction}pt`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
