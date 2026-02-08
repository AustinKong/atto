import { Badge, Box, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useLayoutEffect, useRef, useState } from 'react';

import { resumeQueries } from '@/queries/resume';
import type { Section } from '@/types/resume';

const PAPER_WIDTH = 816;
const PAPER_HEIGHT = 1056;

export function ResumePreview({ template, sections }: { template: string; sections: Section[] }) {
  const { data: html, isLoading } = useQuery(resumeQueries.html(template, sections));

  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const updateScale = () => {
      const styles = window.getComputedStyle(preview);
      const paddingLeft = parseFloat(styles.paddingLeft) || 0;
      const paddingRight = parseFloat(styles.paddingRight) || 0;
      const totalPadding = paddingLeft + paddingRight;

      const availableWidth = preview.clientWidth - totalPadding;
      setScale(Math.min(availableWidth / PAPER_WIDTH, 1));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(preview);

    return () => observer.disconnect();
  }, []);

  return (
    <VStack
      w="full"
      h="full"
      ref={previewRef}
      bg="gray.100"
      _dark={{ bg: 'gray.800' }}
      overflowY="scroll"
      overflowX="hidden"
      p={4}
      align="center"
      gap={2}
      position="relative"
    >
      {isLoading && (
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme="blue"
          variant="solid"
          size="sm"
          zIndex={10}
        >
          Rendering...
        </Badge>
      )}

      <Box
        width={`${PAPER_WIDTH * scale}px`}
        height={`${PAPER_HEIGHT * scale}px`}
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          width={`${PAPER_WIDTH}px`}
          height={`${PAPER_HEIGHT}px`}
          scale={scale}
          transformOrigin="top left"
        >
          <iframe srcDoc={html || ''} width="100%" height="100%" style={{ border: 'none' }} />
        </Box>
      </Box>
    </VStack>
  );
}
