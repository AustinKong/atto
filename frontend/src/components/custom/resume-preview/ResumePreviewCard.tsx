import { Box, VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import type { Profile, Section } from '@/types/resume.types';
import type { Template } from '@/types/template.types';

import { Document } from './document';

const PAPER_WIDTH = 595;
const PAPER_HEIGHT = 842;

export function ResumePreviewCard({
  template,
  sections,
  profile,
}: {
  template: Template;
  sections: Section[];
  profile: Profile;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const computeScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const { paddingLeft, paddingRight } = window.getComputedStyle(container);
      const horizontalPadding = parseFloat(paddingLeft) + parseFloat(paddingRight);
      const availableWidth = container.clientWidth - horizontalPadding;
      setScale(availableWidth / PAPER_WIDTH);
    };

    computeScale();
    const observer = new ResizeObserver(computeScale);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scaledHeight = PAPER_HEIGHT * scale;

  return (
    <VStack gap="0" align="stretch" h="full" minH="0">
      {/* Resume preview area — distinct background, padding, hard clip */}
      <Box
        ref={containerRef}
        position="relative"
        w="full"
        flex="1"
        minH="0"
        overflow="hidden"
        bg="bg.muted"
        py="xl"
        px="2xl"
        borderRadius="sm"
      >
        <Box h={`${scaledHeight}px`}>
          <Document
            template={template}
            sections={sections}
            profile={profile}
            scale={scale}
            interactable={false}
            limitPages={1}
          />
        </Box>
      </Box>
    </VStack>
  );
}
