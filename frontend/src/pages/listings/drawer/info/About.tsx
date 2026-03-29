import { DataList, Heading, Tag, VStack, Wrap } from '@chakra-ui/react';

import { DisplayDate } from '@/components/ui/DisplayDate';
import type { Listing } from '@/types/listing.types';
import { formatSalary } from '@/utils/formatters/listing.formatters';

export function About({ listing }: { listing: Listing }) {
  return (
    <VStack align="stretch">
      <Heading size="md">About the Role</Heading>
      <DataList.Root orientation="horizontal" gap="xs" size="lg">
        <DataList.Item>
          <DataList.ItemLabel>Location</DataList.ItemLabel>
          <DataList.ItemValue>{listing.location ?? 'Not specified'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Posted</DataList.ItemLabel>
          <DataList.ItemValue>
            <DisplayDate date={listing.postedDate} />
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Salary</DataList.ItemLabel>
          <DataList.ItemValue>
            {listing.salary ? formatSalary(listing.salary) : 'Not listed'}
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Skills</DataList.ItemLabel>
          <DataList.ItemValue>
            <Wrap>
              {listing.skills.map((skill) => (
                <Tag.Root key={skill} variant="subtle" size="lg">
                  <Tag.Label>{skill}</Tag.Label>
                </Tag.Root>
              ))}
            </Wrap>
          </DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    </VStack>
  );
}
