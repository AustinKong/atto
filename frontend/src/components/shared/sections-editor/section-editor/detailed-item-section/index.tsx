import { Button, VStack } from '@chakra-ui/react';
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { memo } from 'react';
import { type Control, useFieldArray } from 'react-hook-form';
import { PiPlus } from 'react-icons/pi';

import type { SectionsEditorData } from '../../types';
import { DetailedItem } from './DetailedItem';

export const DetailedItemSection = memo(
  function DetailedItemSection({
    sectionIndex,
    control,
  }: {
    sectionIndex: number;
    control: Control<SectionsEditorData>;
  }) {
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
        startDate: null,
        endDate: null,
        bullets: [],
      });
    };

    return (
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
        modifiers={[restrictToParentElement, restrictToVerticalAxis]}
        autoScroll={false}
      >
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <VStack gap="4" w="full" align="stretch">
            {fields.map((field, index) => (
              <DetailedItem
                key={field.id}
                id={field.id}
                sectionIndex={sectionIndex}
                itemIndex={index}
                onDelete={remove}
              />
            ))}
          </VStack>
        </SortableContext>

        <Button onClick={addItem} aria-label="Add experience item" variant="outline">
          <PiPlus /> Add Entry
        </Button>
      </DndContext>
    );
  },
  (prev, next) => {
    return prev.sectionIndex === next.sectionIndex && prev.control === next.control;
  }
);

DetailedItemSection.displayName = 'DetailedItemEditor';
