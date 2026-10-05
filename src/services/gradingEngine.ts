import {
  DetectedError,
  GradingResult,
  GradingRubric,
  RubricCategoryKey,
  CategoryGradeBreakdown
} from '../types';

/**
 * Deterministic Grading Engine
 *
 * Enforces lecturer-defined rubrics with mathematical certainty:
 * 1. AI cannot override points.
 * 2. Ignored errors do not affect the grade.
 * 3. Inactive categories do not deduct points.
 * 4. Per-category maximum caps are strictly respected.
 * 5. Final grade is capped between 0 and maxGrade.
 */
export function calculateGrade(
  maxGrade: number,
  arg2: GradingRubric | DetectedError[],
  arg3: DetectedError[] | GradingRubric
): GradingResult {
  const rubric: GradingRubric = 'categories' in arg2 ? arg2 : (arg3 as GradingRubric);
  const errors: DetectedError[] = Array.isArray(arg2) ? arg2 : (arg3 as DetectedError[]);

  const categoryKeys: RubricCategoryKey[] = [
    'logical',
    'syntax',
    'spelling',
    'redundant',
    'incomplete',
    'efficiency',
    'other'
  ];

  let acceptedErrorsCount = 0;
  let ignoredErrorsCount = 0;
  let manuallyAddedCount = 0;

  // Group errors by category
  const categoryBreakdown: CategoryGradeBreakdown[] = categoryKeys.map((key) => {
    const config = rubric.categories[key];
    const categoryErrors = errors.filter((e) => e.type === key);

    // Filter to errors that actually count toward grade
    // An error affects grade IF:
    // - it is not ignored (status === 'accepted' or status === 'pending')
    // - its individual affectsGrade flag is true
    // - the category is enabled in the rubric
    // - the category config has affectsGrade === true
    const activeErrors = categoryErrors.filter(
      (e) => e.status !== 'ignored' && e.affectsGrade && (config?.enabled ?? true) && (config?.affectsGrade ?? true)
    );

    // Sum of deductions for this category
    const rawDeductions = activeErrors.reduce((sum, e) => sum + (Number(e.deduction) || 0), 0);

    const maxCap = config ? config.maxTotalDeduction : Infinity;
    const cappedDeductions = Math.min(rawDeductions, maxCap);
    const maxCapReached = rawDeductions > maxCap;

    return {
      category: key,
      categoryName: config?.name || key,
      color: config?.color || '#64748b',
      errorCount: categoryErrors.length,
      rawDeductions,
      cappedDeductions,
      maxCap,
      maxCapReached,
      affectsGrade: config ? (config.enabled && config.affectsGrade) : false,
      errors: categoryErrors
    };
  });

  // Track overall error counts
  errors.forEach((e) => {
    if (e.status === 'ignored') {
      ignoredErrorsCount++;
    } else {
      acceptedErrorsCount++;
    }

    if (e.origin === 'lecturer_manually_added') {
      manuallyAddedCount++;
    }
  });

  // Total deductions across all categories
  const totalDeductions = categoryBreakdown.reduce((sum, cat) => sum + cat.cappedDeductions, 0);

  // Final grade cannot be negative, max is maxGrade
  const finalGrade = Math.max(0, Math.min(maxGrade, maxGrade - totalDeductions));

  return {
    maxGrade,
    totalDeductions,
    finalGrade: Math.round(finalGrade * 10) / 10,
    categoryBreakdown,
    acceptedErrorsCount,
    ignoredErrorsCount,
    manuallyAddedCount
  };
}
