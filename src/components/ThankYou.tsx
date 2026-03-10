'use client';

import { FormConfig } from '@/config/forms';

interface ThankYouProps {
  theme: FormConfig['theme'];
}

export function ThankYou({ theme }: ThankYouProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="w-full max-w-2xl text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={theme.buttonTextColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </div>

        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ color: theme.textColor }}
        >
          Thank You!
        </h1>

        <p
          className="text-lg mb-6"
          style={{ color: theme.secondaryTextColor }}
        >
          Your information has been submitted successfully.
        </p>

        <p
          className="text-base"
          style={{ color: theme.secondaryTextColor }}
        >
          One of our qualified debt advisors will be in touch with you shortly
          to discuss your options and help you find the best solution for your situation.
        </p>

        <div
          className="mt-8 p-4 rounded-lg"
          style={{ backgroundColor: theme.optionHoverBg }}
        >
          <p className="text-sm" style={{ color: theme.textColor }}>
            <strong>What happens next?</strong>
          </p>
          <ul className="mt-2 text-sm text-left list-disc list-inside" style={{ color: theme.secondaryTextColor }}>
            <li>A debt specialist will call you within the next few hours</li>
            <li>They will review your financial situation</li>
            <li>You will receive a free, no-obligation assessment</li>
            <li>You can ask any questions you have about debt solutions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
