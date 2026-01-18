import { Button, HStack, VStack } from '@chakra-ui/react';
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useRef } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { PiPlus } from 'react-icons/pi';

import type { ResumeFormData, Section } from '@/types/resume';

import { SectionEditor } from './SectionEditor';

export function VisualEditor() {
  const { control } = useFormContext<ResumeFormData>();
  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'data.sections',
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

    // Update order values
    const updatedFields = arrayMove([...fields], oldIndex, newIndex);
    updatedFields.forEach((field, index) => {
      update(index, { ...field, order: index });
    });
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
      order: fields.length,
      content,
    };

    idsRef.current.push(crypto.randomUUID());
    append(newSection);
  };

  const removeSectionAt = (index: number) => {
    const nextIds = [...idsRef.current];
    nextIds.splice(index, 1);
    idsRef.current = nextIds;

    remove(index);

    // Update order values for remaining sections
    fields.forEach((_, i) => {
      if (i >= index && i < fields.length - 1) {
        const field = fields[i + 1];
        update(i, { ...field, order: i });
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={idsRef.current} strategy={verticalListSortingStrategy}>
        <VStack gap="3" w="full" align="stretch" p="4" h="full">
          {fields.map((_field, index) => (
            <SectionEditor
              key={idsRef.current[index]}
              id={idsRef.current[index]}
              index={index}
              onDelete={() => removeSectionAt(index)}
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
