import { useSuspenseQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import { useParams } from 'react-router';

import { Prose } from '@/components/ui/prose';
import { releaseNotesQueries } from '@/queries/releaseNotes';

export function ReleaseNotesPage() {
  const { version } = useParams<{ version: string }>();
  const { data: releaseNotes } = useSuspenseQuery(releaseNotesQueries.item(version!));

  return (
    <Prose>
      <Markdown>{releaseNotes.notes}</Markdown>
    </Prose>
  );
}
