import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

import { SectionsEditor } from '@/components/shared/sections-editor';
import type { Profile } from '@/types/profile';
import type { Section } from '@/types/resume';

export function ProfileSectionsEditor() {
  const { getValues, setValue } = useFormContext<Profile>();
  const baseSections = getValues('baseSections');

  const handleChange = useCallback(
    (updatedSections: Section[]) => {
      setValue('baseSections', updatedSections);
    },
    [setValue]
  );

  return <SectionsEditor defaultValues={baseSections} onChange={handleChange} />;
}
