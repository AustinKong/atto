import { Button, VStack } from '@chakra-ui/react';
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import React, { useMemo } from 'react';
import { type Control, useFieldArray } from 'react-hook-form';
import { PiPlus } from 'react-icons/pi';

import type { ResumeData } from '@/types/resume';

import { DetailedItem } from './DetailedItem';

/*
 DO NOT attempt to use DragOverlay with this. it is not performant enough to work...
*/
export const DetailedItemSection = React.memo(
  function DetailedItemSection({
    sectionIndex,
    control,
  }: {
    sectionIndex: number;
    control: Control<ResumeData>;
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
