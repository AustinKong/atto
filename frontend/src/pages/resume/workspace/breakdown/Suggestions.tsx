import { Blockquote, Button, Card, Collapsible, HStack, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCheck, LuChevronLeft, LuX } from 'react-icons/lu';

import type { ResumeHighlight } from '@/components/custom/resume-preview';
import { useRemoveApplicationAnalysisSuggestion } from '@/mutations/application.mutations';
import { RESUME_HIGHLIGHT_LAYERS } from '@/pages/resume/highlight-layers.constants';
import { useResumeHighlight } from '@/pages/resume/highlightContext';
import type { AISuggestions } from '@/types/application.types';

export function Suggestions({
  applicationId,
  aiSuggestions,
  onAcceptSuggestion,
  unitHashesById,
}: {
  applicationId: string;
  aiSuggestions: AISuggestions | null;
  onAcceptSuggestion: (unitId: string, replacementText: string) => void;
  unitHashesById: Record<string, string>;
}) {
  const { highlight, clear } = useResumeHighlight();
  const { mutate: removeSuggestion } = useRemoveApplicationAnalysisSuggestion();
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({});
  const suggestions = aiSuggestions?.suggestions ?? [];
  const hasData = suggestions.length > 0;

  function handleDismissSuggestion(suggestionId: string) {
    removeSuggestion({ applicationId, suggestionId });
  }

  function handleAcceptSuggestion({
    suggestionId,
    unitId,
    replacementText,
  }: {
    suggestionId: string;
    unitId: string;
    replacementText: string | null;
  }) {
    if (!replacementText) {
      return;
    }
    onAcceptSuggestion(unitId, replacementText);
    removeSuggestion({ applicationId, suggestionId });
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
            const isOutdated = !suggestion.unitHash || unitHashesById[suggestion.unitId] !== suggestion.unitHash;
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
                          <Text>
                            Suggestion {index + 1}
                            {isOutdated ? ' (Outdated)' : ''}
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
                      <Card.Body pt="sm" pb="lg">
                        <VStack align="stretch" gap="md">
                          <Text color="fg">{suggestion.suggestion}</Text>
                          {suggestion.replacementText && (
                            <VStack align="stretch" gap="xs">
                              <Text color="fg.muted" textStyle="xs">
                                Change to
                              </Text>
                              <Blockquote.Root variant="subtle">
                                <Blockquote.Content>
                                  {suggestion.replacementText}
                                </Blockquote.Content>
                              </Blockquote.Root>
                            </VStack>
                          )}
                        </VStack>
                      </Card.Body>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </Card.Root>

                {(openSuggestions[suggestionId] ?? true) && (
                  <HStack gap="xs" justifyContent="flex-start">
                    {!isOutdated && suggestion.replacementText ? (
                      <Button
                        size="2xs"
                        variant="ghost"
                        colorPalette="green"
                        onClick={() =>
                          handleAcceptSuggestion({
                            suggestionId,
                            unitId: suggestion.unitId,
                            replacementText: suggestion.replacementText,
                          })
                        }
                      >
                        <LuCheck />
                        Accept
                      </Button>
                    ) : null}
                    {isOutdated ? (
                      <Button
                        size="2xs"
                        variant="ghost"
                        colorPalette="gray"
                        onClick={() => handleDismissSuggestion(suggestionId)}
                      >
                        <LuX />
                        Outdated
                      </Button>
                    ) : (
                      <Button
                        size="2xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => handleDismissSuggestion(suggestionId)}
                      >
                        <LuX />
                        Dismiss
                      </Button>
                    )}
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
