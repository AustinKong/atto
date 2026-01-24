import { Button, HStack, IconButton, Input, Textarea, VStack } from '@chakra-ui/react';
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { PiDotsSixVertical, PiPlus, PiTrash } from 'react-icons/pi';

import { SortableListInput } from '@/components/custom/sortable-list-input';
import type { ResumeData } from '@/types/resume';

interface DetailedItemEditorProps {
  sectionIndex: number;
}

export function DetailedItemEditor({ sectionIndex }: DetailedItemEditorProps) {
  const { control } = useFormContext<ResumeData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.content.bullets`,
  });

  const idsRef = useRef<string[]>([]);

  // Sync ids with fields length
  useEffect(() => {
    if (idsRef.current.length < fields.length) {
      idsRef.current.push(
        ...Array.from({ length: fields.length - idsRef.current.length }, () => crypto.randomUUID())
      );
    } else if (idsRef.current.length > fields.length) {
      idsRef.current = idsRef.current.slice(0, fields.length);
    }
  }, [fields.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: { y: 8 } },
    })
  );

  const handleDragEnd = (event: { active: { id: unknown }; over: { id: unknown } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = idsRef.current.indexOf(active.id as string);
    const newIndex = idsRef.current.indexOf(over.id as string);

    idsRef.current = arrayMove(idsRef.current, oldIndex, newIndex);
    move(oldIndex, newIndex);
  };

  const addItem = () => {
    idsRef.current.push(crypto.randomUUID());
    append({
      title: '',
      subtitle: '',
      startDate: '',
      endDate: '',
      bullets: [''],
    });
  };

  const removeAt = (index: number) => {
    if (fields.length <= 1) return;

    const nextIds = [...idsRef.current];
    nextIds.splice(index, 1);
    idsRef.current = nextIds;

    remove(index);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={idsRef.current} strategy={verticalListSortingStrategy}>
        <VStack gap="4" w="full" align="stretch">
          {fields.map((_field, index) => (
            <DetailedItemCard
              key={idsRef.current[index]}
              id={idsRef.current[index]}
              sectionIndex={sectionIndex}
              itemIndex={index}
              onDelete={() => removeAt(index)}
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

function DetailedItemCard({
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
  const { register, control } = useFormContext<ResumeData>();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <VStack
      ref={setNodeRef}
      style={style}
      w="full"
      align="stretch"
      borderWidth="1px"
      borderRadius="md"
      p="3"
      bg="bg.subtle"
      position="relative"
      zIndex={transform ? 1 : 0}
    >
      <HStack justify="space-between" w="full">
        <HStack
          {...attributes}
          {...listeners}
          cursor="grab"
          color="fg.muted"
          _active={{ cursor: 'grabbing' }}
        >
          <PiDotsSixVertical />
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

      <VStack gap="2" w="full" align="stretch">
        <HStack gap="2" w="full">
          <Input
            {...register(`sections.${sectionIndex}.content.bullets.${itemIndex}.title`)}
            placeholder="Title (e.g., Job Title)"
            variant="flushed"
            flex="1"
          />
          <Input
            {...register(`sections.${sectionIndex}.content.bullets.${itemIndex}.subtitle`)}
            placeholder="Subtitle (e.g., Company)"
            variant="flushed"
            flex="1"
          />
        </HStack>

        <HStack gap="2" w="full">
          <Input
            {...register(`sections.${sectionIndex}.content.bullets.${itemIndex}.startDate`)}
            placeholder="Start Date"
            variant="flushed"
            flex="1"
          />
          <Input
            {...register(`sections.${sectionIndex}.content.bullets.${itemIndex}.endDate`)}
            placeholder="End Date"
            variant="flushed"
            flex="1"
          />
        </HStack>

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
      </VStack>
    </VStack>
  );
}
