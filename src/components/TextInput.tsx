'use client';

import { FormConfig } from '@/config/forms';
import { useState } from 'react';

interface TextInputProps {
  type: 'text' | 'email' | 'tel' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme: FormConfig['theme'];
  error?: string;
}

export function TextInput({ type, value, onChange, placeholder, theme, error }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full max-w-md">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg border-2 bg-transparent text-lg transition-all duration-200 outline-none"
        style={{
          borderColor: error ? '#ef4444' : focused ? theme.primaryColor : theme.optionBorderColor,
          color: theme.textColor,
        }}
        autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'off'}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
