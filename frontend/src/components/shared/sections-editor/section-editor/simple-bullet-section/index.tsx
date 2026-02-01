import { HStack, Textarea } from '@chakra-ui/react';
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';

import { SortableListInput } from '@/components/custom/sortable-list-input';
import type { ResumeData } from '@/types/resume';

export const SimpleBulletSection = memo(function SimpleBulletSection({
  sectionIndex,
}: {
  sectionIndex: number;
}) {
  const { control, register } = useFormContext<ResumeData>();

  return (
    <SortableListInput.Root<ResumeData>
      control={control}
      register={register}
      name={`sections.${sectionIndex}.content.bullets`}
      defaultItem=""
    >
      <HStack justify="space-between">
        <SortableListInput.Label>Bullet Points</SortableListInput.Label>
        <SortableListInput.AddButton />
      </HStack>

      <SortableListInput.List>
        <SortableListInput.Item>
          {({ index, name, register }) => (
            <>
              <SortableListInput.Marker />
              <Textarea
                {...register(`${name}.${index}`)}
                placeholder="Enter bullet point..."
                variant="flushed"
                rows={1}
                minH="auto"
                py="2"
                css={{ fieldSizing: 'content' }}
                resize="none"
                flex="1"
              />
              <SortableListInput.DeleteButton />
            </>
          )}
        </SortableListInput.Item>
      </SortableListInput.List>
    </SortableListInput.Root>
  );
});

SimpleBulletSection.displayName = 'SimpleBulletEditor';
