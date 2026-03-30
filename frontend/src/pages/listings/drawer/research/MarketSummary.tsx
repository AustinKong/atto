import { Text } from '@chakra-ui/react';

import { Section } from '../Section';

export function MarketSummary({ summary }: { summary: string | undefined }) {
  return (
    <Section title="Recent News & Market Position">
      <Text>{summary ?? 'No market summary generated yet.'}</Text>
    </Section>
  );
}
