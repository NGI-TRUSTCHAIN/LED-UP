'use client';

import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  activeStep: number;
  onStepChange?: (step: number) => void;
}

export function StepIndicator({ steps, activeStep, onStepChange }: StepIndicatorProps) {
  return (
    <div className="w-full px-4">
      <div className="relative pt-10 pb-16">
        {/* Container for the lines */}
        <div className="absolute top-14 left-0 w-full h-2 flex items-center">
          {/* Background line */}
          <div className="w-full h-2 bg-transparent rounded-full absolute"></div>

          {/* Progress line */}
          <div
            className="h-2 bg-primary rounded-full absolute transition-all duration-300 ease-in-out top-1/2 mt-1"
            style={{
              width: `${Math.max((activeStep / (steps.length - 1)) * 100, 0)}%`,
            }}
          ></div>
        </div>

        {/* Step circles and labels */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Step Circle */}
              <button
                type="button"
                className={cn(
                  'relative z-20 flex items-center justify-center w-14 h-14 rounded-full border-4 shadow-md transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                  index < activeStep
                    ? 'bg-primary border-primary text-primary-foreground'
                    : index === activeStep
                    ? 'border-primary bg-white text-primary'
                    : 'border-gray-300 bg-white text-gray-500'
                )}
                onClick={() => onStepChange?.(index)}
                disabled={!onStepChange || index > activeStep + 1}
                aria-current={index === activeStep ? 'step' : undefined}
              >
                {index < activeStep ? (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : (
                  <span className="text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                )}
              </button>

              {/* Step Label */}
              <div className="mt-4 text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    index === activeStep ? 'text-primary font-bold' : 'text-gray-500'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block mt-1 max-w-[120px]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
