import { Box, Center, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { templateQueries } from '@/queries/template';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import type { Template } from '@/types/template';

import { DocumentInstance } from './DocumentInstance';

/**
 * Uses swap buffering to render new PDFs in the background and only swap them in once they're fully rendered, preventing flickering.
 */
export function Document({
  template,
  sections,
  profile,
  interactable = false,
  scale = 1,
  limitPages = Infinity,
  pageWidth = 595,
}: {
  template: Template;
  sections: Section[];
  profile: Profile;
  interactable?: boolean;
  scale?: number;
  limitPages?: number;
  pageWidth?: number;
}) {
  const { data: blob, isFetching } = useQuery(
    templateQueries.renderPdf(template, sections, profile, !interactable)
  );

  const [activeInstance, setActiveInstance] = useState<'A' | 'B'>('A');
  const activeInstanceRef = useRef(activeInstance);
  activeInstanceRef.current = activeInstance;

  const [instanceA, setInstanceA] = useState<Blob | undefined>(undefined);
  const [instanceB, setInstanceB] = useState<Blob | undefined>(undefined);

  useEffect(() => {
    if (!blob) return;

    if (activeInstanceRef.current === 'A') {
      setInstanceB(blob);
    } else {
      setInstanceA(blob);
    }
  }, [blob]);

  const handleInstanceReady = (instance: 'A' | 'B') => {
    setActiveInstance(instance);
  };

  if (isFetching && !instanceA && !instanceB) {
    return (
      <Center h="full">
        <Spinner />
      </Center>
    );
  }

  return (
    <Box position="relative">
      {[
        { id: 'A' as const, blob: instanceA },
        { id: 'B' as const, blob: instanceB },
      ].map(
        ({ id, blob }) =>
          blob && (
            <Box
              key={id}
              visibility={activeInstance === id ? 'visible' : 'hidden'}
              position={activeInstance === id ? 'relative' : 'absolute'}
              top={0}
              left={0}
            >
              <DocumentInstance
                blob={blob}
                scale={scale}
                pageWidth={pageWidth}
                limitPages={limitPages}
                interactable={interactable}
                onReady={() => handleInstanceReady(id)}
              />
            </Box>
          )
      )}
    </Box>
  );
}
