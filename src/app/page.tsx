'use client';

import { LeadForm } from '@/components/LeadForm';
import { formConfig } from '@/config/forms';

export default function Home() {
  return <LeadForm config={formConfig} />;
}
