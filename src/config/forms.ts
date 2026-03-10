export type FieldType = 'multiple_choice' | 'image_choice' | 'text' | 'email' | 'tel';

export interface FormOption {
  key: string;
  label: string;
  value: string;
  imageUrl?: string;
}

export interface FormStep {
  id: string;
  question: string;
  dynamicQuestion?: (answers: Record<string, string>) => string;
  helperText?: string;
  helperHtml?: string;
  fieldType: FieldType;
  options?: FormOption[];
  placeholder?: string;
  required?: boolean;
}

export interface FormTheme {
  primaryColor: string;
  primaryColorRgb: string;
  backgroundColor: string;
  textColor: string;
  subtitleColor: string;
  inputTextColor: string;
  buttonTextColor: string;
  disabledNavColor: string;
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
      id: 'debt_count',
      question: 'How many debts do you have?',
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
      question: 'What is your employment status?',
      fieldType: 'image_choice',
      required: true,
      options: [
        { key: 'A', label: 'Employed', value: 'employed', imageUrl: 'https://images.typeform.com/images/D5zea7G2mCpQ' },
        { key: 'B', label: 'Self-Employed', value: 'self_employed', imageUrl: 'https://images.typeform.com/images/mFMxZB4J6jcY' },
        { key: 'C', label: 'Retired', value: 'retired', imageUrl: 'https://images.typeform.com/images/ySxvTpPb9tbX' },
        { key: 'D', label: 'Unemployed', value: 'unemployed', imageUrl: 'https://images.typeform.com/images/ZV5wVs6rGj6g' },
      ],
    },
    {
      id: 'email',
      question: 'What is your email address?',
      helperText: 'We only use this to email you details about possible solutions to your debt problem. You can unsubscribe at any time.',
      fieldType: 'email',
      placeholder: 'name@example.com',
      required: true,
    },
    {
      id: 'first_name',
      question: 'What is your first name?',
      fieldType: 'text',
      placeholder: 'Type your answer here...',
      required: true,
    },
    {
      id: 'last_name',
      question: ', what is your last name?',
      dynamicQuestion: (answers) => {
        const firstName = answers.first_name || '';
        return firstName ? `${firstName}, what is your last name?` : 'What is your last name?';
      },
      fieldType: 'text',
      placeholder: 'Type your answer here...',
      required: true,
    },
    {
      id: 'phone',
      question: ', what is your phone number?',
      dynamicQuestion: (answers) => {
        const firstName = answers.first_name || '';
        return firstName ? `${firstName}, what is your phone number?` : 'What is your phone number?';
      },
      helperText: 'We only use this if we need to speak to you about a possible solution to your finances. We do not share your number, in line with our Data Protection policies.',
      fieldType: 'tel',
      placeholder: '07400 123456',
      required: true,
    },
    {
      id: 'consent',
      question: 'Keeping Your Data Safe',
      helperHtml: 'By completing this form you are agreeing with our <a href="https://www.iva-advice.co/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a> and <a href="https://www.iva-advice.co/terms-and-conditions/" target="_blank" rel="noopener">Terms and Conditions</a>.',
      fieldType: 'multiple_choice',
      required: true,
      options: [
        { key: 'A', label: 'I accept', value: 'accept' },
        { key: 'B', label: "I don't accept", value: 'decline' },
      ],
    },
  ],
  theme: {
    primaryColor: '#0D9488',
    primaryColorRgb: '13, 148, 136',
    backgroundColor: '#FFFFFF',
    textColor: '#3D3D3D',
    subtitleColor: '#646464',
    inputTextColor: '#0D9488',
    buttonTextColor: '#E7F4F3',
    disabledNavColor: '#9ED4CF',
  },
};
