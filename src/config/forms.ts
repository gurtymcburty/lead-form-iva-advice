export type FieldType = 'multiple_choice' | 'text' | 'email' | 'tel' | 'number';

export interface FormOption {
  key: string;
  label: string;
  value: string;
}

export interface FormStep {
  id: string;
  question: string;
  helperText?: string;
  fieldType: FieldType;
  options?: FormOption[];
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    message?: string;
  };
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  secondaryTextColor: string;
  buttonColor: string;
  buttonTextColor: string;
  optionBorderColor: string;
  optionHoverBg: string;
}

export interface FormConfig {
  steps: FormStep[];
  theme: FormTheme;
}

export const formConfig: FormConfig = {
  steps: [
    {
      id: 'debt_amount',
      question: 'How much debt do you have in total?',
      helperText: 'Add all of your debts together to get the total amount',
      fieldType: 'multiple_choice',
      required: true,
      options: [
        { key: 'A', label: 'Less than £5000', value: 'under_5000' },
        { key: 'B', label: '£5001-£20,000', value: '5001_20000' },
        { key: 'C', label: '£20,001 or more', value: 'over_20000' },
        { key: 'D', label: 'Not Sure', value: 'not_sure' },
      ],
    },
    {
      id: 'creditors',
      question: 'How many companies do you owe money to?',
      helperText: 'Include all creditors such as credit cards, loans, and overdrafts',
      fieldType: 'multiple_choice',
      required: true,
      options: [
        { key: 'A', label: '1', value: '1' },
        { key: 'B', label: '2', value: '2' },
        { key: 'C', label: '3 or More', value: '3_or_more' },
        { key: 'D', label: 'Not sure', value: 'not_sure' },
      ],
    },
    {
      id: 'employment',
      question: 'What is your current employment status?',
      fieldType: 'multiple_choice',
      required: true,
      options: [
        { key: 'A', label: 'Employed', value: 'employed' },
        { key: 'B', label: 'Self-Employed', value: 'self_employed' },
        { key: 'C', label: 'Unemployed', value: 'unemployed' },
        { key: 'D', label: 'Retired', value: 'retired' },
      ],
    },
    {
      id: 'homeowner',
      question: 'Are you a homeowner?',
      fieldType: 'multiple_choice',
      required: true,
      options: [
        { key: 'A', label: 'Yes', value: 'yes' },
        { key: 'B', label: 'No', value: 'no' },
      ],
    },
    {
      id: 'name',
      question: 'What is your name?',
      helperText: 'We need this to prepare your free assessment',
      fieldType: 'text',
      placeholder: 'Enter your full name',
      required: true,
      validation: {
        minLength: 2,
        maxLength: 100,
        message: 'Please enter your full name',
      },
    },
    {
      id: 'email',
      question: 'What is your email address?',
      helperText: "We'll send your free debt assessment here",
      fieldType: 'email',
      placeholder: 'name@example.com',
      required: true,
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address',
      },
    },
    {
      id: 'phone',
      question: 'What is your phone number?',
      helperText: 'A qualified advisor will call you to discuss your options',
      fieldType: 'tel',
      placeholder: '07XXX XXXXXX',
      required: true,
      validation: {
        pattern: /^(\+44|0)[1-9][0-9]{8,10}$/,
        message: 'Please enter a valid UK phone number',
      },
    },
  ],
  theme: {
    primaryColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    secondaryTextColor: '#6b7280',
    buttonColor: '#10b981',
    buttonTextColor: '#ffffff',
    optionBorderColor: '#10b981',
    optionHoverBg: 'rgba(16, 185, 129, 0.1)',
  },
};
