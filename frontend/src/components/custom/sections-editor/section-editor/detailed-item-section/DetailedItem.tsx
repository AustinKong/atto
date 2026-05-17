import { HStack, Icon, IconButton, Input, Textarea, VStack } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { PiDotsSixVertical, PiTrash } from 'react-icons/pi';

import { SortableListInput } from '@/components/custom/sortable-list-input';
import { createTextUnit } from '@/utils/resume.utils';

import { DateRangeSelector } from '../../DateRangeSelector';
import type { SectionsEditorData } from '../../types';

// Must split into two components because useSortable necessarily causes re-renders every drag frame.
export const DetailedItem = memo(function DetailedItem({
  id,
  sectionIndex,
  itemIndex,
  onDelete,
}: {
  id: string;
  sectionIndex: number;
  itemIndex: number;
  onDelete: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 0,
  };

  return (
    <VStack
      ref={setNodeRef}
      style={style}
      w="full"
      align="stretch"
      borderWidth="1px"
      borderRadius="md"
      p="sm"
      bg="bg.panel"
      position="relative"
    >
      <DetailedItemContent
        sectionIndex={sectionIndex}
        itemIndex={itemIndex}
        onDelete={onDelete}
        attributes={attributes}
        listeners={listeners}
      />
    </VStack>
  );
});

const DetailedItemContent = memo(function DetailedItemContent({
  sectionIndex,
  itemIndex,
  onDelete,
  attributes,
  listeners,
}: {
  sectionIndex: number;
  itemIndex: number;
  onDelete: (index: number) => void;
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
}) {
  const { register, control } = useFormContext<SectionsEditorData>();

  return (
    <>
      <HStack justify="space-between" w="full">
        <HStack align="center" gap="sm" flex="1">
          <HStack
            {...attributes}
            {...listeners}
            cursor="grab"
            color="fg.muted"
            _active={{ cursor: 'grabbing' }}
          >
            <Icon>
              <PiDotsSixVertical />
            </Icon>
          </HStack>

          <Input
            {...register(`sections.${sectionIndex}.content.${itemIndex}.title.content`)}
            placeholder="Title (e.g., Job Title)"
            variant="flushed"
            flex="1"
          />

          <DateRangeSelector
            startName={`sections.${sectionIndex}.content.${itemIndex}.dateRange.startDate`}
            endName={`sections.${sectionIndex}.content.${itemIndex}.dateRange.endDate`}
          />
        </HStack>

        <IconButton
          variant="ghost"
          size="xs"
          color="fg.error"
          onClick={() => onDelete(itemIndex)}
          aria-label="Delete item"
        >
          <PiTrash />
        </IconButton>
      </HStack>

      <VStack gap="xs" w="full" align="stretch" pl="xl">
        <Input
          {...register(`sections.${sectionIndex}.content.${itemIndex}.subtitle.content`)}
          placeholder="Subtitle (e.g., Company)"
          variant="flushed"
        />

        <SortableListInput.Root<SectionsEditorData>
          control={control}
          register={register}
          name={`sections.${sectionIndex}.content.${itemIndex}.bullets`}
          defaultItem={createTextUnit() as never}
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
                    {...register(`${name}.${index}.content`)}
                    placeholder="Enter bullet point..."
                    variant="flushed"
                    rows={1}
                    minH="auto"
                    py="xs"
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
      </VStack>
    </>
  );
});

DetailedItem.displayName = 'DetailedItem';
