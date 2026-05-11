import { Button, Card, Collapsible, HStack, Text, VStack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuCheck, LuChevronLeft, LuX } from 'react-icons/lu';

import type { ResumeHighlight } from '@/components/custom/resume-preview';
import { RESUME_HIGHLIGHT_LAYERS } from '@/pages/resume/highlight-layers.constants';
import { useResumeHighlight } from '@/pages/resume/highlightContext';
import { RESUME_SUGGESTIONS } from '@/pages/resume/resume-suggestions.constants';
import type { Section } from '@/types/resume.types';

type SuggestionDecision = 'accepted' | 'dismissed' | null;

// TODO: Update
export function Suggestions({
  resumeSections,
}: {
  resumeSections: Section[];
}) {
  const { highlight, clear } = useResumeHighlight();
  const [suggestionDecisions, setSuggestionDecisions] = useState<
    Record<string, SuggestionDecision>
  >({});
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({});
  const suggestions = useMemo(() => RESUME_SUGGESTIONS, []);
  const suggestionUnitIds = useMemo(() => getSuggestionUnitIds(resumeSections), [resumeSections]);

  function setSuggestionDecision(suggestionId: string, decision: SuggestionDecision) {
    setSuggestionDecisions((previous) => ({
      ...previous,
      [suggestionId]: previous[suggestionId] === decision ? null : decision,
    }));
  }

  return (
    <>
      <Text textStyle="md" color="fg.muted">
        AI Suggestions
      </Text>

      <VStack align="stretch" gap="sm">
        {suggestions.map((suggestion) => (
          <VStack
            key={suggestion.id}
            align="stretch"
            gap="xs"
            onMouseEnter={() => {
              highlight(
                RESUME_HIGHLIGHT_LAYERS.suggestions,
                getSuggestionHighlights(suggestion.id, suggestionUnitIds)
              );
            }}
            onMouseLeave={() => clear(RESUME_HIGHLIGHT_LAYERS.suggestions)}
          >
            <Card.Root borderWidth="1px" variant="outline">
              <Collapsible.Root
                open={openSuggestions[suggestion.id] ?? true}
                onOpenChange={(details) => {
                  setOpenSuggestions((previous) => ({
                    ...previous,
                    [suggestion.id]: details.open,
                  }));
                }}
              >
                <Card.Header p="sm">
                  <Collapsible.Trigger asChild>
                    <HStack justifyContent="space-between" cursor="pointer">
                      <Text>
                        {suggestion.title}{' '}
                        <Text as="span" color="fg.muted" textStyle="xs">
                          ({suggestion.severity})
                        </Text>
                      </Text>
                      <Collapsible.Indicator
                        transition="transform 0.2s"
                        _open={{ transform: 'rotate(-90deg)' }}
                      >
                        <LuChevronLeft />
                      </Collapsible.Indicator>
                    </HStack>
                  </Collapsible.Trigger>
                </Card.Header>

                <Collapsible.Content>
                  <Card.Body pt="sm" pb="sm">
                    <Text color="fg.muted">{suggestion.message}</Text>
                  </Card.Body>
                </Collapsible.Content>
              </Collapsible.Root>
            </Card.Root>

            {(openSuggestions[suggestion.id] ?? true) && (
              <HStack gap="xs" justifyContent="flex-start">
                {suggestion.isOutdated ? (
                  <Button size="xs" variant="ghost" colorPalette="gray" disabled>
                    <LuX />
                    Outdated
                  </Button>
                ) : (
                  <>
                    <Button
                      size="2xs"
                      variant="ghost"
                      colorPalette="green"
                      onClick={() => setSuggestionDecision(suggestion.id, 'accepted')}
                      bg={
                        suggestionDecisions[suggestion.id] === 'accepted'
                          ? 'green.subtle'
                          : undefined
                      }
                    >
                      <LuCheck />
                      Accept
                    </Button>
                    <Button
                      size="2xs"
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => setSuggestionDecision(suggestion.id, 'dismissed')}
                      bg={
                        suggestionDecisions[suggestion.id] === 'dismissed'
                          ? 'red.subtle'
                          : undefined
                      }
                    >
                      <LuX />
                      Dismiss
                    </Button>
                  </>
                )}
              </HStack>
            )}
          </VStack>
        ))}
      </VStack>
    </>
  );
}

const SUGGESTION_HIGHLIGHT_STYLE = {
  color: 'yellow.subtle',
} as const;

function getSuggestionHighlights(
  suggestionId: string | null,
  suggestionUnitIds: Record<string, string[]>
): ResumeHighlight[] {
  const highlightedUnitIds = suggestionId === null ? [] : (suggestionUnitIds[suggestionId] ?? []);
  return highlightedUnitIds.map((unitId) => ({
    unitId,
    ...SUGGESTION_HIGHLIGHT_STYLE,
  }));
}

function getSuggestionUnitIds(sections: Section[]): Record<string, string[]> {
  const experienceSection = sections.find(
    (section) => section.type === 'detailed' && section.title.content.toLowerCase() === 'experience'
  );
  const skillsSection = sections.find(
    (section) => section.type === 'simple' && section.title.content.toLowerCase() === 'skills'
  );

  if (!experienceSection || experienceSection.type !== 'detailed') {
    return {};
  }

  const firstExperience = experienceSection.content[0];
  const firstBulletId = firstExperience?.bullets[0]?.id;
  const secondBulletId = firstExperience?.bullets[1]?.id;
  const firstSkillId =
    skillsSection && skillsSection.type === 'simple' ? skillsSection.content[0]?.id : undefined;

  return {
    'exp-microservices': firstBulletId ? [firstBulletId] : [],
    'exp-kafka': secondBulletId ? [secondBulletId] : [],
    'skills-frontend': firstSkillId ? [firstSkillId] : [],
  };
}
