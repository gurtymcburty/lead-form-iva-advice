'use client';

import { FormConfig, FormStep as FormStepType } from '@/config/forms';
import { OptionButton } from './OptionButton';
import { TextInput } from './TextInput';

interface FormStepProps {
  step: FormStepType;
  stepIndex: number;
  totalSteps: number;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  theme: FormConfig['theme'];
  error?: string;
  isSubmitting?: boolean;
}

export function FormStep({
  step,
  stepIndex,
  totalSteps,
  value,
  onChange,
  onNext,
  onPrev,
  theme,
  error,
  isSubmitting,
}: FormStepProps) {
  const isLastStep = stepIndex === totalSteps - 1;
  const canGoBack = stepIndex > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: theme.backgroundColor }}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-2xl">
        {/* Question number indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
            style={{ backgroundColor: theme.primaryColor, color: theme.buttonTextColor }}
          >
            {stepIndex + 1}
          </span>
          <span className="text-sm" style={{ color: theme.secondaryTextColor }}>
            of {totalSteps}
          </span>
        </div>

        {/* Question */}
        <h1
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{ color: theme.textColor }}
        >
          {step.question}
          {step.required && <span style={{ color: theme.primaryColor }}>*</span>}
        </h1>

        {/* Helper text */}
        {step.helperText && (
          <p className="text-base mb-6" style={{ color: theme.secondaryTextColor }}>
            {step.helperText}
          </p>
        )}

        {/* Options or Input */}
        <div className="mt-6">
          {step.fieldType === 'multiple_choice' && step.options ? (
            <div className="flex flex-wrap gap-3">
              {step.options.map((option) => (
                <OptionButton
                  key={option.key}
                  option={option}
                  selected={value === option.value}
                  onClick={() => {
                    onChange(option.value);
                    // Auto-advance for multiple choice after a brief delay
                    setTimeout(onNext, 300);
                  }}
                  theme={theme}
                />
              ))}
            </div>
          ) : (
            <TextInput
              type={step.fieldType as 'text' | 'email' | 'tel' | 'number'}
              value={value}
              onChange={onChange}
              placeholder={step.placeholder}
              theme={theme}
              error={error}
            />
          )}
        </div>

        {/* Submit/Next button for text inputs */}
        {step.fieldType !== 'multiple_choice' && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onNext}
              disabled={!value || isSubmitting}
              className="px-8 py-3 rounded-lg font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.buttonColor,
                color: theme.buttonTextColor,
              }}
            >
              {isSubmitting ? 'Submitting...' : isLastStep ? 'Submit' : 'OK'}
            </button>
            <span className="ml-3 text-sm" style={{ color: theme.secondaryTextColor }}>
              press <strong>Enter</strong>
            </span>
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      <div className="fixed bottom-6 right-6 flex gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoBack}
          className="w-10 h-10 rounded flex items-center justify-center transition-all duration-200 disabled:opacity-30"
          style={{
            backgroundColor: theme.optionHoverBg,
            color: theme.primaryColor,
          }}
          aria-label="Previous question"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18,15 12,9 6,15" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!value}
          className="w-10 h-10 rounded flex items-center justify-center transition-all duration-200 disabled:opacity-30"
          style={{
            backgroundColor: theme.primaryColor,
            color: theme.buttonTextColor,
          }}
          aria-label="Next question"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
