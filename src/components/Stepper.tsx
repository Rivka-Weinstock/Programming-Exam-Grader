import React from 'react';
import { WorkflowStep } from '../types';
import {
  UploadCloud,
  ScanText,
  UserCheck,
  FileCheck2,
  Check
} from 'lucide-react';

interface StepperProps {
  currentStep: WorkflowStep;
  onStepClick: (step: WorkflowStep) => void;
  completedSteps: WorkflowStep[];
}

interface StepDef {
  id: WorkflowStep;
  activeMatches: WorkflowStep[];
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STREAMLINED_STEPS: StepDef[] = [
  {
    id: 'upload',
    activeMatches: ['exercise', 'rubric', 'upload'],
    label: '1. העלאת מבחן',
    sublabel: 'בחירת שאלה ודף כתב יד',
    icon: UploadCloud
  },
  {
    id: 'ocr',
    activeMatches: ['ocr', 'analysis'],
    label: '2. פענוח וזיהוי EasyOCR',
    sublabel: 'קוביות תווים וניתוח לוגי',
    icon: ScanText
  },
  {
    id: 'review',
    activeMatches: ['review', 'grade'],
    label: '3. בדיקת מרצה וציינון',
    sublabel: 'סקירת 3 חלונות ואישור ניקוד',
    icon: UserCheck
  },
  {
    id: 'reports',
    activeMatches: ['reports'],
    label: '4. דוחות ומשוב',
    sublabel: 'דוח רשמי ומשוב פדגוגי',
    icon: FileCheck2
  }
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onStepClick,
  completedSteps
}) => {
  const getStepStatus = (step: StepDef, index: number) => {
    const isCurrent = step.activeMatches.includes(currentStep);
    const isCompleted = step.activeMatches.some((s) => completedSteps.includes(s));
    return { isCurrent, isCompleted };
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-3 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <nav aria-label="שלבי תהליך הבדיקה" className="flex items-center justify-between relative">
          {STREAMLINED_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const { isCurrent, isCompleted } = getStepStatus(step, idx);

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <button
                  onClick={() => onStepClick(step.id)}
                  className={`group flex items-center gap-3 py-1.5 px-3 rounded-xl transition-all text-right select-none ${
                    isCurrent
                      ? 'bg-indigo-600/15 border border-indigo-500/30'
                      : isCompleted
                      ? 'hover:bg-slate-800/60 cursor-pointer'
                      : 'hover:bg-slate-800/30 opacity-75 cursor-pointer'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : isCompleted
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="hidden sm:block">
                    <div
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                          ? 'text-emerald-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {step.sublabel}
                    </div>
                  </div>
                </button>

                {/* Connecting Line */}
                {idx < STREAMLINED_STEPS.length - 1 && (
                  <div className="flex-1 mx-2 sm:mx-4 h-0.5 bg-slate-800 hidden xs:block">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500/50' : 'bg-transparent'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
