import { Box, Button, Card, Collapsible, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuCheck, LuChevronLeft, LuX } from 'react-icons/lu';

import { ContentQualityChart } from '@/components/custom/content-quality-chart';
import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { RESUME_SUGGESTIONS } from '@/pages/resume/resume-suggestions.constants';
import { SkillsComparison } from '@/pages/resume/SkillsComparison';

type SuggestionDecision = 'accepted' | 'dismissed' | null;

export function Breakdown({
  applicationId,
  listingId,
  onSuggestionHover,
}: {
  applicationId: string;
  listingId: string;
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
    <VStack align="stretch" gap="md" p="md" h="full" overflowY="auto">
      <VStack align="stretch" gap="xs">
        <Text textStyle="sm" color="fg.muted">
          Match Score
        </Text>
        <Box py="xs">
          <SegmentedGauge percent={Math.random()} size="lg" />
        </Box>
      </VStack>

      <SimpleGrid minChildWidth="22rem" gap="md">
        <Box minW="0" h="18rem">
          <SkillsComparison applicationId={applicationId} listingId={listingId} />
        </Box>

        <Box minW="0" h="18rem">
          <ContentQualityChart />
        </Box>
      </SimpleGrid>

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
    </VStack>
  );
}
