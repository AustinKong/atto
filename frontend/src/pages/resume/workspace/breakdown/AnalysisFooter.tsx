import { HStack, IconButton, Spacer, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LuRefreshCw } from 'react-icons/lu';

import { FeatureTooltip } from '@/components/custom/feature-tooltip';
import { useGenerateApplicationAnalysis } from '@/mutations/application.mutations';
import { applicationQueries } from '@/queries/application.queries';
import type { ApplicationAnalysis } from '@/types/application.types';
import type { TaskStatus } from '@/types/task-status.types';

const ANALYSIS_POLLING_INTERVAL = 2000;

function isAnalysisInProgress(status: TaskStatus | undefined): boolean {
  return status === 'pending' || status === 'running';
}

export function AnalysisFooter({
  applicationId,
  analysis,
  refetchApplication,
}: {
  applicationId: string;
  analysis: ApplicationAnalysis | null;
  refetchApplication: () => void;
}) {
  const { mutate: generateAnalysis } = useGenerateApplicationAnalysis();

  const { data: statusData } = useQuery({
    ...applicationQueries.analysisStatus(applicationId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return isAnalysisInProgress(status) ? ANALYSIS_POLLING_INTERVAL : false;
    },
  });

  const isAnalyzing = isAnalysisInProgress(statusData?.status);

  useEffect(() => {
    if (!isAnalyzing) {
      refetchApplication();
    }
  }, [isAnalyzing, refetchApplication]);

  return (
    <HStack w="full" justify="space-between" textStyle="caption">
      <Text>
        {isAnalyzing
          ? 'Generating...'
          : statusData?.status === 'failed'
            ? 'Analysis generation failed'
            : analysis
              ? `Generated at ${new Date(analysis.generatedAt).toLocaleString()}`
              : 'Analysis not generated yet'}
      </Text>
      <Spacer />
      <FeatureTooltip hasCloud={false} hasApiKey={true} size="sm" />
      <IconButton
        aria-label="Refresh Analysis"
        variant="ghost"
        size="xs"
        onClick={() => generateAnalysis(applicationId)}
        loading={isAnalyzing}
        color="inherit"
      >
        <LuRefreshCw />
      </IconButton>
    </HStack>
  );
}
