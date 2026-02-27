import { Box, Center, HStack, IconButton, Text } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';
import type { Template } from '@/types/template';

import { Document } from './Document';

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
    <Box w="full" h="full" position="relative">
      <Center
        w="full"
        h="full"
        overflowY="auto"
        bgColor="gray.300"
        _dark={{ bgColor: 'gray.700' }}
        position="relative"
      >
        <Document
          template={template}
          sections={sections}
          profile={profile}
          interactable={true}
          scale={scale}
        />
      </Center>
      <HStack
        borderRadius="md"
        bottom="4"
        gap="2"
        position="absolute"
        bgColor="bg.panel"
        p="2"
        left="50%"
        transform="translateX(-50%)"
        pointerEvents="auto"
        zIndex="overlay"
      >
        <IconButton
          size="2xs"
          onClick={handleZoomOut}
          disabled={scale <= MIN_SCALE}
          aria-label="Zoom out"
        >
          <LuMinus />
        </IconButton>
        <Text>{Math.round(scale * 100)}%</Text>
        <IconButton
          size="2xs"
          onClick={handleZoomIn}
          disabled={scale >= MAX_SCALE}
          aria-label="Zoom in"
        >
          <LuPlus />
        </IconButton>
      </HStack>
    </Box>
  );
}
