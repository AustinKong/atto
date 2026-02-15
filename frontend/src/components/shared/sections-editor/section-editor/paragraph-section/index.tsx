import { Textarea } from '@chakra-ui/react';
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';

import type { SectionsEditorData } from '../../types';

export const ParagraphSection = memo(function ParagraphSection({
  sectionIndex,
}: {
  sectionIndex: number;
}) {
  const { register } = useFormContext<SectionsEditorData>();

  return (
    <Textarea
      {...register(`sections.${sectionIndex}.content`)}
      placeholder="Enter paragraph text..."
      rows={3}
      variant="flushed"
      resize="none"
    />
  );
});

ParagraphSection.displayName = 'ParagraphSection';
