import {
  DetectedError,
  Exercise,
  GradingRubric,
  OCRToken,
  ReconstructedCode,
  StudentInfo,
  RubricCategoryKey
} from '../types';

export interface AIAnalysisResult {
  errors: DetectedError[];
  codeQualitySummary: string;
  alternativeSolutionNotes?: string;
  ocrUncertainties?: string[];
}

/**
 * Sends reconstructed code and rubric to server-side Gemini 3.8 Flash model.
 * Associates errors with image bounding boxes and applies rubric deductions.
 */
export async function analyzeStudentCode(
  exercise: Exercise,
  rubric: GradingRubric,
  reconstructedCode: ReconstructedCode,
  ocrTokens: OCRToken[],
  studentInfo: StudentInfo
): Promise<AIAnalysisResult> {
  const payload = {
    exercise,
    rubric,
    reconstructedCode,
    ocrTokens,
    studentInfo
  };

  const response = await fetch('/api/analyze-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`AI Analysis server returned status ${response.status}`);
  }

  const data = await response.json();

  // Map raw errors into strictly typed DetectedError objects
  const mappedErrors: DetectedError[] = (data.errors || []).map((rawErr: any, index: number) => {
    const errorType: RubricCategoryKey = (
      ['logical', 'syntax', 'spelling', 'redundant', 'incomplete', 'efficiency', 'other'].includes(rawErr.type)
        ? rawErr.type
        : 'other'
    ) as RubricCategoryKey;

    const rubricConfig = rubric.categories[errorType];
    const deduction = rubricConfig ? rubricConfig.deductionPerError : 0;
    const affectsGrade = rubricConfig ? (rubricConfig.enabled && rubricConfig.affectsGrade) : false;

    // Find bounding boxes corresponding to the error line or tokenIds
    const lineTokens = ocrTokens.filter((t) => {
      if (rawErr.tokenIds && rawErr.tokenIds.includes(t.id)) return true;
      if (rawErr.line && t.lineNumber === rawErr.line) return true;
      return false;
    });

    const boundingBoxes = lineTokens.map((t) => t.boundingBox);

    // Get code snippet from line
    const codeSnippet =
      reconstructedCode.lines.find((l) => l.lineNumber === rawErr.line)?.text?.trim() ||
      lineTokens.map((t) => t.text).join(' ') ||
      '';

    return {
      id: rawErr.id || `err_${Date.now()}_${index}`,
      type: errorType,
      severity: (rawErr.severity as any) || 'medium',
      description: rawErr.description || 'Issue detected in code',
      explanation: rawErr.explanation || '',
      location: {
        line: rawErr.line || 1,
        tokenIds: lineTokens.map((t) => t.id),
        boundingBoxes,
        codeSnippet
      },
      confidence: typeof rawErr.confidence === 'number' ? rawErr.confidence : 0.9,
      affectsGrade,
      deduction,
      origin: 'ai_detected' as const,
      status: 'accepted' as const,
      expectedBehavior: rawErr.expectedBehavior || '',
      suggestedCorrection: rawErr.suggestedCorrection || ''
    };
  });

  return {
    errors: mappedErrors,
    codeQualitySummary:
      data.codeQualitySummary ||
      'Code analyzed against exercise requirements and lecturer grading policy.',
    alternativeSolutionNotes: data.alternativeSolutionNotes || '',
    ocrUncertainties: data.ocrUncertainties || []
  };
}
