import {
  Clipboard,
  Heading,
  HStack,
  IconButton,
  List,
  Spacer,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { LuCopy, LuLightbulb, LuRefreshCw, LuTrendingUp, LuUsers, LuZap } from 'react-icons/lu';
import { useParams } from 'react-router';

import { SegmentedGauge } from '@/components/custom/segmented-gauge';
import { SourceTooltip } from '@/components/custom/SourceTooltip';
import { nivoTheme } from '@/components/theme/nivo.theme';
import { useGenerateListingInsights, useUpdateListingNotes } from '@/mutations/listing.mutations';
import { listingsQueries } from '@/queries/listing.queries';

const mockCompanyNews = `WS Audiology recently acquired AI Startup "SoundTech Labs" to enhance their hearing aid technology with machine learning capabilities. The company also announced a $50M investment in R&D for next-generation hearing solutions and expanded operations to Southeast Asia with new offices in Singapore and Bangkok.`;

const mockCompetitiveInsights = `Main competitors include Phonak (Sonova), ReSound (GN Store Nord), and Widex (Demant). WS Audiology holds ~15% market share in the premium hearing aid segment. The market is rapidly shifting towards connected devices and AI-powered personalization, where WS is positioned as an innovator.`;

const mockInsights = [
  {
    icon: LuZap,
    text: 'Company is investing heavily in AI/ML, so familiarity with TensorFlow or PyTorch is a plus.',
  },
  {
    icon: LuTrendingUp,
    text: 'Recent acquisition signals aggressive growth strategy and potential for career advancement.',
  },
  {
    icon: LuUsers,
    text: 'Singapore expansion suggests international opportunities and potential relocation/travel.',
  },
  {
    icon: LuLightbulb,
    text: 'Strong R&D focus means emphasis on innovation and learning from senior engineers.',
  },
];

const mockSentimentSources = [
  {
    url: 'https://www.crunchbase.com/organization/ws-audiology',
    title: 'Crunchbase',
    content: 'Recent funding rounds and acquisition activity signal strong investor confidence.',
  },
  {
    url: 'https://www.linkedin.com/company/ws-audiology',
    title: 'LinkedIn',
    content: 'Growing team size and frequent job postings indicate rapid expansion.',
  },
  {
    url: 'https://news.ycombinator.com',
    title: 'Tech News',
    content: 'Positive community sentiment around their AI/ML initiatives.',
  },
  {
    url: 'https://www.glassdoor.com/Overview/Working-at-WS-Audiology-EI_IE.htm',
    title: 'Glassdoor',
    content: 'Employee reviews averaging 4.2/5 with praise for innovation culture.',
  },
  {
    url: 'https://www.wsaudiology.com/press',
    title: 'Press Releases',
    content: 'Consistent announcements of product launches and market expansion.',
  },
];

export function Intelligence() {
  const { listingId } = useParams<{ listingId: string }>();
  const { data: listing } = useSuspenseQuery(listingsQueries.item(listingId!));
  const updateNotes = useUpdateListingNotes();
  const { generateInsights, isGeneratingInsights } = useGenerateListingInsights();
  const [notes, setNotes] = useState(listing.notes ?? '');

  // Mock salary data
  const mockSalary = {
    min: 80000,
    max: 150000,
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    updateNotes({ listingId: listing.id, notes: newNotes || null });
  };

  const handleRefreshInsights = () => {
    generateInsights(listing.id);
  };

  return (
    <VStack px="4" gap="6" align="stretch" key={listing.id}>
      {/* Sentiment Analysis */}
      <VStack align="stretch" gap="3">
        <Heading size="sm">Sentiment Analysis</Heading>
        <SegmentedGauge percent={0.68} tooltipLabel="Sentiment" showPercentage height="6" />
        <HStack gap="2">
          <Text color="fg.muted" textStyle="xs">
            Sentiment collected from 5 sources
          </Text>
          <SourceTooltip sources={mockSentimentSources} />
        </HStack>
      </VStack>
      {/* Salary Range */}
      {mockSalary && (
        <VStack align="stretch" h="24">
          <Heading size="sm">Salary Range</Heading>

          <ResponsiveBoxPlot
            animate={false}
            data={[
              {
                group: 'Market Range',
                value: mockSalary.min,
                subgroup: 'min',
              },
              {
                group: 'Market Range',
                value: mockSalary.max,
                subgroup: 'max',
              },
            ]}
            layout="horizontal"
            margin={{ top: 20, right: 10, bottom: 40, left: 10 }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Salary (USD)',
              legendPosition: 'middle',
              legendOffset: 50,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            theme={nivoTheme as any}
            defaultHeight={100}
            markers={
              mockSalary
                ? [
                    {
                      axis: 'x',
                      value: (mockSalary.min + mockSalary.max) / 2,
                      lineStyle: {
                        stroke: 'var(--chakra-colors-fg)',
                        strokeWidth: 2,
                      },
                      legend: 'This Listing',
                      legendPosition: 'right',
                      legendOrientation: 'horizontal',
                    },
                  ]
                : []
            }
          />
        </VStack>
      )}

      {/* Company News & Competitive Landscape */}
      <VStack align="stretch" gap="3">
        <Heading size="sm">Recent News & Market Position</Heading>
        <Text color="fg.muted" textStyle="sm">
          {mockCompanyNews}
        </Text>
        <Text color="fg.muted" textStyle="sm">
          {mockCompetitiveInsights}
        </Text>
      </VStack>

      {/* Key Insights */}
      <VStack align="stretch" gap="3">
        <Heading size="sm">Key Insights for Applicants</Heading>
        <List.Root variant="plain" gap="2">
          {mockInsights.map((insight, i) => {
            const IconComponent = insight.icon;
            return (
              <List.Item key={i}>
                <List.Indicator asChild color="blue">
                  <IconComponent size={18} />
                </List.Indicator>
                <Text color="fg.muted" textStyle="sm">
                  {insight.text}
                </Text>
              </List.Item>
            );
          })}
        </List.Root>
      </VStack>

      {/* Metadata Footer */}
      <HStack w="full" justify="space-between">
        <Text textStyle="sm">Generated 15 May 2026 at 3:53 PM</Text>
        <Spacer />
        <Clipboard.Root value="Company intelligence data">
          <Clipboard.Trigger asChild>
            <IconButton aria-label="Copy" variant="ghost" size="xs">
              <LuCopy />
            </IconButton>
          </Clipboard.Trigger>
        </Clipboard.Root>
        <IconButton
          aria-label="Refresh"
          variant="ghost"
          size="xs"
          onClick={handleRefreshInsights}
          disabled={isGeneratingInsights}
        >
          <LuRefreshCw />
        </IconButton>
      </HStack>

      {/* Your Notes */}
      <VStack align="stretch" gap="2">
        <Heading size="md">Your Notes</Heading>
        <Textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add your research notes about this opportunity here..."
          autoresize
          rows={5}
        />
      </VStack>
    </VStack>
  );
}
