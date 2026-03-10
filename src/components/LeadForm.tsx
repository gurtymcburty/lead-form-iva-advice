'use client';

import { useState, useCallback, useEffect } from 'react';
import { FormConfig, FormStep as FormStepType } from '@/config/forms';
import { FormStep } from './FormStep';
import { ThankYou } from './ThankYou';

interface LeadFormProps {
  config: FormConfig;
}

export function LeadForm({ config }: LeadFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [startTime] = useState(Date.now());

  const totalSteps = config.steps.length;
  const step = config.steps[currentStep];
  const currentValue = answers[step.id] || '';

  const validateStep = useCallback((stepConfig: FormStepType, value: string): string | null => {
    if (stepConfig.required && !value) {
      return 'This field is required';
    }

    // Email validation
    if (stepConfig.fieldType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Phone validation (UK)
    if (stepConfig.fieldType === 'tel') {
      const phoneRegex = /^(\+44|0)[1-9][0-9]{8,10}$/;
      const cleanPhone = value.replace(/\s/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return 'Please enter a valid UK phone number';
      }
    }

    // Name validation
    if (stepConfig.id === 'first_name' || stepConfig.id === 'last_name') {
      if (value.length < 2) {
        return 'Please enter at least 2 characters';
      }
    }

    return null;
  }, []);

  const handleChange = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
    // Clear error when user starts typing
    if (errors[step.id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[step.id];
        return next;
      });
    }
  }, [step.id, errors]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Security checks
      const timeOnForm = Date.now() - startTime;

      // Prepare submission data
      const formData = {
        answers,
        metadata: {
          timeOnForm,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString(),
        },
      };

      // Don't submit if honeypot is filled (bot detection)
      if (honeypot) {
        console.warn('Bot detected');
        setIsComplete(true);
        return;
      }

      // Don't submit if form was completed too fast (< 5 seconds)
      if (timeOnForm < 5000) {
        console.warn('Form submitted too quickly');
        setIsComplete(true);
        return;
      }

      // Check if user declined consent
      if (answers.consent === 'decline') {
        setErrors((prev) => ({
          ...prev,
          _form: 'You must accept the Privacy Policy and Terms to continue.',
        }));
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      setIsComplete(true);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors((prev) => ({
        ...prev,
        _form: error instanceof Error ? error.message : 'Failed to submit. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, honeypot, startTime]);

  const handleNext = useCallback(() => {
    const error = validateStep(step, currentValue);

    if (error) {
      setErrors((prev) => ({ ...prev, [step.id]: error }));
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, totalSteps, step, currentValue, validateStep, handleSubmit]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && currentStep > 0) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, handlePrev]);

  if (isComplete) {
    return <ThankYou theme={config.theme} />;
  }

  return (
    <>
      {/* Honeypot field - hidden from users, visible to bots */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Form error message */}
      {errors._form && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm z-50"
        >
          {errors._form}
        </div>
      )}

      <FormStep
        step={step}
        stepIndex={currentStep}
        totalSteps={totalSteps}
        value={currentValue}
        answers={answers}
        onChange={handleChange}
        onNext={handleNext}
        onPrev={handlePrev}
        theme={config.theme}
        error={errors[step.id]}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
