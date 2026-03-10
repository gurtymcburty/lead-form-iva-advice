'use client';

import { FormTheme } from '@/config/forms';

interface ThankYouProps {
  theme: FormTheme;
}

export function ThankYou({ theme }: ThankYouProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="w-full max-w-[600px] text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <svg
            width="40"
            height="40"
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
          className="text-[32px] font-semibold mb-4"
          style={{ color: theme.textColor }}
        >
          Thank You!
        </h1>

        <p
          className="text-[18px] leading-[26px] mb-8"
          style={{ color: theme.subtitleColor }}
        >
          Your information has been submitted successfully. One of our qualified debt advisors will be in touch with you shortly to discuss your options.
        </p>

        <div
          className="p-6 rounded-lg text-left"
          style={{
            backgroundColor: `rgba(${theme.primaryColorRgb}, 0.08)`,
            border: `1px solid rgba(${theme.primaryColorRgb}, 0.2)`
          }}
        >
          <p className="text-[16px] font-semibold mb-3" style={{ color: theme.textColor }}>
            What happens next?
          </p>
          <ul className="space-y-2 text-[15px]" style={{ color: theme.subtitleColor }}>
            <li className="flex items-start gap-2">
              <span style={{ color: theme.primaryColor }}>1.</span>
              A debt specialist will call you within the next few hours
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: theme.primaryColor }}>2.</span>
              They will review your financial situation with you
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: theme.primaryColor }}>3.</span>
              You will receive a free, no-obligation assessment
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: theme.primaryColor }}>4.</span>
              You can ask any questions you have about debt solutions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
