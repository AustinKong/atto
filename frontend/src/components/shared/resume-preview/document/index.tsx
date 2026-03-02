import { Box, Center, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useReducer } from 'react';

import { templateQueries } from '@/queries/template';
import type { Profile, Section } from '@/types/resume';
import type { Template } from '@/types/template';

import { DocumentInstance } from './DocumentInstance';
import { documentReducer, initialState } from './documentReducer';

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

  const [state, dispatch] = useReducer(documentReducer, initialState);
  const { aBlob, bBlob, activeInstance } = state;

  useEffect(() => {
    dispatch({ type: 'RESET' });
  }, [template.id]);

  useEffect(() => {
    if (!blob) return;
    dispatch({ type: 'NEW_BLOB', blob });
  }, [blob]);

  const handleInstanceReady = (instance: 'A' | 'B') => {
    dispatch({ type: 'TOGGLE_ACTIVE', instance });
  };

  if (isFetching && !aBlob && !bBlob) {
    return (
      <Center h="full">
        <Spinner />
      </Center>
    );
  }

  return (
    <Box position="relative">
      {[
        { id: 'A' as const, blob: aBlob },
        { id: 'B' as const, blob: bBlob },
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
