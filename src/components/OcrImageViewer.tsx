import React, { useState, useRef, useEffect } from 'react';
import {
  OCRToken,
  DetectedError,
  OCRBoundingBox,
  RubricCategoryKey
} from '../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Move,
  PlusCircle,
  Eye,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { COLOR_MAP } from '../data/defaults';

interface OcrImageViewerProps {
  imageUrl: string;
  tokens: OCRToken[];
  errors: DetectedError[];
  selectedErrorId: string | null;
  selectedTokenId: string | null;
  onSelectToken: (token: OCRToken) => void;
  onSelectError: (errorId: string) => void;
  onAddManualErrorAtBox?: (box: OCRBoundingBox, associatedTokens: OCRToken[]) => void;
  showLabels?: boolean;
  isAnalyzed?: boolean;
}

export const OcrImageViewer: React.FC<OcrImageViewerProps> = ({
  imageUrl,
  tokens,
  errors,
  selectedErrorId,
  selectedTokenId,
  onSelectToken,
  onSelectError,
  onAddManualErrorAtBox,
  showLabels = true,
  isAnalyzed = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 900, height: 1150 });
  const [manualAddMode, setManualAddMode] = useState(false);
  const [selectionBox, setSelectionBox] = useState<OCRBoundingBox | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });

  // Update natural dimensions when image loads
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setNaturalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    }
  };

  // Zoom controls
  const handleZoomIn = () => setScale((prev) => Math.min(prev * 1.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev / 1.25, 0.4));
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  const handleFitToScreen = () => {
    if (!containerRef.current || !imageRef.current) return;
    const container = containerRef.current;
    const padding = 32;
    const containerW = container.clientWidth - padding;
    const containerH = container.clientHeight - padding;
    const scaleX = containerW / naturalDimensions.width;
    const scaleY = containerH / naturalDimensions.height;
    const bestScale = Math.min(scaleX, scaleY, 1.2);
    setScale(Math.max(0.4, bestScale));
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(Math.max(prev * delta, 0.4), 4));
  };

  // Mouse Drag / Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (manualAddMode) {
      // Begin box selection on image
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / scale;
      const clickY = (e.clientY - rect.top) / scale;
      setIsSelecting(true);
      setSelectionStart({ x: clickX, y: clickY });
      setSelectionBox({ x: clickX, y: clickY, width: 0, height: 0 });
      return;
    }

    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (manualAddMode && isSelecting && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / scale;
      const currentY = (e.clientY - rect.top) / scale;

      const x = Math.min(selectionStart.x, currentX);
      const y = Math.min(selectionStart.y, currentY);
      const width = Math.abs(currentX - selectionStart.x);
      const height = Math.abs(currentY - selectionStart.y);

      setSelectionBox({ x, y, width, height });
      return;
    }

    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    if (manualAddMode && isSelecting && selectionBox) {
      setIsSelecting(false);
      if (selectionBox.width > 15 && selectionBox.height > 15) {
        // Find tokens intersecting this bounding box
        const intersecting = tokens.filter((t) => {
          const b = t.boundingBox;
          return (
            b.x < selectionBox.x + selectionBox.width &&
            b.x + b.width > selectionBox.x &&
            b.y < selectionBox.y + selectionBox.height &&
            b.y + b.height > selectionBox.y
          );
        });

        if (onAddManualErrorAtBox) {
          onAddManualErrorAtBox(selectionBox, intersecting);
        }
      }
      setManualAddMode(false);
      setSelectionBox(null);
      return;
    }

    setIsDragging(false);
  };

  // Find error associated with a token
  const getErrorForToken = (token: OCRToken): DetectedError | undefined => {
    return errors.find(
      (err) =>
        err.location.tokenIds.includes(token.id) ||
        (err.location.line && err.location.line === token.lineNumber)
    );
  };

  // Determine token visual color based on requirements:
  // GREEN: Correct code / recognized text with no detected problem.
  // ORANGE: Spelling / identifier error.
  // RED: Logical error.
  // LIGHT YELLOW: Redundant code.
  const getTokenColor = (token: OCRToken) => {
    if (!isAnalyzed) {
      return COLOR_MAP.neutral; // Indigo neutral before analysis
    }

    if (token.isStudentInfo) {
      return '#38bdf8'; // Sky blue for student candidate metadata
    }

    const error = getErrorForToken(token);
    if (!error) {
      return COLOR_MAP.correct; // GREEN (#10b981)
    }

    if (error.status === 'ignored') {
      return '#64748b'; // Muted grey if lecturer ignored this error
    }

    switch (error.type) {
      case 'logical':
        return COLOR_MAP.logical; // RED (#ef4444)
      case 'spelling':
        return COLOR_MAP.spelling; // ORANGE (#f97316)
      case 'redundant':
        return COLOR_MAP.redundant; // LIGHT YELLOW (#eab308)
      case 'syntax':
        return COLOR_MAP.syntax; // BLUE
      case 'incomplete':
        return COLOR_MAP.incomplete; // PURPLE
      case 'efficiency':
        return COLOR_MAP.efficiency; // CYAN
      default:
        return COLOR_MAP.other;
    }
  };

  // Auto-pan to selected error bounding box
  useEffect(() => {
    if (!selectedErrorId || !containerRef.current) return;
    const targetError = errors.find((e) => e.id === selectedErrorId);
    if (!targetError || targetError.location.boundingBoxes.length === 0) return;

    const firstBox = targetError.location.boundingBoxes[0];
    const container = containerRef.current;

    // Center target box in viewport
    const targetCenterX = firstBox.x + firstBox.width / 2;
    const targetCenterY = firstBox.y + firstBox.height / 2;

    const newX = container.clientWidth / 2 - targetCenterX * scale;
    const newY = container.clientHeight / 2 - targetCenterY * scale;

    setPosition({ x: newX, y: newY });
  }, [selectedErrorId]);

  // Count active colored cubes
  const greenCubesCount = tokens.filter((t) => !t.isStudentInfo && !getErrorForToken(t)).length;
  const redCubesCount = errors.filter((e) => e.type === 'logical' && e.status !== 'ignored').length;
  const orangeCubesCount = errors.filter((e) => e.type === 'spelling' && e.status !== 'ignored').length;
  const yellowCubesCount = errors.filter((e) => e.type === 'redundant' && e.status !== 'ignored').length;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="bg-slate-900/95 backdrop-blur-sm px-3 py-2 border-b border-slate-800 flex items-center justify-between z-20 text-xs">
        {/* Left: Viewport status & Colored Cubes Counters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px] dir-ltr">
            <Move className="w-3 h-3 text-slate-400" />
            <span>{Math.round(scale * 100)}%</span>
          </div>

          {/* Active Colored Cubes Counters */}
          <div className="flex items-center gap-1.5 mr-1 text-[11px]">
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
              title="קוביות ירוקות: קוד תקין"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-sm inline-block" />
              <span className="font-bold font-mono">{greenCubesCount}</span>
              <span className="hidden xl:inline text-[10px] text-emerald-400">תקין</span>
            </span>

            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30"
              title="קוביות אדומות: שגיאות לוגיות"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500 shadow-sm inline-block" />
              <span className="font-bold font-mono">{redCubesCount}</span>
              <span className="hidden xl:inline text-[10px] text-red-400">לוגי</span>
            </span>

            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/30"
              title="קוביות כתומות: שגיאות איות במזהים"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 shadow-sm inline-block" />
              <span className="font-bold font-mono">{orangeCubesCount}</span>
              <span className="hidden xl:inline text-[10px] text-orange-400">איות</span>
            </span>

            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30"
              title="קוביות צהובות: קוד מיותר"
            >
              <span className="w-2.5 h-2.5 rounded-xs bg-yellow-400 shadow-sm inline-block" />
              <span className="font-bold font-mono">{yellowCubesCount}</span>
              <span className="hidden xl:inline text-[10px] text-yellow-400">מיותר</span>
            </span>
          </div>
        </div>

        {/* Right: Zoom & Selection Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setManualAddMode(!manualAddMode)}
            className={`px-2 py-1 rounded flex items-center gap-1 text-xs font-semibold transition ${
              manualAddMode
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750'
            }`}
            title="לחץ וגרור כדי לסמן תיבה ושגיאה ידנית על הדף"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">סמן תיבה ידנית</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="הגדל תצוגה"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="הקטן תצוגה"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="התאם למסך"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
            title="איפוס זום ומיקום"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Selection Mode Hint Banner */}
      {manualAddMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-3 py-1.5 text-[11px] text-amber-300 flex items-center justify-between z-20">
          <span>גרור עם העכבר מעל אזור בכתב היד כדי לסמן שגיאה מותאמת אישית של המרצה.</span>
          <button
            onClick={() => setManualAddMode(false)}
            className="text-amber-400 hover:text-amber-200 underline font-semibold mr-2"
          >
            ביטול
          </button>
        </div>
      )}

      {/* Pannable Canvas Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative flex-1 overflow-hidden flex items-center justify-center ${
          manualAddMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging || isSelecting ? 'none' : 'transform 0.08s ease-out'
          }}
          className="relative inline-block"
        >
          {/* Base Handwritten Exam Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Handwritten exam paper"
            onLoad={handleImageLoaded}
            draggable={false}
            className="max-w-none block pointer-events-none shadow-2xl"
          />

          {/* OCR Bounding Boxes & Text Labels Overlay */}
          {tokens.map((token) => {
            const error = getErrorForToken(token);
            const isErrorSelected = error && error.id === selectedErrorId;
            const isTokenSelected = token.id === selectedTokenId;
            const color = getTokenColor(token);
            const box = token.boundingBox;
            const isLowConfidence = token.confidence < 0.9;

            return (
              <div
                key={token.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectToken(token);
                  if (error) {
                    onSelectError(error.id);
                  }
                }}
                style={{
                  left: `${box.x}px`,
                  top: `${box.y}px`,
                  width: `${box.width}px`,
                  height: `${box.height}px`,
                  borderColor: isErrorSelected || isTokenSelected ? '#ffffff' : color,
                  backgroundColor:
                    isErrorSelected || isTokenSelected
                      ? `${color}45`
                      : `${color}20`,
                  boxShadow:
                    isErrorSelected || isTokenSelected
                      ? `0 0 0 2px #ffffff, 0 0 16px ${color}`
                      : `0 0 8px ${color}50, inset 0 0 4px ${color}25`
                }}
                className={`absolute border-2 rounded-sm transition-all cursor-pointer group hover:z-30 hover:border-white hover:scale-105 ${
                  isErrorSelected ? 'z-20 scale-105' : 'z-10'
                }`}
                title={`${
                  error
                    ? `[${error.type.toUpperCase()} CUBE]: ${error.description} (-${error.deduction} pts)`
                    : '[GREEN CUBE]: Valid Correct Code'
                } | OCR: "${token.text}" (${Math.round(token.confidence * 100)}% conf)`}
              >
                {/* Text recognized by OCR displayed strictly ABOVE each bounding box cube */}
                {showLabels && (
                  <div
                    style={{
                      color: isErrorSelected ? '#ffffff' : color,
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: color
                    }}
                    className="absolute bottom-full left-0 mb-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-tight whitespace-nowrap shadow-md border border-opacity-60 pointer-events-none transform -translate-y-0.5"
                  >
                    {token.text}
                    {isLowConfidence && (
                      <span className="ml-1 text-amber-400 font-bold" title="Low OCR confidence">
                        ⚠
                      </span>
                    )}
                  </div>
                )}

                {/* Error indicator icon badge on corner if issue exists */}
                {error && error.status !== 'ignored' && (
                  <div
                    style={{ backgroundColor: color }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-slate-950 font-black text-[9px] shadow-sm pointer-events-none"
                  >
                    !
                  </div>
                )}
              </div>
            );
          })}

          {/* Active Drag-selection box during manual error marking */}
          {manualAddMode && selectionBox && (
            <div
              style={{
                left: `${selectionBox.x}px`,
                top: `${selectionBox.y}px`,
                width: `${selectionBox.width}px`,
                height: `${selectionBox.height}px`
              }}
              className="absolute border-2 border-dashed border-amber-400 bg-amber-400/20 z-40 pointer-events-none rounded"
            />
          )}
        </div>
      </div>
    </div>
  );
};
