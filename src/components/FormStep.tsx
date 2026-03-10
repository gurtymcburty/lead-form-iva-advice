'use client';

import { FormStep as FormStepType, FormTheme } from '@/config/forms';
import Image from 'next/image';

interface FormStepProps {
  step: FormStepType;
  stepIndex: number;
  totalSteps: number;
  value: string;
  answers: Record<string, string>;
  onChange: (value: string) => void;
  onNext: (overrideValue?: string) => void;
  onPrev: () => void;
  theme: FormTheme;
  error?: string;
  isSubmitting?: boolean;
}

export function FormStep({
  step,
  stepIndex,
  totalSteps,
  value,
  answers,
  onChange,
  onNext,
  onPrev,
  theme,
  error,
  isSubmitting,
}: FormStepProps) {
  const canGoBack = stepIndex > 0;
  const questionText = step.dynamicQuestion ? step.dynamicQuestion(answers) : step.question;

  // For consent question, show "See My Options" when accepted
  const isConsentAccepted = step.id === 'consent' && value === 'accept';
  const buttonText = isSubmitting
    ? 'Submitting...'
    : isConsentAccepted
      ? 'See My Options'
      : 'OK';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value && !isSubmitting) {
      e.preventDefault();
      onNext();
    }
  };

  // Handle option click - select and auto-advance immediately
  const handleOptionClick = (optionValue: string) => {
    onNext(optionValue);
  };

  const progressPercent = ((stepIndex + 1) / totalSteps) * 100;

  // Check if this is a choice-based question (multiple_choice or image_choice)
  const isChoiceQuestion = step.fieldType === 'multiple_choice' || step.fieldType === 'image_choice';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.backgroundColor }}>
      {/* Progress Bars */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Bar 1 - Page load indicator */}
        <div className="h-1 w-full progress-track">
          <div className="h-full w-full" style={{ backgroundColor: '#3D3D3D' }} />
        </div>
        {/* Bar 2 - Question progress */}
        <div className="h-[11px] flex items-center">
          <div className="h-[3px] w-full flex">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: theme.primaryColor
              }}
            />
            <div
              className="h-full flex-1"
              style={{ backgroundColor: `rgba(${theme.primaryColorRgb}, 0.4)` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div
        className="flex-1 flex items-center justify-center px-4 sm:px-20 pt-16 pb-24"
        onKeyDown={handleKeyDown}
      >
        <div className="w-full max-w-[880px] animate-fadeInUp">
          <fieldset className="border-0 p-0 m-0">
            {/* Question Title */}
            <legend className="flex items-start gap-2 mb-2">
              {/* Question Number Badge */}
              <span
                className="inline-flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{
                  backgroundColor: theme.primaryColor,
                  borderRadius: '5px 3px 3px 5px',
                  width: '16px',
                  height: '19px',
                  marginTop: '6px'
                }}
              >
                {stepIndex + 1}
              </span>
              <span
                className="text-[26px] font-normal leading-[34px]"
                style={{ color: theme.textColor }}
              >
                {questionText}
                {step.required && <span style={{ color: theme.primaryColor }}>*</span>}
              </span>
            </legend>

            {/* Helper Text */}
            {step.helperText && (
              <p
                className="text-[18px] font-normal leading-[24px] mt-2 mb-6 ml-6"
                style={{ color: theme.subtitleColor }}
              >
                {step.helperText}
              </p>
            )}

            {/* Helper HTML (for links) */}
            {step.helperHtml && (
              <p
                className="helper-html text-[18px] font-normal leading-[24px] mt-2 mb-6 ml-6"
                style={{ color: theme.subtitleColor }}
                dangerouslySetInnerHTML={{ __html: step.helperHtml }}
              />
            )}

            {/* Options or Input */}
            <div className="mt-4 ml-6">
              {step.fieldType === 'multiple_choice' && step.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {step.options.map((option) => {
                    const isSelected = value === option.value;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => handleOptionClick(option.value)}
                        className="choice-button flex items-center gap-2 px-[10px] py-[6px] rounded-lg text-left h-[44px]"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.6)',
                          boxShadow: isSelected
                            ? `${theme.primaryColor} 0px 0px 0px 2px`
                            : `rgba(${theme.primaryColorRgb}, 0.1) 0px 0px 0px 1px`,
                        }}
                      >
                        {/* Key Badge */}
                        <span
                          className="flex items-center justify-center w-6 h-6 rounded text-[12px] font-semibold shrink-0"
                          style={{
                            backgroundColor: isSelected ? theme.primaryColor : 'rgba(255, 255, 255, 0.4)',
                            color: isSelected ? '#FFFFFF' : theme.primaryColor,
                            border: isSelected
                              ? `1px solid ${theme.primaryColor}`
                              : `1px solid rgba(${theme.primaryColorRgb}, 0.24)`,
                            borderRadius: '4px',
                          }}
                        >
                          {option.key}
                        </span>
                        {/* Label */}
                        <span
                          className="text-[18px] font-normal leading-[24px]"
                          style={{ color: theme.primaryColor }}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {step.fieldType === 'image_choice' && step.options && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {step.options.map((option) => {
                    const isSelected = value === option.value;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => handleOptionClick(option.value)}
                        className="image-choice-card flex flex-col items-center p-3 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.6)',
                          boxShadow: isSelected
                            ? `${theme.primaryColor} 0px 0px 0px 2px`
                            : `rgba(${theme.primaryColorRgb}, 0.1) 0px 0px 0px 1px`,
                        }}
                      >
                        {/* Image */}
                        {option.imageUrl && (
                          <div className="w-[144px] h-[144px] relative mb-2">
                            <Image
                              src={option.imageUrl}
                              alt={option.label}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        )}
                        {/* Key Badge + Label */}
                        <div className="flex items-center gap-2 w-full">
                          <span
                            className="flex items-center justify-center w-6 h-6 rounded text-[12px] font-semibold shrink-0"
                            style={{
                              backgroundColor: isSelected ? theme.primaryColor : 'rgba(255, 255, 255, 0.4)',
                              color: isSelected ? '#FFFFFF' : theme.primaryColor,
                              border: isSelected
                                ? `1px solid ${theme.primaryColor}`
                                : `1px solid rgba(${theme.primaryColorRgb}, 0.24)`,
                              borderRadius: '4px',
                            }}
                          >
                            {option.key}
                          </span>
                          <span
                            className="text-[18px] font-normal leading-[24px]"
                            style={{ color: theme.primaryColor }}
                          >
                            {option.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {(step.fieldType === 'text' || step.fieldType === 'email' || step.fieldType === 'tel') && (
                <div className="max-w-[600px]">
                  <input
                    type={step.fieldType === 'tel' ? 'tel' : step.fieldType === 'email' ? 'email' : 'text'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={step.placeholder}
                    className="typeform-input w-full bg-transparent border-0 text-[26px] font-normal py-2 px-0 outline-none"
                    style={{
                      color: theme.inputTextColor,
                      boxShadow: `rgba(${theme.primaryColorRgb}, 0.3) 0px 1px 0px 0px`,
                    }}
                    autoComplete={step.fieldType === 'email' ? 'email' : step.fieldType === 'tel' ? 'tel' : 'off'}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                </div>
              )}
            </div>

            {/* OK Button - only show for text input fields, not for choice questions */}
            {!isChoiceQuestion && (
              <div className="mt-6 ml-6">
                <button
                  type="button"
                  onClick={() => onNext()}
                  disabled={!value || isSubmitting}
                  className="h-10 px-4 rounded-lg text-[14px] font-semibold transition-opacity"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: theme.buttonTextColor,
                    opacity: !value || isSubmitting ? 0.5 : 1,
                    cursor: !value || isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {buttonText}
                </button>
                <span className="ml-3 text-[13px]" style={{ color: theme.subtitleColor }}>
                  press <strong>Enter ↵</strong>
                </span>
              </div>
            )}
          </fieldset>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-6 right-6 flex">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoBack}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{
            borderRadius: '8px 2px 2px 8px',
            backgroundColor: canGoBack ? theme.primaryColor : 'transparent',
            color: canGoBack ? theme.buttonTextColor : theme.disabledNavColor,
            cursor: canGoBack ? 'pointer' : 'not-allowed',
          }}
          aria-label="Previous question"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18,15 12,9 6,15" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => onNext()}
          disabled={!value || isSubmitting}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{
            borderRadius: '2px 8px 8px 2px',
            backgroundColor: value && !isSubmitting ? theme.primaryColor : 'transparent',
            color: value && !isSubmitting ? theme.buttonTextColor : theme.disabledNavColor,
            cursor: value && !isSubmitting ? 'pointer' : 'not-allowed',
          }}
          aria-label="Next question"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </button>
      </div>
    </div>
  );
}
