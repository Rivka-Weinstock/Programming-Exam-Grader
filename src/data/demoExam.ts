import { ExamSubmission, OCRToken, ReconstructedCode } from '../types';
import { DEFAULT_EXERCISES, DEFAULT_RUBRIC } from './defaults';
import { calculateGrade } from '../services/gradingEngine';

// Generates a realistic high-resolution SVG canvas representation of a handwritten college exam paper
export function generateDemoExamImage(): string {
  const width = 900;
  const height = 1150;

  // Render SVG with lined exam paper, college header, handwritten student details and code
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="paperGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fffdfa"/>
        <stop offset="100%" stop-color="#fdfbf7"/>
      </linearGradient>
      <filter id="inkRoughness">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
      </filter>
    </defs>

    <!-- Paper Sheet Background -->
    <rect width="${width}" height="${height}" fill="url(#paperGrad)" />

    <!-- Outer Paper Border and Shadow -->
    <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#e2d9cc" stroke-width="2" />

    <!-- Lined Paper Lines -->
    ${Array.from({ length: 28 })
      .map((_, i) => {
        const y = 220 + i * 32;
        return `<line x1="60" y1="${y}" x2="${width - 60}" y2="${y}" stroke="#e0e7f1" stroke-width="1.2" />`;
      })
      .join('\n')}

    <!-- Red Margin Line -->
    <line x1="160" y1="120" x2="160" y2="${height - 60}" stroke="#fca5a5" stroke-width="1.5" stroke-dasharray="0" />

    <!-- University Exam Header -->
    <rect x="60" y="40" width="${width - 120}" height="70" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="80" y="68" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="bold" fill="#0f172a">DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING</text>
    <text x="80" y="92" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" fill="#64748b">CS102: Data Structures &amp; Algorithms — Fall Midterm Exam</text>
    <text x="${width - 180}" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" fill="#475569">Room: AUD-3</text>

    <!-- Student Information Area (Top-Left) -->
    <rect x="60" y="125" width="480" height="75" rx="4" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
    <text x="75" y="146" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#64748b" text-transform="uppercase">Candidate Information</text>

    <!-- Handwritten Student Details -->
    <text x="75" y="172" font-family="'Caveat', cursive" font-size="25" font-weight="700" fill="#1e3a8a">Name: Alex Chen</text>
    <text x="260" y="172" font-family="'Caveat', cursive" font-size="22" font-weight="700" fill="#1e3a8a">Email: alex.chen@university.edu</text>
    <text x="75" y="193" font-family="'Caveat', cursive" font-size="19" font-weight="600" fill="#334155">Student ID: 2026-CS-8841</text>

    <!-- Question Prompt -->
    <text x="175" y="246" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#1e293b">Question 1 (100 Points):</text>
    <text x="175" y="270" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" fill="#475569">Write a Python function find_max(arr) that returns the maximum value in an array of integers.</text>

    <!-- Handwritten Student Code in Caveat cursive / ink style -->
    <g id="handwritten-code" fill="#1e3a8a" font-family="'Caveat', cursive" font-size="28" font-weight="700" filter="url(#inkRoughness)">
      <!-- Line 1 -->
      <text x="175" y="348">def find_max(arr):</text>

      <!-- Line 2: Redundant Code (temp = 0) -->
      <text x="220" y="380">temp = 0</text>

      <!-- Line 3: Correct initialization -->
      <text x="220" y="412">max_value = arr[0]</text>

      <!-- Line 4: Correct loop -->
      <text x="220" y="444">for x in arr:</text>

      <!-- Line 5: Logical Error (< instead of >) -->
      <text x="265" y="476">if x &lt; max_value:</text>

      <!-- Line 6: Indented assignment -->
      <text x="310" y="508">max_value = x</text>

      <!-- Line 7: Spelling Error (retum instead of return) -->
      <text x="220" y="540">retum max_value</text>
    </g>

    <!-- Lecturer Marking Stamp placeholder area -->
    <rect x="${width - 240}" y="125" width="180" height="75" rx="4" fill="#fafaf9" stroke="#d6d3d1" stroke-dasharray="4 4" />
    <text x="${width - 225}" y="152" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#a8a29e">EXAMINER STAMP</text>
    <text x="${width - 225}" y="180" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#d6d3d1">Grading rubric verified</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Pre-configured EasyOCR tokens for the demo exam with accurate bounding boxes aligned to SVG coordinates
export const DEMO_OCR_TOKENS: OCRToken[] = [
  // Student Metadata Tokens (Top Area)
  {
    id: 'tok_name_label',
    text: 'Name:',
    confidence: 0.98,
    boundingBox: { x: 74, y: 152, width: 62, height: 26 },
    lineNumber: 0,
    lineIndex: 0,
    isStudentInfo: true,
    studentInfoType: 'name'
  },
  {
    id: 'tok_name_val1',
    text: 'Alex',
    confidence: 0.96,
    boundingBox: { x: 140, y: 151, width: 48, height: 28 },
    lineNumber: 0,
    lineIndex: 1,
    isStudentInfo: true,
    studentInfoType: 'name'
  },
  {
    id: 'tok_name_val2',
    text: 'Chen',
    confidence: 0.95,
    boundingBox: { x: 192, y: 151, width: 54, height: 28 },
    lineNumber: 0,
    lineIndex: 2,
    isStudentInfo: true,
    studentInfoType: 'name'
  },
  {
    id: 'tok_email_label',
    text: 'Email:',
    confidence: 0.97,
    boundingBox: { x: 260, y: 153, width: 56, height: 25 },
    lineNumber: 0,
    lineIndex: 3,
    isStudentInfo: true,
    studentInfoType: 'email'
  },
  {
    id: 'tok_email_val',
    text: 'alex.chen@university.edu',
    confidence: 0.94,
    boundingBox: { x: 320, y: 152, width: 200, height: 26 },
    lineNumber: 0,
    lineIndex: 4,
    isStudentInfo: true,
    studentInfoType: 'email'
  },

  // Line 1: def find_max(arr):
  {
    id: 'tok_l1_1',
    text: 'def',
    interpretedText: 'def',
    confidence: 0.97,
    boundingBox: { x: 174, y: 324, width: 44, height: 32 },
    lineNumber: 1,
    lineIndex: 0
  },
  {
    id: 'tok_l1_2',
    text: 'find_max(arr):',
    interpretedText: 'find_max(arr):',
    confidence: 0.95,
    boundingBox: { x: 224, y: 324, width: 172, height: 32 },
    lineNumber: 1,
    lineIndex: 1
  },

  // Line 2: temp = 0 (Redundant code)
  {
    id: 'tok_l2_1',
    text: 'temp',
    interpretedText: 'temp',
    confidence: 0.94,
    boundingBox: { x: 218, y: 356, width: 60, height: 32 },
    lineNumber: 2,
    lineIndex: 0
  },
  {
    id: 'tok_l2_2',
    text: '=',
    interpretedText: '=',
    confidence: 0.96,
    boundingBox: { x: 284, y: 358, width: 22, height: 28 },
    lineNumber: 2,
    lineIndex: 1
  },
  {
    id: 'tok_l2_3',
    text: '0',
    interpretedText: '0',
    confidence: 0.98,
    boundingBox: { x: 312, y: 356, width: 20, height: 32 },
    lineNumber: 2,
    lineIndex: 2
  },

  // Line 3: max_value = arr[0] (Correct section)
  {
    id: 'tok_l3_1',
    text: 'max_value',
    interpretedText: 'max_value',
    confidence: 0.96,
    boundingBox: { x: 218, y: 388, width: 130, height: 32 },
    lineNumber: 3,
    lineIndex: 0
  },
  {
    id: 'tok_l3_2',
    text: '=',
    interpretedText: '=',
    confidence: 0.98,
    boundingBox: { x: 354, y: 390, width: 22, height: 28 },
    lineNumber: 3,
    lineIndex: 1
  },
  {
    id: 'tok_l3_3',
    text: 'arr[0]',
    interpretedText: 'arr[0]',
    confidence: 0.94,
    boundingBox: { x: 382, y: 388, width: 75, height: 32 },
    lineNumber: 3,
    lineIndex: 2
  },

  // Line 4: for x in arr: (Correct section)
  {
    id: 'tok_l4_1',
    text: 'for',
    interpretedText: 'for',
    confidence: 0.97,
    boundingBox: { x: 218, y: 420, width: 42, height: 32 },
    lineNumber: 4,
    lineIndex: 0
  },
  {
    id: 'tok_l4_2',
    text: 'x',
    interpretedText: 'x',
    confidence: 0.93,
    boundingBox: { x: 266, y: 422, width: 20, height: 30 },
    lineNumber: 4,
    lineIndex: 1
  },
  {
    id: 'tok_l4_3',
    text: 'in',
    interpretedText: 'in',
    confidence: 0.96,
    boundingBox: { x: 292, y: 420, width: 32, height: 32 },
    lineNumber: 4,
    lineIndex: 2
  },
  {
    id: 'tok_l4_4',
    text: 'arr:',
    interpretedText: 'arr:',
    confidence: 0.95,
    boundingBox: { x: 330, y: 420, width: 55, height: 32 },
    lineNumber: 4,
    lineIndex: 3
  },

  // Line 5: if x < max_value: (Logical Error)
  {
    id: 'tok_l5_1',
    text: 'if',
    interpretedText: 'if',
    confidence: 0.97,
    boundingBox: { x: 264, y: 452, width: 26, height: 32 },
    lineNumber: 5,
    lineIndex: 0
  },
  {
    id: 'tok_l5_2',
    text: 'x',
    interpretedText: 'x',
    confidence: 0.94,
    boundingBox: { x: 296, y: 454, width: 20, height: 30 },
    lineNumber: 5,
    lineIndex: 1
  },
  {
    id: 'tok_l5_3',
    text: '<',
    interpretedText: '<',
    confidence: 0.89, // Slightly lower confidence highlighting handwriting ambiguity
    boundingBox: { x: 322, y: 452, width: 24, height: 32 },
    lineNumber: 5,
    lineIndex: 2
  },
  {
    id: 'tok_l5_4',
    text: 'max_value:',
    interpretedText: 'max_value:',
    confidence: 0.95,
    boundingBox: { x: 352, y: 452, width: 140, height: 32 },
    lineNumber: 5,
    lineIndex: 3
  },

  // Line 6: max_value = x
  {
    id: 'tok_l6_1',
    text: 'max_value',
    interpretedText: 'max_value',
    confidence: 0.96,
    boundingBox: { x: 308, y: 484, width: 130, height: 32 },
    lineNumber: 6,
    lineIndex: 0
  },
  {
    id: 'tok_l6_2',
    text: '=',
    interpretedText: '=',
    confidence: 0.98,
    boundingBox: { x: 444, y: 486, width: 22, height: 28 },
    lineNumber: 6,
    lineIndex: 1
  },
  {
    id: 'tok_l6_3',
    text: 'x',
    interpretedText: 'x',
    confidence: 0.95,
    boundingBox: { x: 472, y: 484, width: 22, height: 32 },
    lineNumber: 6,
    lineIndex: 2
  },

  // Line 7: retum max_value (Spelling Error: retum -> return)
  {
    id: 'tok_l7_1',
    text: 'retum',
    interpretedText: 'return',
    confidence: 0.91,
    boundingBox: { x: 218, y: 516, width: 70, height: 32 },
    lineNumber: 7,
    lineIndex: 0
  },
  {
    id: 'tok_l7_2',
    text: 'max_value',
    interpretedText: 'max_value',
    confidence: 0.96,
    boundingBox: { x: 294, y: 516, width: 130, height: 32 },
    lineNumber: 7,
    lineIndex: 1
  }
];

export const DEMO_RECONSTRUCTED_CODE: ReconstructedCode = {
  rawText: `def find_max(arr):
    temp = 0
    max_value = arr[0]
    for x in arr:
        if x < max_value:
            max_value = x
    retum max_value`,
  interpretedText: `def find_max(arr):
    temp = 0
    max_value = arr[0]
    for x in arr:
        if x < max_value:
            max_value = x
    return max_value`,
  lines: [
    {
      lineNumber: 1,
      text: 'def find_max(arr):',
      interpretedText: 'def find_max(arr):',
      tokenIds: ['tok_l1_1', 'tok_l1_2'],
      indentation: 0
    },
    {
      lineNumber: 2,
      text: '    temp = 0',
      interpretedText: '    temp = 0',
      tokenIds: ['tok_l2_1', 'tok_l2_2', 'tok_l2_3'],
      indentation: 4
    },
    {
      lineNumber: 3,
      text: '    max_value = arr[0]',
      interpretedText: '    max_value = arr[0]',
      tokenIds: ['tok_l3_1', 'tok_l3_2', 'tok_l3_3'],
      indentation: 4
    },
    {
      lineNumber: 4,
      text: '    for x in arr:',
      interpretedText: '    for x in arr:',
      tokenIds: ['tok_l4_1', 'tok_l4_2', 'tok_l4_3', 'tok_l4_4'],
      indentation: 4
    },
    {
      lineNumber: 5,
      text: '        if x < max_value:',
      interpretedText: '        if x < max_value:',
      tokenIds: ['tok_l5_1', 'tok_l5_2', 'tok_l5_3', 'tok_l5_4'],
      indentation: 8
    },
    {
      lineNumber: 6,
      text: '            max_value = x',
      interpretedText: '            max_value = x',
      tokenIds: ['tok_l6_1', 'tok_l6_2', 'tok_l6_3'],
      indentation: 12
    },
    {
      lineNumber: 7,
      text: '    retum max_value',
      interpretedText: '    return max_value',
      tokenIds: ['tok_l7_1', 'tok_l7_2'],
      indentation: 4
    }
  ]
};

// Generates a complete realistic initial demo exam submission with the 4 intentional problems:
// 1. One correct section (initialization & loop)
// 2. One logical error (inverted comparison: < max_value)
// 3. One spelling error (retum instead of return)
// 4. One redundant line (temp = 0)
export function createDemoSubmission(): ExamSubmission {
  const exercise = DEFAULT_EXERCISES[0];
  const rubric = DEFAULT_RUBRIC;
  const imageUrl = generateDemoExamImage();

  const detectedErrors = [
    {
      id: 'err_demo_logical_1',
      type: 'logical' as const,
      severity: 'high' as const,
      description: 'תנאי הפוך במציאת המקסימום (< במקום >)',
      explanation: 'הלולאה מעדכנת את המשתנה כאשר האיבר קטן ממש מהמקסימום (x < max_value). כתוצאה מכך, הפונקציה מוצאת בפועל את המינימום במקום המקסימום.',
      location: {
        line: 5,
        tokenIds: ['tok_l5_1', 'tok_l5_2', 'tok_l5_3', 'tok_l5_4'],
        boundingBoxes: [
          { x: 264, y: 452, width: 26, height: 32 },
          { x: 296, y: 454, width: 20, height: 30 },
          { x: 322, y: 452, width: 24, height: 32 },
          { x: 352, y: 452, width: 140, height: 32 }
        ],
        codeSnippet: 'if x < max_value:'
      },
      confidence: 0.96,
      affectsGrade: true,
      deduction: 10,
      origin: 'ai_detected' as const,
      status: 'accepted' as const,
      expectedBehavior: 'התנאי צריך לבדוק האם האיבר הנוכחי גדול מהמקסימום: `if x > max_value:`',
      suggestedCorrection: 'if x > max_value:\n    max_value = x'
    },
    {
      id: 'err_demo_spelling_1',
      type: 'spelling' as const,
      severity: 'medium' as const,
      description: 'שגיאת איות במילת מפתח: "retum" במקום "return"',
      explanation: 'מילת המפתח להחזרת ערך נכתבה כ-retum. כוונת הסטודנט ברורה, אך בפייתון מילה זו תגרום לשגיאת הרצה מסוג NameError.',
      location: {
        line: 7,
        tokenIds: ['tok_l7_1'],
        boundingBoxes: [{ x: 218, y: 516, width: 70, height: 32 }],
        codeSnippet: 'retum max_value'
      },
      confidence: 0.93,
      affectsGrade: true,
      deduction: 1,
      origin: 'ai_detected' as const,
      status: 'accepted' as const,
      expectedBehavior: 'איות תקין של מילת המפתח: `return max_value`',
      suggestedCorrection: 'return max_value'
    },
    {
      id: 'err_demo_redundant_1',
      type: 'redundant' as const,
      severity: 'low' as const,
      description: 'הגדרת משתנה מיותר (קוד מת)',
      explanation: 'המשתנה temp מאותחל ל-0 בשורה 2 אך אינו נקרא או משתנה בשום שלב בהמשך הפונקציה. זהו קוד בלתי נחוץ.',
      location: {
        line: 2,
        tokenIds: ['tok_l2_1', 'tok_l2_2', 'tok_l2_3'],
        boundingBoxes: [
          { x: 218, y: 356, width: 60, height: 32 },
          { x: 284, y: 358, width: 22, height: 28 },
          { x: 312, y: 356, width: 20, height: 32 }
        ],
        codeSnippet: 'temp = 0'
      },
      confidence: 0.91,
      affectsGrade: true,
      deduction: 2,
      origin: 'ai_detected' as const,
      status: 'accepted' as const,
      expectedBehavior: 'השמטת שורת האתחול המיותרת.',
      suggestedCorrection: '# מחיקת שורה זו'
    }
  ];

  const gradingResult = calculateGrade(exercise.maxGrade, rubric, detectedErrors);

  return {
    id: 'sub_demo_001',
    exerciseId: exercise.id,
    studentInfo: {
      name: 'אלכס חן',
      email: 'alex.chen@university.edu',
      confidence: 0.96,
      extractedFromOCR: true
    },
    imageUrl,
    imageDimensions: { width: 900, height: 1150 },
    ocrTokens: DEMO_OCR_TOKENS,
    reconstructedCode: DEMO_RECONSTRUCTED_CODE,
    detectedErrors,
    rubric,
    gradingResult,
    codeQualitySummary: 'הסטודנט זיהה נכון את הצורך במעבר יחיד על המערך ואיתחל כראוי את המקסימום ב-arr[0]. עם זאת, סימן ההשוואה נהפך (< במקום >), ונצפתה שגיאת איות במילת החזרה.',
    alternativeSolutionNotes: 'הסטודנט השתמש באיטרציה ישירה `for x in arr:` שהיא תקינה ומומלצת בפייתון.',
    ocrUncertainties: [
      'בשורה 5 הסימן "<" זוהה ברמת ביטחון 0.89 עקב סלסול בכתב היד; אומת כסימן "קטן מ-".',
      'בשורה 7 מילת המפתח נכתבה עם חיבור אותיות בין "m" ל-"rn"; סווג כ-"retum".'
    ],
    ocrEngine: 'EasyOCR (מודל אנגלי v1.7.0)',
    status: 'reviewed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export const DEMO_SUBMISSION: ExamSubmission = createDemoSubmission();

