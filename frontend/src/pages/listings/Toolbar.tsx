import { Button, HStack, Input, InputGroup, Spacer } from '@chakra-ui/react';
import { PiMagnifyingGlass, PiPlus } from 'react-icons/pi';
import { Link } from 'react-router';

export function Toolbar({
  searchInput,
  onSearchChange,
}: {
  searchInput: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <HStack p="2xs" borderBottom="subtle">
      <InputGroup startElement={<PiMagnifyingGlass />} w="md">
        <Input
          placeholder="Search listings"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </InputGroup>
      <Spacer />
      <Button asChild>
        <Link to="/listings/new">
          <PiPlus />
          New
        </Link>
      </Button>
    </HStack>
  );
}
