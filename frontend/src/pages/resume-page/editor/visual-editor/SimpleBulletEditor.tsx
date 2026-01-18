import { HStack, Textarea } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { SortableListInput } from '@/components/custom/sortable-list-input';
import type { ResumeFormData } from '@/types/resume';

interface SimpleBulletEditorProps {
  sectionIndex: number;
}

export function SimpleBulletEditor({ sectionIndex }: SimpleBulletEditorProps) {
  const { control, register } = useFormContext<ResumeFormData>();

  return (
    <SortableListInput.Root<ResumeFormData>
      control={control}
      register={register}
      name={`data.sections.${sectionIndex}.content.bullets`}
      defaultItem=""
    >
      <HStack justify="space-between">
        <SortableListInput.Label>Bullet Points</SortableListInput.Label>
        <SortableListInput.AddButton />
      </HStack>

      <SortableListInput.List>
        <SortableListInput.Item<ResumeFormData>>
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
}
