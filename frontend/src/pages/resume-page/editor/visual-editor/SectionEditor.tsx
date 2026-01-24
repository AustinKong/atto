import { HStack, IconButton, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormContext } from 'react-hook-form';
import { PiDotsSixVertical, PiTrash } from 'react-icons/pi';

import type { ResumeData } from '@/types/resume';

import { DetailedItemEditor } from './DetailedItemEditor';
import { SimpleBulletEditor } from './SimpleBulletEditor';

interface SectionEditorProps {
  id: string;
  index: number;
  onDelete: () => void;
}

export function SectionEditor({ id, index, onDelete }: SectionEditorProps) {
  const { register, watch } = useFormContext<ResumeData>();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const section = watch(`sections.${index}`);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const renderContent = () => {
    if (!section) return null;

    if ('text' in section.content) {
      // Paragraph section
      return (
        <Textarea
          {...register(`sections.${index}.content.text`)}
          placeholder="Enter paragraph text..."
          rows={3}
          variant="flushed"
        />
      );
    } else if ('bullets' in section.content && Array.isArray(section.content.bullets)) {
      const firstBullet = section.content.bullets[0];
      if (firstBullet && typeof firstBullet === 'object' && 'title' in firstBullet) {
        // Detailed section
        return <DetailedItemEditor sectionIndex={index} />;
      } else {
        // Simple section
        return <SimpleBulletEditor sectionIndex={index} />;
      }
    }
    return <Text color="fg.muted">Unknown section type</Text>;
  };

  return (
    <VStack
      ref={setNodeRef}
      style={style}
      w="full"
      align="stretch"
      borderWidth="1px"
      borderRadius="md"
      bg="bg.panel"
      position="relative"
      zIndex={transform ? 1 : 0}
    >
      <HStack justify="space-between" w="full" p="3" bg="bg.subtle">
        <HStack gap="2" flex="1">
          <HStack
            {...attributes}
            {...listeners}
            cursor="grab"
            color="fg.muted"
            _active={{ cursor: 'grabbing' }}
          >
            <PiDotsSixVertical />
          </HStack>

          <Input
            {...register(`sections.${index}.title`)}
            placeholder="Section Title"
            variant="flushed"
            fontWeight="medium"
            flex="1"
          />
        </HStack>

        <IconButton
          variant="ghost"
          size="xs"
          color="fg.error"
          onClick={onDelete}
          aria-label="Delete section"
        >
          <PiTrash />
        </IconButton>
      </HStack>

      <VStack p="4" w="full" align="stretch" overflow="visible">
        {renderContent()}
      </VStack>
    </VStack>
  );
}
