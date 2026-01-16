import { DataList, Heading, HStack, Link, List, Tag, Text, VStack, Wrap } from '@chakra-ui/react';
import { PiCheck } from 'react-icons/pi';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import { DisplayDate } from '@/components/custom/DisplayDate';
import { useDrawerContext } from '@/pages/listings-page/drawer/drawerContext';
import type { Listing } from '@/types/listing';

function Header({ listing }: { listing: Listing }) {
  return (
    <HStack gap="2" align="start" px="3" mb="4">
      <CompanyLogo domain={listing.domain} companyName={listing.company} size="xl" />
      <VStack alignItems="start" gap="0" flex="1" minW="0">
        <Text fontSize="xl" fontWeight="bold" lineHeight="shorter">
          {listing.company}
        </Text>
        <Link
          href={listing.url}
          variant="underline"
          fontSize="sm"
          target="_blank"
          color="fg.info"
          truncate
          display="block"
          w="full"
        >
          {listing.url}
        </Link>
      </VStack>
    </HStack>
  );
}

export function Info() {
  const { listing } = useDrawerContext();

  return (
    <>
      <Header listing={listing} />
      <VStack px="4" gap="4" align="stretch">
        <VStack align="stretch">
          <Heading size="md">About the Role</Heading>
          <DataList.Root orientation="horizontal" w="full" gap="2" size="lg">
            <DataList.Item>
              <DataList.ItemLabel>Role</DataList.ItemLabel>
              <DataList.ItemValue>{listing.title}</DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>Location</DataList.ItemLabel>
              <DataList.ItemValue>{listing.location}</DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>Posted</DataList.ItemLabel>
              <DataList.ItemValue>
                <DisplayDate date={listing.postedDate} />
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

        <VStack align="stretch">
          <Heading size="md">Description</Heading>
          <Text color="fg.muted">{listing.description}</Text>
        </VStack>

        <VStack align="stretch">
          <Heading size="md">Requirements</Heading>
          <List.Root variant="plain">
            {listing.requirements.map((req, index) => (
              <List.Item key={index}>
                <List.Indicator asChild color="green">
                  <PiCheck />
                </List.Indicator>
                <Text color="fg.muted">{req}</Text>
              </List.Item>
            ))}
          </List.Root>
        </VStack>
      </VStack>
    </>
  );
}
