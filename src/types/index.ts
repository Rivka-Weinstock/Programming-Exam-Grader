export type ProgrammingLanguage = 'python' | 'cpp' | 'java' | 'javascript' | 'csharp';

export type RubricCategoryKey =
  | 'logical'
  | 'syntax'
  | 'spelling'
  | 'redundant'
  | 'incomplete'
  | 'efficiency'
  | 'other';

export interface RubricCategoryConfig {
  key: RubricCategoryKey;
  name: string;
  enabled: boolean;
  affectsGrade: boolean;
  deductionPerError: number;
  maxTotalDeduction: number;
  description: string;
  color: string; // Tailwind / Hex color definition
  textColor: string;
}

export interface GradingRubric {
  categories: Record<RubricCategoryKey, RubricCategoryConfig>;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  language: ProgrammingLanguage;
  maxGrade: number;
  referenceSolution: string;
  testCases?: TestCase[];
  expectedAlgorithmExplanation?: string;
  createdAt: string;
}

export interface OCRBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRToken {
  id: string;
  text: string;
  interpretedText?: string;
  confidence: number;
  boundingBox: OCRBoundingBox;
  lineNumber: number;
  lineIndex: number;
  isStudentInfo?: boolean;
  studentInfoType?: 'name' | 'email';
}

export interface ReconstructedLine {
  lineNumber: number;
  text: string;
  tokenIds: string[];
  indentation: number;
  interpretedText?: string;
}

export interface ReconstructedCode {
  rawText: string;
  interpretedText?: string;
  lines: ReconstructedLine[];
}

export type ErrorSeverity = 'high' | 'medium' | 'low';

export type ErrorOrigin =
  | 'ai_detected'
  | 'lecturer_accepted'
  | 'lecturer_ignored'
  | 'lecturer_manually_added'
  | 'lecturer_modified';

export type ErrorStatus = 'pending' | 'accepted' | 'ignored';

export interface DetectedError {
  id: string;
  type: RubricCategoryKey;
  severity: ErrorSeverity;
  description: string;
  explanation: string;
  location: {
    line: number;
    tokenIds: string[];
    boundingBoxes: OCRBoundingBox[];
    codeSnippet?: string;
  };
  confidence: number;
  affectsGrade: boolean;
  deduction: number;
  origin: ErrorOrigin;
  status: ErrorStatus;
  expectedBehavior?: string;
  suggestedCorrection?: string;
  lecturerNotes?: string;
}

export interface StudentInfo {
  name: string;
  email: string;
  confidence: number;
  extractedFromOCR: boolean;
}

export interface CategoryGradeBreakdown {
  category: RubricCategoryKey;
  categoryName: string;
  color: string;
  errorCount: number;
  rawDeductions: number;
  cappedDeductions: number;
  maxCap: number;
  maxCapReached: boolean;
  affectsGrade: boolean;
  errors: DetectedError[];
}

export interface GradingResult {
  maxGrade: number;
  totalDeductions: number;
  finalGrade: number;
  categoryBreakdown: CategoryGradeBreakdown[];
  acceptedErrorsCount: number;
  ignoredErrorsCount: number;
  manuallyAddedCount: number;
}

export interface ExamSubmission {
  id: string;
  exerciseId: string;
  studentInfo: StudentInfo;
  imageUrl: string;
  imageDimensions: { width: number; height: number };
  ocrTokens: OCRToken[];
  reconstructedCode: ReconstructedCode;
  detectedErrors: DetectedError[];
  rubric: GradingRubric;
  gradingResult: GradingResult;
  codeQualitySummary?: string;
  alternativeSolutionNotes?: string;
  ocrUncertainties?: string[];
  ocrEngine: string;
  status: 'draft' | 'ocr_completed' | 'analyzed' | 'reviewed' | 'finalized';
  createdAt: string;
  updatedAt: string;
}

export type WorkflowStep =
  | 'exercise'
  | 'rubric'
  | 'upload'
  | 'ocr'
  | 'analysis'
  | 'review'
  | 'grade'
  | 'reports';
