import { Button, HStack, VStack } from '@chakra-ui/react';
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { PiPlus } from 'react-icons/pi';

import type { ResumeData, Section } from '@/types/resume';

import { SectionEditor } from './SectionEditor';

export function VisualEditor() {
  const { control } = useFormContext<ResumeData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'sections',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: { y: 2 } },
    })
  );

  const handleDragEnd = (event: { active: { id: unknown }; over: { id: unknown } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    move(oldIndex, newIndex);
  };

  const addSection = (type: string) => {
    let content;
    switch (type) {
      case 'detailed':
        content = {
          bullets: [
            {
              title: '',
              subtitle: '',
              startDate: '',
              endDate: '',
              bullets: [''],
            },
          ],
        };
        break;
      case 'paragraph':
        content = { text: '' };
        break;
      case 'simple':
      default:
        content = { bullets: [''] };
        break;
    }

    const newSection: Section = {
      id: crypto.randomUUID(),
      type,
      title: 'New Section',
      content,
    };

    append(newSection);
  };

  const removeSectionAt = (index: number) => {
    remove(index);
  };

  // Keep stable delete callbacks per section id so child props don't change identity on each render.
  const deleteCallbacksRef = useRef(new Map<string, () => void>());
  const getDeleteCallback = (id: string) => {
    const existing = deleteCallbacksRef.current.get(id);
    if (existing) return existing;

    const cb = () => {
      const idx = fields.findIndex((f) => f.id === id);
      if (idx === -1) return;
      removeSectionAt(idx);
    };

    deleteCallbacksRef.current.set(id, cb);
    return cb;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement, restrictToVerticalAxis]}
      autoScroll={false}
    >
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <VStack gap="3" w="full" align="stretch" p="4" h="full" overflowX="visible">
          {fields.map((field, index) => (
            <SectionEditor
              key={field.id}
              id={field.id}
              index={index}
              onDelete={getDeleteCallback(field.id)}
            />
          ))}

          <HStack justify="center" py="2" gap="2">
            <Button onClick={() => addSection('simple')} variant="ghost" size="sm">
              <PiPlus /> Add Simple Section
            </Button>
            <Button onClick={() => addSection('detailed')} variant="ghost" size="sm">
              <PiPlus /> Add Detailed Section
            </Button>
          </HStack>
        </VStack>
      </SortableContext>
    </DndContext>
  );
}
