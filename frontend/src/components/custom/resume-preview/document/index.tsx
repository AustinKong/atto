import { Box, Center, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useReducer } from 'react';

import { templateQueries } from '@/queries/template.queries';
import type { Profile, Section } from '@/types/resume.types';
import type { Template } from '@/types/template.types';

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
  highlightedUnitIds = [],
  interactable = false,
  scale = 1,
  limitPages = Infinity,
  pageWidth = 595,
}: {
  template: Template;
  sections: Section[];
  profile: Profile;
  highlightedUnitIds?: string[];
  interactable?: boolean;
  scale?: number;
  limitPages?: number;
  pageWidth?: number;
}) {
  const { data: renderedTemplate, isFetching } = useQuery(
    templateQueries.render(template, sections, profile, !interactable)
  );

  const [state, dispatch] = useReducer(documentReducer, initialState);
  const { aUrl, aGeometry, bUrl, bGeometry, activeInstance } = state;

  useEffect(() => {
    if (!renderedTemplate) return;
    const url = URL.createObjectURL(renderedTemplate.pdfBlob);
    dispatch({ type: 'NEW_RENDER', url, geometry: renderedTemplate.geometry });
  }, [renderedTemplate]);

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
        { id: 'A' as const, url: aUrl, geometry: aGeometry },
        { id: 'B' as const, url: bUrl, geometry: bGeometry },
      ].map(
        ({ id, url, geometry }) =>
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
                geometry={geometry ?? {}}
                highlightedUnitIds={highlightedUnitIds}
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
