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
 * Blob URLs are created once per blob in this parent component so each DocumentInstance receives a plain string,
 * avoiding ArrayBuffer transfer/detach issues when two instances share the same Blob object.
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
    templateQueries.render(template, sections, profile, !interactable)
  );

  const [state, dispatch] = useReducer(documentReducer, initialState);
  const { aUrl, bUrl, activeInstance } = state;

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    dispatch({ type: 'NEW_URL', url });
  }, [blob]);

  const handleInstanceReady = (instance: 'A' | 'B') => {
    dispatch({ type: 'TOGGLE_ACTIVE', instance });
  };

  if (isFetching && !aUrl && !bUrl) {
    return (
      <Center h="full">
        <Spinner />
      </Center>
    );
  }

  return (
    <Box position="relative">
      {[
        { id: 'A' as const, url: aUrl },
        { id: 'B' as const, url: bUrl },
      ].map(
        ({ id, url }) =>
          url && (
            <Box
              key={id}
              visibility={activeInstance === id ? 'visible' : 'hidden'}
              position={activeInstance === id ? 'relative' : 'absolute'}
              top={0}
              left={0}
            >
              <DocumentInstance
                url={url}
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
