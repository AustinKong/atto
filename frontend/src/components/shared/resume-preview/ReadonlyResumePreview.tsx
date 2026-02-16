import { Box } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

import { Document } from './Document';

const PAPER_WIDTH = 595;
const PAPER_HEIGHT = 842;

export function ReadonlyResumePreview({
  template,
  sections,
  profile,
}: {
  template: string;
  sections: Section[];
  profile: Profile;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const computeScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const { paddingLeft, paddingRight, paddingTop, paddingBottom } =
        window.getComputedStyle(container);

      const horizontalPadding = parseFloat(paddingLeft) + parseFloat(paddingRight);
      const verticalPadding = parseFloat(paddingTop) + parseFloat(paddingBottom);

      const availableWidth = container.clientWidth - horizontalPadding;
      const availableHeight = container.clientHeight - verticalPadding;

      const scaleByWidth = availableWidth / PAPER_WIDTH;
      const scaleByHeight = availableHeight / PAPER_HEIGHT;

      const newScale = Math.min(scaleByWidth, scaleByHeight);
      setScale(newScale);
    };

    computeScale();

    const observer = new ResizeObserver(computeScale);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <Box h="full" w="full" p="2" ref={containerRef}>
      <Document
        template={template}
        sections={sections}
        profile={profile}
        scale={scale}
        interactable={false}
        limitPages={1}
      />
    </Box>
  );
}
