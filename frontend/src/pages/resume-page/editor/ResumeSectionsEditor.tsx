import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { SectionsEditor } from '@/components/shared/sections-editor';
import { useSaveResume } from '@/mutations/resume';
import { resumeQueries } from '@/queries/resume';
import type { Section } from '@/types/resume';

export function ResumeSectionsEditor() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useQuery(resumeQueries.item(resumeId!));
  const { mutate: saveResume } = useSaveResume();

  const handleChange = (sections: Section[]) => {
    if (!resume) return;
    saveResume({
      resumeId: resumeId!,
      sections,
    });
  };

  return <SectionsEditor defaultValues={resume?.sections ?? []} onChange={handleChange} />;
}
