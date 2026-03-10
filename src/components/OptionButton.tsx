'use client';

import { FormConfig, FormOption } from '@/config/forms';

interface OptionButtonProps {
  option: FormOption;
  selected: boolean;
  onClick: () => void;
  theme: FormConfig['theme'];
}

export function OptionButton({ option, selected, onClick, theme }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 text-left min-w-[140px]"
      style={{
        borderColor: selected ? theme.primaryColor : theme.optionBorderColor,
        backgroundColor: selected ? theme.optionHoverBg : 'transparent',
        color: theme.textColor,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = theme.optionHoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <span
        className="flex items-center justify-center w-6 h-6 rounded text-xs font-semibold shrink-0"
        style={{
          backgroundColor: selected ? theme.primaryColor : 'transparent',
          borderWidth: selected ? 0 : 1,
          borderStyle: 'solid',
          borderColor: theme.optionBorderColor,
          color: selected ? theme.buttonTextColor : theme.primaryColor,
        }}
      >
        {option.key}
      </span>
      <span className="font-medium">{option.label}</span>
    </button>
  );
}
