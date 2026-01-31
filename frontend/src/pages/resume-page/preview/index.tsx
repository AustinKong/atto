import { Badge, Box, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useDebouncedQuery } from '@/hooks/useDebouncedQuery';
import { resumeQueries } from '@/queries/resume';
import type { Resume } from '@/types/resume';

const PAPER_WIDTH = 816;
const PAPER_HEIGHT = 1056;

interface PreviewProps {
  resume: Resume;
}

export function Preview({ resume }: PreviewProps) {
  // Read the canonical saved resume from react-query cache so Preview only
  // updates when the saved data changes (e.g. on successful save).
  const { data: cachedResume } = useQuery(resumeQueries.item(resume.id));
  const resumeData = cachedResume?.data;

  // Use an empty string when no saved data is present so the debounced query
  // stays disabled until there's something to render.
  const dataKey = useMemo(() => (resumeData ? JSON.stringify(resumeData) : ''), [resumeData]);

  const { data: html = '', isLoading } = useDebouncedQuery(
    resumeQueries.debouncedHtml(resume.id, resume.template, dataKey)
  );

  return <PreviewContent html={html} isLoading={isLoading} />;
}

interface PreviewContentProps {
  html: string;
  isLoading: boolean;
}

export const PreviewContent = memo(function PreviewContent({
  html,
  isLoading,
}: PreviewContentProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const updateScale = () => {
      const styles = window.getComputedStyle(preview);
      const paddingLeft = parseFloat(styles.paddingLeft);
      const paddingRight = parseFloat(styles.paddingRight);
      const totalPadding = paddingLeft + paddingRight;

      const availableWidth = preview.clientWidth - totalPadding;
      setScale(Math.min(availableWidth / PAPER_WIDTH, 1));
    };
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
      {/* Loading indicator */}
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
      {/* Ghost wrapper - takes up the space of the scaled content */}
      <Box
        width={`${PAPER_WIDTH * scale}px`}
        height={`${PAPER_HEIGHT * scale}px`}
        position="relative"
      >
        {/* The actual paper - overlaid on top */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width={`${PAPER_WIDTH}px`}
          height={`${PAPER_HEIGHT}px`}
          scale={scale}
          transformOrigin="top left"
        >
          <iframe srcDoc={html} width="100%" height="100%" style={{ border: 'none' }} />
        </Box>
      </Box>
    </VStack>
  );
});
