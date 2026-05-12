import { Button, Card, Collapsible, HStack, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCheck, LuChevronLeft, LuX } from 'react-icons/lu';

import type { ResumeHighlight } from '@/components/custom/resume-preview';
import { RESUME_HIGHLIGHT_LAYERS } from '@/pages/resume/highlight-layers.constants';
import { useResumeHighlight } from '@/pages/resume/highlightContext';
import type { AiSuggestions } from '@/types/application.types';

type SuggestionDecision = 'accepted' | 'dismissed' | null;

export function Suggestions({
  aiSuggestions,
}: {
  aiSuggestions: AiSuggestions | null;
}) {
  const { highlight, clear } = useResumeHighlight();
  const [suggestionDecisions, setSuggestionDecisions] = useState<
    Record<string, SuggestionDecision>
  >({});
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({});
  const suggestions = aiSuggestions?.suggestions ?? [];
  const hasData = suggestions.length > 0;

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

      {!hasData ? (
        <Text textStyle="sm" color="fg.muted">
          Generate analysis to see AI suggestions.
        </Text>
      ) : (
        <VStack align="stretch" gap="sm">
          <Text textStyle="sm" color="fg">
            {aiSuggestions?.summary}
          </Text>
          {suggestions.map((suggestion, index) => {
            const suggestionId = suggestion.id;
            return (
              <VStack
                key={suggestionId}
                align="stretch"
                gap="xs"
                onMouseEnter={() => {
                  highlight(
                    RESUME_HIGHLIGHT_LAYERS.suggestions,
                    getSuggestionHighlights(suggestion.unitId)
                  );
                }}
                onMouseLeave={() => clear(RESUME_HIGHLIGHT_LAYERS.suggestions)}
              >
                <Card.Root borderWidth="1px" variant="outline">
                  <Collapsible.Root
                    open={openSuggestions[suggestionId] ?? true}
                    onOpenChange={(details) => {
                      setOpenSuggestions((previous) => ({
                        ...previous,
                        [suggestionId]: details.open,
                      }));
                    }}
                  >
                    <Card.Header p="sm">
                      <Collapsible.Trigger asChild>
                        <HStack justifyContent="space-between" cursor="pointer">
                          <Text>Suggestion {index + 1}</Text>
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
                        <VStack align="stretch" gap="2xs">
                          <Text color="fg">{suggestion.suggestion}</Text>
                          {suggestion.rationale ? (
                            <Text color="fg.muted" textStyle="sm">
                              {suggestion.rationale}
                            </Text>
                          ) : null}
                        </VStack>
                      </Card.Body>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </Card.Root>

                {(openSuggestions[suggestionId] ?? true) && (
                  <HStack gap="xs" justifyContent="flex-start">
                    <Button
                      size="2xs"
                      variant="ghost"
                      colorPalette="green"
                      onClick={() => setSuggestionDecision(suggestionId, 'accepted')}
                      bg={
                        suggestionDecisions[suggestionId] === 'accepted'
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
                      onClick={() => setSuggestionDecision(suggestionId, 'dismissed')}
                      bg={
                        suggestionDecisions[suggestionId] === 'dismissed'
                          ? 'red.subtle'
                          : undefined
                      }
                    >
                      <LuX />
                      Dismiss
                    </Button>
                  </HStack>
                )}
              </VStack>
            );
          })}
        </VStack>
      )}
    </>
  );
}

const SUGGESTION_HIGHLIGHT_STYLE = {
  color: 'yellow.subtle',
} as const;

function getSuggestionHighlights(unitId: string | null): ResumeHighlight[] {
  if (!unitId) {
    return [];
  }

  return [
    {
      unitId,
      ...SUGGESTION_HIGHLIGHT_STYLE,
    },
  ];
}
