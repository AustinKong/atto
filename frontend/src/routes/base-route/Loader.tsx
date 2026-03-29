import { Center, Spinner } from '@chakra-ui/react';

export function Loader() {
  return (
    <Center h="full" w="full">
      <Spinner />
    </Center>
  );
}
