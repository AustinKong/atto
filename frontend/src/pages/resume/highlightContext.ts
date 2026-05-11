import { createContext, useContext } from 'react';

import type { ResumeHighlight, ResumePreviewHandle } from '@/components/custom/resume-preview';

export interface ResumeHighlightContextValue {
  highlight: (layerKey: string, highlights: ResumeHighlight[]) => void;
  clear: (layerKey: string) => void;
  registerPreview: (preview: ResumePreviewHandle | null) => void;
}

export const ResumeHighlightContext = createContext<ResumeHighlightContextValue | null>(null);

export function useResumeHighlight() {
  const context = useContext(ResumeHighlightContext);
  if (context === null) {
    throw new Error('useResumeHighlight must be used within a ResumeHighlightProvider');
  }
  return context;
}
