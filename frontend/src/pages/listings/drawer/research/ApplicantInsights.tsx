import { List, Text } from '@chakra-ui/react';

import { Section } from '../Section';

export function ApplicantInsights({ insights }: { insights: string[] }) {
  return (
    <Section title="Key Insights for Applicants">
      {insights.length === 0 ? (
        <Text>No applicant insights yet. Generate research to populate this section.</Text>
      ) : (
        <List.Root as="ol" gap="xs">
          {insights.map((insight) => (
            <List.Item key={insight} ml="md">
              {insight}
            </List.Item>
          ))}
        </List.Root>
      )}
    </Section>
  );
}
