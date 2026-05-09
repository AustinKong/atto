import { Button, Card, Collapsible, HStack, Text, VStack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuCheck, LuChevronLeft, LuX } from 'react-icons/lu';

import { RESUME_SUGGESTIONS } from '@/pages/resume/resume-suggestions.constants';

type SuggestionDecision = 'accepted' | 'dismissed' | null;

// TODO: Update
export function Suggestions({
  onSuggestionHover,
}: {
  onSuggestionHover: (suggestionId: string | null) => void;
}) {
  const [suggestionDecisions, setSuggestionDecisions] = useState<
    Record<string, SuggestionDecision>
  >({});
  const [openSuggestions, setOpenSuggestions] = useState<Record<string, boolean>>({});
  const suggestions = useMemo(() => RESUME_SUGGESTIONS, []);

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
            onMouseEnter={() => onSuggestionHover(suggestion.id)}
            onMouseLeave={() => onSuggestionHover(null)}
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
