import { Exercise, GradingRubric, ExamSubmission } from '../types';
import { calculateGrade } from '../services/gradingEngine';

export const DEFAULT_EXERCISES: Exercise[] = [
  {
    id: 'ex_find_max',
    title: 'מציאת איבר מקסימלי במערך',
    description: 'כתבו פונקציה find_max(arr) המקבלת מערך מספרים שלמים ומחזירה את הערך המקסימלי. המערך מכיל לפחות איבר אחד.',
    language: 'python',
    maxGrade: 100,
    referenceSolution: `def find_max(arr):
    max_value = arr[0]
    for x in arr:
        if x > max_value:
            max_value = x
    return max_value`,
    expectedAlgorithmExplanation: 'אתחול משתנה לאיבר הראשון במערך. מעבר בלולאה על כל איבר ברשימה. אם האיבר גדול ממש מהמקסימום הנוכחי, עדכון המקסימום. בסיום החזרת ערך המקסימום (פתרונות שקולים לוגית כגון לולאת אינדקסים או פונקציות צמצום מתקבלים גם הם).',
    testCases: [
      { id: 'tc1', input: '[3, 7, 2, 9, 5]', expectedOutput: '9', explanation: 'מערך רגיל לא ממוין' },
      { id: 'tc2', input: '[-10, -3, -50]', expectedOutput: '-3', explanation: 'מערך של מספרים שליליים' },
      { id: 'tc3', input: '[42]', expectedOutput: '42', explanation: 'מערך בעל איבר בודד' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'ex_reverse_string',
    title: 'היפוך מחרוזת',
    description: 'כתבו פונקציה reverse_text(s) המקבלת מחרוזת ומחזירה את המחרוזת ההפוכה ללא שימוש בפונקציית היפוך מובנית.',
    language: 'python',
    maxGrade: 100,
    referenceSolution: `def reverse_text(s):
    res = ""
    for char in s:
        res = char + res
    return res`,
    expectedAlgorithmExplanation: 'מעבר בלולאה מהסוף להתחלה או בניית מחרוזת חדשה על ידי שרשור התו משמאל.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ex_is_palindrome',
    title: 'בדיקת פלינדרום (C++)',
    description: 'כתבו פונקציית C++ בשם isPalindrome(const std::string& str) המחזירה true אם המחרוזת היא פלינדרום ו-false אחרת.',
    language: 'cpp',
    maxGrade: 100,
    referenceSolution: `bool isPalindrome(const std::string& str) {
    int left = 0;
    int right = str.length() - 1;
    while (left < right) {
        if (str[left] != str[right]) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
    expectedAlgorithmExplanation: 'שיטת שני מצביעים המשווה תווים מהקצוות כלפי פנים.',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_RUBRIC: GradingRubric = {
  categories: {
    logical: {
      key: 'logical',
      name: 'שגיאה לוגית',
      enabled: true,
      affectsGrade: true,
      deductionPerError: 10,
      maxTotalDeduction: 50,
      description: 'התכנית אינה פותרת נכון את הבעיה (תנאי הפוך, אתחול שגוי, שגיאת off-by-one).',
      color: '#ef4444', // RED
      textColor: '#fee2e2'
    },
    syntax: {
      key: 'syntax',
      name: 'שגיאת תחביר (Syntax)',
      enabled: false,
      affectsGrade: false,
      deductionPerError: 0,
      maxTotalDeduction: 15,
      description: 'הפרת כללי תחביר השפה כגון נקודתיים חסרות או סוגריים. כבוי כברירת מחדל עבור מבחנים בכתב יד.',
      color: '#3b82f6', // BLUE
      textColor: '#dbeafe'
    },
    spelling: {
      key: 'spelling',
      name: 'שגיאת כתיב / מזהה (Spelling)',
      enabled: true,
      affectsGrade: true,
      deductionPerError: 1,
      maxTotalDeduction: 10,
      description: 'איות שגוי של מילת מפתח (כגון retum במקום return) או שמות משתנים לא עקביים.',
      color: '#f97316', // ORANGE
      textColor: '#ffedd5'
    },
    redundant: {
      key: 'redundant',
      name: 'קוד מיותר / בלתי נחוץ (Redundant)',
      enabled: true,
      affectsGrade: true,
      deductionPerError: 2,
      maxTotalDeduction: 10,
      description: 'קוד מת (Dead code), משתנים לא בשימוש או חישובים חוזרים ומיותרים.',
      color: '#eab308', // LIGHT YELLOW / AMBER
      textColor: '#fef9c3'
    },
    incomplete: {
      key: 'incomplete',
      name: 'פתרון חלקי / חסר',
      enabled: true,
      affectsGrade: true,
      deductionPerError: 15,
      maxTotalDeduction: 50,
      description: 'השמטת דרישות יסוד כגון אי-החזרת ערך או מקרי קצה שלא טופלו.',
      color: '#a855f7', // PURPLE
      textColor: '#f3e8ff'
    },
    efficiency: {
      key: 'efficiency',
      name: 'יעילות וסיבוכיות',
      enabled: false,
      affectsGrade: false,
      deductionPerError: 5,
      maxTotalDeduction: 20,
      description: 'סיבוכיות זמן/מקום לא מיטבית (לדוגמה O(N^2) כאשר נדרש O(N)).',
      color: '#06b6d4', // CYAN
      textColor: '#cffafe'
    },
    other: {
      key: 'other',
      name: 'הערה אחרת / אישית של המרצה',
      enabled: true,
      affectsGrade: true,
      deductionPerError: 2,
      maxTotalDeduction: 10,
      description: 'סימונים מותאמים אישית שהמרצה סימן ישירות על גבי הטופס.',
      color: '#64748b', // SLATE
      textColor: '#f1f5f9'
    }
  }
};

export const COLOR_MAP = {
  correct: '#10b981', // GREEN (Recognized code with no detected problem)
  spelling: '#f97316', // ORANGE (Spelling / identifier error)
  logical: '#ef4444', // RED (Logical error)
  redundant: '#eab308', // LIGHT YELLOW (Redundant code)
  syntax: '#3b82f6', // BLUE
  incomplete: '#a855f7', // PURPLE
  efficiency: '#06b6d4', // CYAN
  other: '#64748b', // SLATE
  neutral: '#6366f1' // INDIGO (before analysis)
};

export function createEmptySubmission(exerciseId: string, maxGrade: number, rubric: GradingRubric): ExamSubmission {
  return {
    id: `sub_${Date.now()}`,
    exerciseId,
    studentInfo: {
      name: '',
      email: '',
      confidence: 1,
      extractedFromOCR: false
    },
    imageUrl: '',
    imageDimensions: { width: 900, height: 1150 },
    ocrTokens: [],
    reconstructedCode: { rawText: '', interpretedText: '', lines: [] },
    detectedErrors: [],
    rubric,
    gradingResult: calculateGrade(maxGrade, [], rubric),
    ocrEngine: 'EasyOCR',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
