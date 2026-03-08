import { Text, VStack } from '@chakra-ui/react';
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { forwardRef, useImperativeHandle } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { sectionTypes } from '@/constants/section-types.constants';
import { useWatchForm } from '@/hooks/use-watch-form.hooks';
import type { SectionType } from '@/types/resume.types';
import type { Section } from '@/types/resume.types';

import { AddSectionButton } from './AddSectionButton';
import { SectionEditor } from './section-editor';
import type { SectionsEditorData } from './types';

// TODO: If only used by resume editor, move to resume editor folder.
// TODO: Make sections have a "lock" icon to stop them from being customizeable by AI

// Escape-hatch to export reset function for when we want to hard reset the form to defaultValues (e.g., after populating base sections)
// I've already tried using an effect that watches defaultValues, but that will cause input to lose focus when defaultValues change, affecting UX
// I've also tried using key prop to force remount, but that causes the same focus loss issue
export type SectionsEditorHandle = {
  reset: (newSections?: Section[]) => void;
};

export const SectionsEditor = forwardRef<
  SectionsEditorHandle,
  {
    defaultValues: Section[];
    onChange: (sections: Section[]) => void;
  }
>(function SectionsEditor({ defaultValues, onChange }, ref) {
  const methods = useForm<SectionsEditorData>({
    defaultValues: { sections: defaultValues },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: methods.control,
    name: 'sections',
  });

  useWatchForm<SectionsEditorData>((value) => {
    onChange(value.sections as Section[]);
  }, methods.watch);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: { y: 2 } },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    move(oldIndex, newIndex);
  };

  const addSection = (type: SectionType) => {
    const config = sectionTypes.find((t) => t.type === type);
    if (!config) return;

    const newSection: Section = {
      id: crypto.randomUUID(),
      type,
      title: 'New Section',
      content: config.createContent(),
    } as Section;

    append(newSection);
  };

  useImperativeHandle(ref, () => ({
    reset: (newSections) => {
      methods.reset({
        sections: newSections ?? defaultValues,
      });
    },
  }));

  return (
    <FormProvider {...methods}>
      <Text color="fg.muted">Content</Text>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement, restrictToVerticalAxis]}
      >
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <VStack gap="3" align="stretch" asChild>
            <form autoComplete="off" spellCheck="false">
              {fields.map((field, index) => (
                <SectionEditor
                  key={field.id}
                  id={field.id}
                  index={index}
                  onDelete={() => remove(index)}
                />
              ))}
              <AddSectionButton onAddSection={addSection} />
            </form>
          </VStack>
        </SortableContext>
      </DndContext>
    </FormProvider>
  );
});
