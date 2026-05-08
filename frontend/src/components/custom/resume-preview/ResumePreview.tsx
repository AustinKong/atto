import { Box, ButtonGroup, Center, IconButton } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

import type { Profile, Section } from '@/types/resume.types';
import type { Template } from '@/types/template.types';

import { Document } from './document';

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.1;

export function ResumePreview({
  template,
  sections,
  profile,
}: {
  template: Template;
  sections: Section[];
  profile: Profile;
}) {
  const [scale, setScale] = useState(1);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  }, []);

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
}
