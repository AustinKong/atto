import { Menu, Portal } from '@chakra-ui/react';
import React from 'react';

import { STATUS_OPTIONS } from '@/constants/status.constants';
import type { StatusEnum } from '@/types/application.types';

type Props = {
  screenPosition: { x: number; y: number };
  onSelect: (status: StatusEnum) => void;
  onClose: () => void;
};

export function StatusPickerMenu({ screenPosition, onSelect, onClose }: Props) {
  return (
    <Portal>
      <div
        style={{
          position: 'fixed',
          left: screenPosition.x,
          top: screenPosition.y,
          zIndex: 1000,
        }}
      >
        <Menu.Root
          open
          onOpenChange={({ open }) => {
            if (!open) onClose();
          }}
        >
          <Menu.Trigger asChild>
            <span style={{ display: 'block', width: 1, height: 1 }} />
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              {STATUS_OPTIONS.map((option) => {
                const Icon = option.icon as React.ComponentType<{ size?: number }>;
                return (
                  <Menu.Item
                    key={option.value}
                    value={option.value}
                    onClick={() => {
                      onSelect(option.value as StatusEnum);
                      onClose();
                    }}
                  >
                    <Icon size={14} />
                    {option.label}
                  </Menu.Item>
                );
              })}
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </div>
    </Portal>
  );
}
