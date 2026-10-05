import React, { useState } from 'react';
import {
  Exercise,
  GradingRubric,
  ExamSubmission,
  WorkflowStep,
  DetectedError,
  StudentInfo
} from './types';
import { DEFAULT_EXERCISES, DEFAULT_RUBRIC, createEmptySubmission } from './data/defaults';
import { calculateGrade } from './services/gradingEngine';
import { runEasyOCR } from './services/ocrService';
import { reconstructCodeFromTokens } from './services/codeReconstruction';
import { analyzeStudentCode } from './services/aiService';

// UI Components
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { Dashboard } from './components/Dashboard';
import { ExerciseSetup } from './components/ExerciseSetup';
import { RubricSetup } from './components/RubricSetup';
import { ImageUpload } from './components/ImageUpload';
import { OcrProcessingStage } from './components/OcrProcessingStage';
import { TeacherReviewScreen } from './components/TeacherReviewScreen';
import { TeacherReport } from './components/TeacherReport';
import { StudentReport } from './components/StudentReport';
import { SettingsModal } from './components/SettingsModal';
import { AllExamsScreen } from './components/AllExamsScreen';

export const App: React.FC = () => {
  // Navigation tabs: dashboard | exercise | rubric | grade | reports | all_exams
  const [activeTab, setActiveTab] = useState<'dashboard' | 'exercise' | 'rubric' | 'grade' | 'reports' | 'all_exams'>('dashboard');

  // Active exam session state - tabs are contextual to an exam
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [isRubricUnlocked, setIsRubricUnlocked] = useState<boolean>(false);

  // Workflow stepper stage
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('exercise');
  const [completedSteps, setCompletedSteps] = useState<WorkflowStep[]>(['exercise', 'rubric']);

  // Core configuration states
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(DEFAULT_EXERCISES[0].id);
  const [rubric, setRubric] = useState<GradingRubric>(DEFAULT_RUBRIC);

  // Active submission and saved list - starts empty for real exam case only
  const [submission, setSubmission] = useState<ExamSubmission>(() =>
    createEmptySubmission(DEFAULT_EXERCISES[0].id, DEFAULT_EXERCISES[0].maxGrade, DEFAULT_RUBRIC)
  );
  const [submissionsList, setSubmissionsList] = useState<ExamSubmission[]>([]);

  // Loading states
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  // Report view mode
  const [reportType, setReportType] = useState<'teacher' | 'student'>('teacher');

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentExercise =
    exercises.find((e) => e.id === selectedExerciseId) || exercises[0];

  // Helper to mark a step completed and advance
  const completeStep = (step: WorkflowStep, nextStep?: WorkflowStep) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
    if (nextStep) {
      setWorkflowStep(nextStep);
    }
  };

  // Lecturer clicks "הגדרת מבחן חדש" from the Home page
  const handleNewExam = () => {
    const newEx: Exercise = {
      id: `ex_${Date.now()}`,
      title: '',
      language: 'python',
      maxGrade: 100,
      description: '',
      referenceSolution: '',
      expectedAlgorithmExplanation: '',
      testCases: [],
      createdAt: new Date().toISOString()
    };
    setExercises((prev) => [newEx, ...prev]);
    setSelectedExerciseId(newEx.id);
    setSubmission(createEmptySubmission(newEx.id, newEx.maxGrade, rubric));
    setIsExamActive(true);
    setIsRubricUnlocked(false); // Rubric locked until exam is defined/saved
    setActiveTab('exercise');
    setWorkflowStep('exercise');
  };

  // Open an existing submission from the recent exams list
  const handleOpenSubmission = (sub: ExamSubmission) => {
    setSubmission(sub);
    setSelectedExerciseId(sub.exerciseId);
    setIsExamActive(true);
    setIsRubricUnlocked(true);
    setActiveTab('grade');
    setWorkflowStep('review');
  };

  // Lecturer clicks "לכל המבחנים הקודמים"
  const handleViewAllExams = () => {
    setActiveTab('all_exams');
    setIsExamActive(false);
  };

  // Lecturer clicks "בדוק מחברת למבחן זה" from All Exams list
  const handleSelectExamToGrade = (exId: string) => {
    setSelectedExerciseId(exId);
    const chosenEx = exercises.find((e) => e.id === exId) || exercises[0];
    setSubmission(createEmptySubmission(chosenEx.id, chosenEx.maxGrade, rubric));
    setIsExamActive(true);
    setIsRubricUnlocked(true);
    setActiveTab('grade');
    setWorkflowStep('upload');
  };

  // Lecturer clicks "הגדרות ומחוון" from All Exams list
  const handleEditExam = (exId: string) => {
    setSelectedExerciseId(exId);
    setIsExamActive(true);
    setIsRubricUnlocked(true);
    setActiveTab('exercise');
    setWorkflowStep('exercise');
  };

  // Go to Home page (triggered by clicking the logo or home button)
  const handleGoHome = () => {
    setActiveTab('dashboard');
    setIsExamActive(false);
  };

  // User uploaded / replaced an exam image
  const handleImageSelected = (imageDataUrl: string, dimensions: { width: number; height: number }) => {
    setSubmission((prev) => ({
      ...prev,
      imageUrl: imageDataUrl,
      imageDimensions: dimensions,
      ocrTokens: [],
      detectedErrors: [],
      reconstructedCode: { rawText: '', interpretedText: '', lines: [] },
      gradingResult: calculateGrade(currentExercise.maxGrade, [], rubric)
    }));
  };

  // Student info updated
  const handleStudentInfoChanged = (info: StudentInfo) => {
    setSubmission((prev) => ({
      ...prev,
      studentInfo: info
    }));
  };

  // Run OCR on student exam image
  const handleProceedToOcr = async () => {
    setIsProcessingOcr(true);
    setWorkflowStep('ocr');

    try {
      const ocrResult = await runEasyOCR(submission.imageUrl, submission.imageDimensions);

      // Reconstruct initial code
      const reconstructed = reconstructCodeFromTokens(ocrResult.tokens);

      setSubmission((prev) => ({
        ...prev,
        ocrTokens: ocrResult.tokens,
        studentInfo: ocrResult.studentInfo,
        reconstructedCode: reconstructed,
        ocrEngine: ocrResult.engine
      }));

      completeStep('upload');
      completeStep('ocr');
    } catch (err) {
      console.error('OCR processing error:', err);
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // Run AI Code Analysis with Gemini
  const handleRunAiAnalysis = async () => {
    setIsProcessingAi(true);

    try {
      const aiResult = await analyzeStudentCode(
        currentExercise,
        rubric,
        submission.reconstructedCode,
        submission.ocrTokens,
        submission.studentInfo
      );

      // Calculate initial deterministic grade
      const gradingResult = calculateGrade(
        currentExercise.maxGrade,
        aiResult.errors,
        rubric
      );

      setSubmission((prev) => ({
        ...prev,
        detectedErrors: aiResult.errors,
        gradingResult,
        codeQualitySummary: aiResult.codeQualitySummary,
        alternativeSolutionNotes: aiResult.alternativeSolutionNotes,
        ocrUncertainties: aiResult.ocrUncertainties
      }));

      completeStep('analysis');
      completeStep('review');
      setWorkflowStep('review');
    } catch (err) {
      console.error('AI Analysis failed:', err);
      // Fall back to review
      completeStep('analysis');
      setWorkflowStep('review');
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Lecturer updates errors (accept, ignore, edit, delete, add)
  const handleUpdateErrors = (updatedErrors: DetectedError[]) => {
    const updatedGrading = calculateGrade(
      currentExercise.maxGrade,
      updatedErrors,
      rubric
    );

    setSubmission((prev) => ({
      ...prev,
      detectedErrors: updatedErrors,
      gradingResult: updatedGrading
    }));
  };

  // Save submission to recent exams list
  const handleSaveSubmission = () => {
    setSubmissionsList((prev) => {
      const idx = prev.findIndex((s) => s.id === submission.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = submission;
        return next;
      }
      return [submission, ...prev];
    });
  };

  // View reports from Dashboard or Review Screen
  const handleViewReport = (sub: ExamSubmission, type: 'teacher' | 'student') => {
    setSubmission(sub);
    setSelectedExerciseId(sub.exerciseId);
    setReportType(type);
    setIsExamActive(true);
    setIsRubricUnlocked(true);
    setActiveTab('reports');
    setWorkflowStep('reports');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'exercise') setWorkflowStep('exercise');
          if (tab === 'rubric') setWorkflowStep('rubric');
          if (tab === 'grade') {
            if (workflowStep === 'exercise' || workflowStep === 'rubric') {
              setWorkflowStep('upload');
            }
          }
          if (tab === 'reports') setWorkflowStep('reports');
        }}
        onGoHome={handleGoHome}
        isExamActive={isExamActive && activeTab !== 'dashboard' && activeTab !== 'all_exams'}
        activeExamTitle={currentExercise?.title}
        isRubricUnlocked={isRubricUnlocked}
        hasSubmissionForReports={
          Boolean(
            submission.detectedErrors.length > 0 ||
            submission.ocrTokens.length > 0 ||
            completedSteps.includes('review') ||
            completedSteps.includes('reports') ||
            submissionsList.length > 0
          )
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 4-Stage Stepper (Shown when in 'grade' tab) */}
      {activeTab === 'grade' && (
        <Stepper
          currentStep={workflowStep}
          onStepClick={(step) => setWorkflowStep(step)}
          completedSteps={completedSteps}
        />
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col">
        {/* DASHBOARD TAB (HOME) */}
        {activeTab === 'dashboard' && (
          <Dashboard
            recentSubmissions={submissionsList}
            exercises={exercises}
            onNewExam={handleNewExam}
            onViewAllExams={handleViewAllExams}
            onOpenSubmission={handleOpenSubmission}
            onViewSubmissionReport={handleViewReport}
          />
        )}

        {/* ALL PREVIOUS EXAMS ARCHIVE */}
        {activeTab === 'all_exams' && (
          <AllExamsScreen
            exercises={exercises}
            submissions={submissionsList}
            onNewExam={handleNewExam}
            onSelectExamToGrade={handleSelectExamToGrade}
            onEditExam={handleEditExam}
            onOpenSubmission={handleOpenSubmission}
            onViewSubmissionReport={handleViewReport}
            onGoHome={handleGoHome}
          />
        )}

        {/* EXERCISES TAB */}
        {activeTab === 'exercise' && (
          <ExerciseSetup
            exercise={currentExercise}
            exercisesList={exercises}
            onSelectExercise={(ex) => {
              setSelectedExerciseId(ex.id);
              setSubmission((prev) => ({ ...prev, exerciseId: ex.id }));
              if (ex.title.trim().length > 0) {
                setIsRubricUnlocked(true);
              }
            }}
            onSaveExercise={(updatedEx) => {
              if (updatedEx.title.trim().length > 0) {
                setIsRubricUnlocked(true);
              }
              setExercises((prev) =>
                prev.map((e) => (e.id === updatedEx.id ? updatedEx : e))
              );
            }}
            onProceed={() => {
              setIsRubricUnlocked(true);
              completeStep('exercise', 'rubric');
              setActiveTab('rubric');
              setWorkflowStep('rubric');
            }}
          />
        )}

        {/* RUBRIC TAB */}
        {activeTab === 'rubric' && (
          <RubricSetup
            rubric={rubric}
            onSaveRubric={(updatedRubric) => {
              setRubric(updatedRubric);
              setSubmission((prev) => ({
                ...prev,
                rubric: updatedRubric,
                gradingResult: calculateGrade(
                  currentExercise.maxGrade,
                  prev.detectedErrors,
                  updatedRubric
                )
              }));
            }}
            onBack={() => setActiveTab('exercise')}
            onProceed={() => {
              completeStep('rubric', 'upload');
              setActiveTab('grade');
              setWorkflowStep('upload');
            }}
          />
        )}

        {/* GRADE TAB: PHASE 1 (UPLOAD & EXERCISE PICKER) */}
        {activeTab === 'grade' && (workflowStep === 'upload' || workflowStep === 'exercise' || workflowStep === 'rubric') && (
          <ImageUpload
            currentImage={submission.imageUrl}
            studentInfo={submission.studentInfo}
            exercises={exercises}
            selectedExerciseId={selectedExerciseId}
            onSelectExercise={(exId) => {
              setSelectedExerciseId(exId);
              setSubmission((prev) => ({ ...prev, exerciseId: exId }));
            }}
            onImageSelected={handleImageSelected}
            onStudentInfoChanged={handleStudentInfoChanged}
            onProceedToOcr={handleProceedToOcr}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {/* GRADE TAB: STEPS 4 & 5 (OCR EXTRACTION & BOUNDING BOX VISUALIZATION) */}
        {activeTab === 'grade' && (workflowStep === 'ocr' || workflowStep === 'analysis') && (
          <OcrProcessingStage
            submission={submission}
            isProcessingOcr={isProcessingOcr}
            isProcessingAi={isProcessingAi}
            onRunAiAnalysis={handleRunAiAnalysis}
            onBackToUpload={() => setWorkflowStep('upload')}
          />
        )}

        {/* GRADE TAB: STEP 6 & 7 (LECTURER 3-PANE REVIEW & DETERMINISTIC GRADING) */}
        {activeTab === 'grade' && (workflowStep === 'review' || workflowStep === 'grade') && (
          <TeacherReviewScreen
            submission={submission}
            onUpdateErrors={handleUpdateErrors}
            onSaveSubmission={handleSaveSubmission}
            onProceedToReports={() => {
              completeStep('review');
              completeStep('grade');
              setWorkflowStep('reports');
              setActiveTab('reports');
            }}
          />
        )}

        {/* REPORTS TAB / STEP 8 */}
        {(activeTab === 'reports' || (activeTab === 'grade' && workflowStep === 'reports')) && (
          <div className="flex-1 flex flex-col">
            {/* Report Mode Selector Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between print:hidden">
              <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">פורמט הדוח:</span>
                  <button
                    onClick={() => setReportType('teacher')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      reportType === 'teacher'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    דוח מרצה רשמי (ביקורת והורדות ניקוד)
                  </button>
                  <button
                    onClick={() => setReportType('student')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      reportType === 'student'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    דוח משוב לסטודנט (הסבר פדגוגי ותיקונים)
                  </button>
                </div>
              </div>
            </div>

            {reportType === 'teacher' ? (
              <TeacherReport
                submission={submission}
                exercise={currentExercise}
                onBackToReview={() => {
                  setActiveTab('grade');
                  setWorkflowStep('review');
                }}
              />
            ) : (
              <StudentReport
                submission={submission}
                exercise={currentExercise}
                onBackToReview={() => {
                  setActiveTab('grade');
                  setWorkflowStep('review');
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetDefaults={() => {
          setExercises(DEFAULT_EXERCISES);
          setRubric(DEFAULT_RUBRIC);
          setSubmission(
            createEmptySubmission(DEFAULT_EXERCISES[0].id, DEFAULT_EXERCISES[0].maxGrade, DEFAULT_RUBRIC)
          );
        }}
      />
    </div>
  );
};

export default App;
