import {
  Avatar,
  AvatarGroup,
  Button,
  CloseButton,
  Float,
  Group,
  Input,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

import type { Person } from '@/types/application';

/**
 * PersonAvatarInput Component
 *
 * Input component for adding and managing people (referrals, interviewers, etc.)
 * with avatar display and contact information.
 */

interface PersonAvatarInputProps {
  people: Person[];
  onAddPerson: (person: Person) => void;
  onRemovePerson: (index: number) => void;
}

export function PersonAvatarInput({ people, onAddPerson, onRemovePerson }: PersonAvatarInputProps) {
  const [nameInput, setNameInput] = useState('');
  const [contactInput, setContactInput] = useState('');

  const handleAdd = () => {
    if (nameInput.trim()) {
      onAddPerson({
        name: nameInput,
        contact: contactInput || undefined,
        avatarUrl: undefined,
      });
      setNameInput('');
      setContactInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // Calculate how many people are shown vs. hidden
  const visibleCount = Math.min(people.length, 3);
  const hiddenCount = Math.max(0, people.length - 3);

  return (
    <VStack gap="4" w="full" align="stretch">
      {/* Input Section */}
      <Group attached w="full">
        <Input
          flex="1"
          placeholder="Enter name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={handleKeyDown}
          size="sm"
        />
        <Input
          flex="1"
          placeholder="Email or phone"
          value={contactInput}
          onChange={(e) => setContactInput(e.target.value)}
          onKeyDown={handleKeyDown}
          size="sm"
        />
        <Button
          bg="bg.subtle"
          variant="outline"
          onClick={handleAdd}
          disabled={!nameInput.trim()}
          size="sm"
        >
          Add
        </Button>
      </Group>

      {/* Avatar Display Section */}
      {people.length > 0 && (
        <AvatarGroup size="sm" spaceX="1" borderless>
          {people.slice(0, visibleCount).map((person, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <Avatar.Root>
                <Avatar.Fallback name={person.name} />
                {person.avatarUrl && <Avatar.Image src={person.avatarUrl} />}
              </Avatar.Root>
              <Float placement="top-end" offsetX="1" offsetY="1">
                <CloseButton
                  size="2xs"
                  borderRadius="full"
                  onClick={() => onRemovePerson(index)}
                  variant="solid"
                  border="2px solid"
                  borderColor="bg"
                />
              </Float>
            </div>
          ))}
          {hiddenCount > 0 && (
            <Avatar.Root>
              <Avatar.Fallback>+{hiddenCount}</Avatar.Fallback>
            </Avatar.Root>
          )}
        </AvatarGroup>
      )}
    </VStack>
  );
}
