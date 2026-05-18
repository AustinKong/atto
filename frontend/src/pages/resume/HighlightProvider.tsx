import { type ReactNode, useCallback, useMemo, useRef } from 'react';

import type { ResumeHighlight } from '@/components/custom/resume-preview';
import type { ResumePreviewHandle } from '@/components/custom/resume-preview';

import { ResumeHighlightContext } from './highlightContext';

export function ResumeHighlightProvider({ children }: { children: ReactNode }) {
  const previewRef = useRef<ResumePreviewHandle | null>(null);

  const registerPreview = useCallback((preview: ResumePreviewHandle | null) => {
    previewRef.current = preview;
  }, []);

  const highlight = useCallback((layerKey: string, nextHighlights: ResumeHighlight[]) => {
    previewRef.current?.highlight(layerKey, nextHighlights);
  }, []);

  const clear = useCallback((layerKey: string) => {
    previewRef.current?.clear(layerKey);
  }, []);

  const value = useMemo(
    () => ({
      highlight,
      clear,
      registerPreview,
    }),
    [highlight, clear, registerPreview]
  );

  return (
    <ResumeHighlightContext.Provider value={value}>{children}</ResumeHighlightContext.Provider>
  );
}
