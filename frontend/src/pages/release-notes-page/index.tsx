import { useSuspenseQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';

import { Prose } from '@/components/ui/prose';
import { releaseNotesQueries } from '@/queries/releaseNotes';

export function ReleaseNotesPage() {
  const { data: releaseNotes } = useSuspenseQuery(releaseNotesQueries.latest());

  return (
    <Prose>
      <Markdown>{releaseNotes.notes}</Markdown>
    </Prose>
  );
}
