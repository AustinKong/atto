import { Box, type BoxProps, ButtonGroup, Center, IconButton } from '@chakra-ui/react';
import {
  type ForwardedRef,
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

import type { Profile, Section } from '@/types/resume.types';
import type { Template } from '@/types/template.types';

import { Document } from './document';

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.1;

export type ResumeHighlight = {
  unitId: string;
  color: BoxProps['bg'];
};

/**
 * ResumePreview highlight layer behavior:
 * 1. Highlights are grouped by layer key.
 * 2. Calling `highlight(layerKey, highlights)` replaces only that layer's content.
 * 3. Calling `clear(layerKey)` removes only that layer.
 * 4. Render order is lexicographic by layer key:
 *    smaller keys render first (below), larger keys render later (above).
 */
export type ResumePreviewHandle = {
  highlight: (layerKey: string, highlights: ResumeHighlight[]) => void;
  clear: (layerKey: string) => void;
};

export const ResumePreview = memo(
  forwardRef(function ResumePreview(
    {
      template,
      sections,
      profile,
    }: {
      template: Template;
      sections: Section[];
      profile: Profile;
    },
    ref: ForwardedRef<ResumePreviewHandle>
  ) {
    const [scale, setScale] = useState(1);
    const [highlightLayers, setHighlightLayers] = useState<Record<string, ResumeHighlight[]>>({});
    const highlights = useMemo(() => {
      const orderedLayerKeys = Object.keys(highlightLayers).sort((a, b) => a.localeCompare(b));
      return orderedLayerKeys.flatMap((layerKey) => highlightLayers[layerKey] ?? []);
    }, [highlightLayers]);

    const handleZoomIn = useCallback(() => {
      setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
    }, []);

    const handleZoomOut = useCallback(() => {
      setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        highlight: (layerKey, nextHighlights) => {
          setHighlightLayers((previous) => ({
            ...previous,
            [layerKey]: nextHighlights,
          }));
        },
        clear: (layerKey) => {
          setHighlightLayers((previous) => {
            const { [layerKey]: _removed, ...rest } = previous;
            return rest;
          });
        },
      }),
      []
    );

    return (
      <Box w="full" h="full" position="relative" overflow="hidden">
        <Box
          w="full"
          h="full"
          overflow="auto"
          bgColor="gray.300"
          _dark={{ bgColor: 'gray.700' }}
          position="relative"
        >
          <Center minW="full" minH="full" p="xl">
            <Document
              template={template}
              sections={sections}
              profile={profile}
              highlights={highlights}
              interactable={true}
              scale={scale}
            />
          </Center>
        </Box>
        <ButtonGroup
          attached
          orientation="vertical"
          position="absolute"
          bottom="4"
          left="3"
          pointerEvents="auto"
          zIndex="overlay"
        >
          <IconButton
            variant="surface"
            size="xs"
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="Zoom in"
          >
            <LuPlus />
          </IconButton>
          <IconButton
            variant="surface"
            size="xs"
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="Zoom out"
          >
            <LuMinus />
          </IconButton>
        </ButtonGroup>
      </Box>
    );
  })
);
