/* eslint-disable simple-import-sort/imports */
import React, { type CSSProperties, useCallback, useMemo } from 'react';
import { Button, HStack, Icon, IconButton, Input, Textarea, VStack } from '@chakra-ui/react';
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFieldArray, useController, useFormContext, type Control } from 'react-hook-form';
import { PiDotsSixVertical, PiPlus, PiTrash } from 'react-icons/pi';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';

import { SortableListInput } from '@/components/custom/sortable-list-input';
import type { ResumeData } from '@/types/resume';

import { DateRangeSelector } from './DateRangeSelector';

interface DetailedItemEditorProps {
  sectionIndex: number;
  // pass the form control from the parent to avoid coupling to form context here
  control: Control<ResumeData>;
}

/*
 DO NOT attempt to use DragOverlay with this. it is not performant enough to work...
*/
function DetailedItemEditorComponent({ sectionIndex, control }: DetailedItemEditorProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.content.bullets`,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: { y: 2 } },
    })
  );

  const handleDragEnd = (event: { active: { id: unknown }; over: { id: unknown } | null }) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      move(oldIndex, newIndex);
    }
  };

  const addItem = () => {
    append({
      title: '',
      subtitle: '',
      startDate: '',
      endDate: '',
      bullets: [''],
    });
  };

  const items = useMemo(() => fields.map((f) => f.id), [fields]);

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
      modifiers={[restrictToParentElement, restrictToVerticalAxis]}
      autoScroll={false}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <VStack gap="4" w="full" align="stretch">
          {fields.map((field, index) => (
            <DetailedItemCardWrapper
              key={field.id}
              id={field.id}
              sectionIndex={sectionIndex}
              itemIndex={index}
              remove={remove}
              minItems={1}
            />
          ))}
        </VStack>
      </SortableContext>

      <Button onClick={addItem} aria-label="Add experience item" variant="outline">
        <PiPlus /> Add Entry
      </Button>
    </DndContext>
  );
}

// Memoize the whole editor so parent re-renders don't force it to update when props are stable.
export const DetailedItemEditor = React.memo(DetailedItemEditorComponent, (prev, next) => {
  return prev.sectionIndex === next.sectionIndex && prev.control === next.control;
});

DetailedItemEditor.displayName = 'DetailedItemEditor';

const DetailedItemCardWrapper = React.memo(function DetailedItemCardWrapper({
  id,
  sectionIndex,
  itemIndex,
  remove,
  minItems,
}: {
  id: string;
  sectionIndex: number;
  itemIndex: number;
  remove: (index: number) => void;
  minItems: number;
}) {
  const onDelete = useCallback(() => {
    if (minItems <= 1) return;
    remove(itemIndex);
  }, [remove, itemIndex, minItems]);

  return (
    <DetailedItemCard
      id={id}
      sectionIndex={sectionIndex}
      itemIndex={itemIndex}
      onDelete={onDelete}
    />
  );
});

DetailedItemCardWrapper.displayName = 'DetailedItemCardWrapper';

function DetailedItemCardComponent({
  id,
  sectionIndex,
  itemIndex,
  onDelete,
}: {
  id: string;
  sectionIndex: number;
  itemIndex: number;
  onDelete: () => void;
}) {
  // useSortable provides the drag refs and transform; call it unconditionally.
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  // endDate is managed within DateRangeSelector popover

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 0,
  };

  return (
    <VStack
      ref={setNodeRef}
      style={style as CSSProperties}
      w="full"
      align="stretch"
      borderWidth="1px"
      borderRadius="md"
      p="3"
      bg="bg.subtle"
      position="relative"
    >
      <HStack justify="space-between" w="full">
        <HStack align="center" gap="3" flex="1">
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

          <TitleInput sectionIndex={sectionIndex} itemIndex={itemIndex} />

          <DateRangeSelector
            startName={`sections.${sectionIndex}.content.bullets.${itemIndex}.startDate`}
            endName={`sections.${sectionIndex}.content.bullets.${itemIndex}.endDate`}
            type="month"
            size="sm"
          />
        </HStack>

        <IconButton
          variant="ghost"
          size="xs"
          color="fg.error"
          onClick={onDelete}
          aria-label="Delete item"
        >
          <PiTrash />
        </IconButton>
      </HStack>

      {/* pad content so it lines up with the title on the top row (which sits after the handle) */}
      <VStack gap="2" w="full" align="stretch" pl="8">
        <SubtitleInput sectionIndex={sectionIndex} itemIndex={itemIndex} />

        <BulletsField sectionIndex={sectionIndex} itemIndex={itemIndex} />
      </VStack>
    </VStack>
  );
}

DetailedItemCardComponent.displayName = 'DetailedItemCardComponent';

const DetailedItemCard = React.memo(DetailedItemCardComponent, (prevProps, nextProps) => {
  // Only re-render if the identifying props change. Ignore context-driven parent renders.
  return (
    prevProps.id === nextProps.id &&
    prevProps.sectionIndex === nextProps.sectionIndex &&
    prevProps.itemIndex === nextProps.itemIndex &&
    prevProps.onDelete === nextProps.onDelete
  );
});

DetailedItemCard.displayName = 'DetailedItemCard';

// Small, memoized form field components to avoid subscribing the whole card to form context
const TitleInput = React.memo(function TitleInput({
  sectionIndex,
  itemIndex,
}: {
  sectionIndex: number;
  itemIndex: number;
}) {
  const { control } = useFormContext<ResumeData>();
  const { field } = useController({
    name: `sections.${sectionIndex}.content.bullets.${itemIndex}.title`,
    control,
    defaultValue: '',
  });
  const { onChange, onBlur, name, ref, value } = field;
  return (
    <Input
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      ref={ref}
      value={value ?? ''}
      placeholder="Title (e.g., Job Title)"
      variant="flushed"
      flex="1"
    />
  );
});
TitleInput.displayName = 'TitleInput';

const SubtitleInput = React.memo(function SubtitleInput({
  sectionIndex,
  itemIndex,
}: {
  sectionIndex: number;
  itemIndex: number;
}) {
  const { control } = useFormContext<ResumeData>();
  const { field } = useController({
    name: `sections.${sectionIndex}.content.bullets.${itemIndex}.subtitle`,
    control,
    defaultValue: '',
  });
  const { onChange, onBlur, name, ref, value } = field;
  return (
    <Input
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      ref={ref}
      value={value ?? ''}
      placeholder="Subtitle (e.g., Company)"
      variant="flushed"
    />
  );
});
SubtitleInput.displayName = 'SubtitleInput';

const BulletsField = React.memo(function BulletsField({
  sectionIndex,
  itemIndex,
}: {
  sectionIndex: number;
  itemIndex: number;
}) {
  const { control, register } = useFormContext<ResumeData>();
  return (
    <SortableListInput.Root
      control={control}
      register={register}
      // @ts-expect-error - nested path type inference limitation
      name={`sections.${sectionIndex}.content.bullets.${itemIndex}.bullets`}
      defaultItem=""
    >
      <HStack justify="space-between">
        <SortableListInput.Label>Bullet Points</SortableListInput.Label>
        <SortableListInput.AddButton />
      </HStack>

      <SortableListInput.List>
        <SortableListInput.Item<ResumeData>>
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
BulletsField.displayName = 'BulletsField';
