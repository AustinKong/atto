import {
  Box,
  DataList,
  Heading,
  HStack,
  Link,
  List,
  Tag,
  Text,
  VStack,
  Wrap,
} from '@chakra-ui/react';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PiCheck } from 'react-icons/pi';
import { useParams } from 'react-router';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import { nivoTheme } from '@/components/theme/nivo.theme';
import { DisplayDate } from '@/components/ui/DisplayDate';
import { listingsQueries } from '@/queries/listing.queries';
import type { Listing } from '@/types/listing.types';
import { formatListingBreadcrumb } from '@/utils/formatters/listing.formatters';

// TODO: "Latest News" ticker.?
/*
Tab 1: Information

...what we have now.

Tab 2: Intelligence

Latest News Ticker: A marquee-style or auto-scrolling line at the top showing the latest headlines about WS Audiology (e.g., "WSA announces new R&D center in Singapore...").

Company Dossier (AI Research):

Tech Stack: A list of inferred tools (e.g., Sentry, GitHub Actions, Jira).

Culture Signal: AI-detected "vibe" (e.g., Engineering-led, Mission-driven, Low-friction).

Self-Added Notes (Field Journal): A monospace, timestamped text area at the bottom.

Style: Use a >  prefix for each note to keep the "Terminal" feel.
*/
function Header({ listing }: { listing: Listing }) {
  return (
    <HStack gap="2" align="start" px="3" mb="4">
      <CompanyLogo domain={listing.domain} companyName={listing.company} size="xl" />
      <VStack alignItems="start" gap="0" flex="1" minW="0">
        <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
          {formatListingBreadcrumb(listing)}
        </Text>
        <Link
          href={listing.url}
          variant="underline"
          fontSize="sm"
          target="_blank"
          color="fg.info"
          truncate
          display="block"
          w="full"
        >
          {listing.url}
        </Link>
      </VStack>
    </HStack>
  );
}

export function Info() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));

  const formatSalary = (salary: { value: number; currency: string }) => {
    const symbol = salary.currency === 'USD' ? '$' : salary.currency + ' ';
    return `${symbol}${salary.value.toLocaleString()}`;
  };

  return (
    <>
      <Header listing={listing} />
      <VStack px="4" gap="4" align="stretch">
        <VStack align="stretch">
          <Heading size="md">About the Role</Heading>
          <DataList.Root orientation="horizontal" w="full" gap="2" size="lg">
            <DataList.Item>
              <DataList.ItemLabel>Location</DataList.ItemLabel>
              <DataList.ItemValue>{listing.location ?? 'Not specified'}</DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>Posted</DataList.ItemLabel>
              <DataList.ItemValue>
                <DisplayDate date={listing.postedDate} />
              </DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>Salary</DataList.ItemLabel>
              <DataList.ItemValue>
                {listing.salary ? formatSalary(listing.salary) : 'Not listed'}
              </DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>Skills</DataList.ItemLabel>
              <DataList.ItemValue>
                <Wrap>
                  {listing.skills.map((skill) => (
                    <Tag.Root key={skill} variant="subtle" size="lg">
                      <Tag.Label>{skill}</Tag.Label>
                    </Tag.Root>
                  ))}
                </Wrap>
              </DataList.ItemValue>
            </DataList.Item>
          </DataList.Root>
        </VStack>

        <VStack align="stretch">
          <Heading size="md">Description</Heading>
          <Text color="fg.muted">{listing.description}</Text>
        </VStack>

        <VStack align="stretch">
          <Heading size="md">Requirements</Heading>
          <List.Root variant="plain">
            {listing.requirements.map((req, index) => (
              <List.Item key={index}>
                <List.Indicator asChild color="green">
                  <PiCheck />
                </List.Indicator>
                <Text color="fg.muted">{req}</Text>
              </List.Item>
            ))}
          </List.Root>
        </VStack>

        <VStack align="stretch">
          <Heading size="md">Keyword Analysis</Heading>
          {listing.keywords.length > 0 ? (
            <Box w="full" h="400px" bg="bg.panel" borderRadius="md" overflow="visible">
              <ResponsiveTreeMap
                data={{
                  id: 'root',
                  children: listing.keywords.map((kw) => ({ id: kw.word, value: kw.count })),
                }}
                enableParentLabel={false}
                identity="id"
                label={(node) => {
                  const id = String(node.id);
                  return id.length > 10 ? id.slice(0, 9) + '…' : id;
                }}
                value="value"
                valueFormat=">-.0f"
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                theme={nivoTheme}
                colors={{ scheme: 'spectral' }}
                nodeOpacity={0.85}
                borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
                animate={false}
                motionConfig="gentle"
              />
            </Box>
          ) : (
            <Text color="fg.muted" textStyle="sm">
              No keyword analysis available for this listing.
            </Text>
          )}
        </VStack>
      </VStack>
    </>
  );
}
