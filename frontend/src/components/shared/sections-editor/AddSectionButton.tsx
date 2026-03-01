import { Button, Menu, Portal } from '@chakra-ui/react';
import { PiPlus } from 'react-icons/pi';

import { sectionTypes } from '@/constants/sectionTypes';
import type { SectionType } from '@/types/resume';

export function AddSectionButton({ onAddSection }: { onAddSection: (type: SectionType) => void }) {
  return (
    <Menu.Root positioning={{ sameWidth: true }}>
      <Menu.Trigger asChild>
        <Button variant="outline" w="full">
          <PiPlus /> Add Section
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content w="full">
            {sectionTypes.map((config) => (
              <Menu.Item
                key={config.type}
                value={config.type}
                onClick={() => onAddSection(config.type)}
              >
                {config.label}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
