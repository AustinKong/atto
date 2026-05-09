import { Box, ButtonGroup, Center, IconButton } from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

import type { ResumeSuggestion } from '@/pages/resume/resume-suggestions.constants';
import type { Profile, Section } from '@/types/resume.types';
import type { Template } from '@/types/template.types';

import { Document } from './document';

const MIN_SCALE = 0.5;
const MAX_SCALE = 2;
const SCALE_STEP = 0.1;

function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function findSpanRangeForSnippet(
  spans: { element: HTMLSpanElement; text: string }[],
  snippet: string
): [number, number] | null {
  const target = normalizeText(snippet);
  if (!target) return null;

  for (let start = 0; start < spans.length; start += 1) {
    let combined = '';

    for (let end = start; end < Math.min(spans.length, start + 40); end += 1) {
      if (!spans[end].text) continue;
      combined = combined ? `${combined} ${spans[end].text}` : spans[end].text;

      if (combined.includes(target)) {
        return [start, end];
      }

      if (combined.length > target.length * 2) {
        break;
      }
    }
  }

  return null;
}

function clearAnchorStyle(element: HTMLElement) {
  element.style.removeProperty('background-color');
  element.style.removeProperty('box-shadow');
  element.style.removeProperty('border-radius');
  element.style.removeProperty('outline');
}

function applyAnchorStyle(element: HTMLElement, isHovered: boolean) {
  const color = isHovered ? 'rgba(255, 167, 38, 0.36)' : 'rgba(255, 200, 0, 0.24)';
  const outline = isHovered
    ? '1px solid rgba(255, 145, 0, 0.65)'
    : '1px solid rgba(255, 200, 0, 0.35)';

  element.style.setProperty('background-color', color, 'important');
  element.style.setProperty('box-shadow', `inset 0 -0.12em 0 ${color}`, 'important');
  element.style.setProperty('border-radius', '2px', 'important');
  element.style.setProperty('outline', outline, 'important');
}

export function ResumePreview({
  template,
  sections,
  profile,
  suggestions = [],
  highlightedSuggestionId = null,
  commentPocEnabled = false,
}: {
  template: Template;
  sections: Section[];
  profile: Profile;
  suggestions?: ResumeSuggestion[];
  highlightedSuggestionId?: string | null;
  commentPocEnabled?: boolean;
}) {
  const [scale, setScale] = useState(1);
  const [anchoredSuggestionIds, setAnchoredSuggestionIds] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  }, []);

  const clearAnchors = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const textSpans = Array.from(
      container.querySelectorAll('.react-pdf__Page__textContent span, .textLayer span')
    ) as HTMLSpanElement[];

    textSpans.forEach((span) => {
      span.classList.remove('resume-comment-anchor', 'resume-comment-anchor--hovered');
      span.removeAttribute('data-resume-comment-id');
      clearAnchorStyle(span);
    });
  }, []);

  const applyCommentAnchors = useCallback(() => {
    clearAnchors();

    if (!commentPocEnabled) {
      setAnchoredSuggestionIds([]);
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    const textSpans = Array.from(
      container.querySelectorAll('.react-pdf__Page__textContent span, .textLayer span')
    ) as HTMLSpanElement[];

    if (!textSpans.length) {
      setAnchoredSuggestionIds([]);
      return;
    }

    const normalizedSpans = textSpans.map((element) => ({
      element,
      text: normalizeText(element.textContent ?? ''),
    }));

    const foundIds: string[] = [];

    for (const suggestion of suggestions) {
      const range = findSpanRangeForSnippet(normalizedSpans, suggestion.snippet);
      if (!range) continue;

      const [start, end] = range;
      for (let index = start; index <= end; index += 1) {
        const span = normalizedSpans[index]?.element;
        if (!span) continue;

        span.dataset.resumeCommentId = suggestion.id;
        span.classList.add('resume-comment-anchor');
      }

      foundIds.push(suggestion.id);
    }

    setAnchoredSuggestionIds(foundIds);
  }, [clearAnchors, commentPocEnabled, suggestions]);

  useEffect(() => {
    applyCommentAnchors();
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(applyCommentAnchors);
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [applyCommentAnchors]);

  useEffect(() => {
    if (!commentPocEnabled) {
      clearAnchors();
      return;
    }

    const container = scrollContainerRef.current;
    if (!container) return;

    const anchors = container.querySelectorAll('[data-resume-comment-id]');
    anchors.forEach((node) => {
      const element = node as HTMLElement;
      const isHovered = element.dataset.resumeCommentId === highlightedSuggestionId;

      element.classList.toggle('resume-comment-anchor--hovered', isHovered);
      applyAnchorStyle(element, isHovered);
    });
  }, [anchoredSuggestionIds, clearAnchors, commentPocEnabled, highlightedSuggestionId]);

  return (
    <Box w="full" h="full" position="relative" overflow="hidden">
      <Box
        ref={scrollContainerRef}
        w="full"
        h="full"
        overflow="auto"
        bgColor="gray.300"
        _dark={{ bgColor: 'gray.700' }}
        position="relative"
        css={{
          '& .textLayer span.resume-comment-anchor, & .react-pdf__Page__textContent span.resume-comment-anchor':
            { cursor: 'pointer', transition: 'all 0.2s ease' },
        }}
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
