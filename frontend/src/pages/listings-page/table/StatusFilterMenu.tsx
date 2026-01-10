import { HStack, Menu, Portal, Text } from '@chakra-ui/react';
import type { Dispatch, SetStateAction } from 'react';
import { PiSliders } from 'react-icons/pi';

import { STATUS_FILTER_OPTIONS } from '@/constants/statuses';
import type { StatusEnum } from '@/types/application';

export function StatusFilterMenu({
  statuses,
  setStatuses,
}: {
  statuses: StatusEnum[];
  setStatuses: Dispatch<SetStateAction<StatusEnum[]>>;
}) {
  const handleStatusChange = (status: StatusEnum, checked: boolean) => {
    setStatuses((prev) => {
      if (checked) {
        return [...prev, status] as StatusEnum[];
      } else {
        return prev.filter((s) => s !== status);
      }
    });
  };

  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger asChild>
        <HStack
          alignItems="center"
          gap="1"
          cursor="pointer"
          userSelect="none"
          onClick={(e) => e.stopPropagation()}
        >
          <Text>Status {statuses.length > 0 && `(${statuses.length})`}</Text>
          {statuses.length == 0 && <PiSliders size="14" />}
        </HStack>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>Filter by Status</Menu.ItemGroupLabel>
              {STATUS_FILTER_OPTIONS.map((option) => (
                <Menu.CheckboxItem
                  key={option.value}
                  value={option.value}
                  checked={statuses.includes(option.value)}
                  onCheckedChange={(checked) => handleStatusChange(option.value, checked)}
                >
                  <option.icon />
                  <Text>{option.label}</Text>
                  <Menu.ItemIndicator />
                </Menu.CheckboxItem>
              ))}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
