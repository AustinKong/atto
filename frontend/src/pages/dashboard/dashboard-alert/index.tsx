import { Alert, Button } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router';

import { DEFAULT_RESUME_ID } from '@/constants/resume.constants';
import { useAuth } from '@/hooks/use-auth.hooks';
import { useExitPaperMode } from '@/mutations/paper-mode.mutations';
import { resumeQueries } from '@/queries/resume.queries';
import { settingsQueries } from '@/queries/setting.queries';
import type { Section } from '@/types/resume.types';
import { extractSectionTextUnits } from '@/utils/resume.utils';

const PAPER_MODE_DESCRIPTION =
  'Changes are temporary so you can explore Atto without touching your real workspace.';
const MISSING_API_KEY_DESCRIPTION =
  'AI features need a model key before Atto can research listings or tailor resumes.';
const EMPTY_RESUME_DESCRIPTION =
  'Atto uses it as the starting point for application-specific resumes and match analysis.';

export function DashboardAlert() {
  const navigate = useNavigate();
  const { exitGuestMode } = useAuth();
  const { data: settings } = useSuspenseQuery(settingsQueries.list());
  const { data: defaultResume } = useSuspenseQuery(resumeQueries.item(DEFAULT_RESUME_ID));
  const exitPaperModeMutation = useExitPaperMode(() => {
    exitGuestMode();
    navigate('/auth');
  });

  const isPaperMode = Boolean(settings.paper?.fields.enabled?.value);
  const apiKey = settings.model?.fields.api_key?.value;
  const hasApiKey = typeof apiKey === 'string' && apiKey.trim().length > 0;
  const isDefaultResumeEmpty = isResumeEmpty(defaultResume.sections);

  if (isPaperMode) {
    return (
      <DashboardAlertRoot title="Paper mode is active" description={PAPER_MODE_DESCRIPTION}>
        <Button
          size="xs"
          variant="outline"
          onClick={() => exitPaperModeMutation.mutate()}
          loading={exitPaperModeMutation.isPending}
        >
          Exit paper mode <LuArrowRight />
        </Button>
      </DashboardAlertRoot>
    );
  }

  if (!hasApiKey) {
    return (
      <DashboardAlertRoot title="Add an API key" description={MISSING_API_KEY_DESCRIPTION}>
        <Button size="xs" variant="outline" onClick={() => navigate('/onboarding')}>
          Go to onboarding <LuArrowRight />
        </Button>
      </DashboardAlertRoot>
    );
  }

  if (isDefaultResumeEmpty) {
    return (
      <DashboardAlertRoot
        title="Fill out your default resume"
        description={EMPTY_RESUME_DESCRIPTION}
      >
        <Button
          size="xs"
          variant="outline"
          onClick={() => navigate(`/resumes/${DEFAULT_RESUME_ID}`)}
        >
          Open resume <LuArrowRight />
        </Button>
      </DashboardAlertRoot>
    );
  }

  return null;
}

function DashboardAlertRoot({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Alert.Root status="warning" variant="subtle">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{title}</Alert.Title>
        <Alert.Description>{description}</Alert.Description>
      </Alert.Content>
      {children}
    </Alert.Root>
  );
}

function isResumeEmpty(sections: Section[]): boolean {
  return extractSectionTextUnits(sections).length === 0;
}
