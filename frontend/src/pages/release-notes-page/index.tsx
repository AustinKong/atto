import { Alert, Link as ChakraLink, VStack } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LuExternalLink } from 'react-icons/lu';
import Markdown from 'react-markdown';
import { useParams } from 'react-router';
import remarkGfm from 'remark-gfm';

import { Prose } from '@/components/ui/prose';
import { releaseNotesQueries } from '@/queries/releaseNotes';
import { getCurrentVersion } from '@/services/releaseNotes';

export function ReleaseNotesPage() {
  const { version } = useParams<{ version: string }>();
  const { data: releaseNotes } = useSuspenseQuery(releaseNotesQueries.item(version!));

  return (
    <VStack h="full" overflowY="auto" p="2">
      {releaseNotes.version !== getCurrentVersion() && (
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Your version of Atto is out of date!</Alert.Title>
            <Alert.Description>
              You are viewing the release notes for {releaseNotes.version}, but your current version
              is {getCurrentVersion()}. Please update to the latest version to enjoy the newest
              features and improvements.
            </Alert.Description>
          </Alert.Content>
          <ChakraLink
            href={`https://github.com/AustinKong/atto/releases/tag/${releaseNotes.version}`}
            alignSelf="center"
            target="_blank"
          >
            <LuExternalLink />
            Update Now
          </ChakraLink>
        </Alert.Root>
      )}
      <Prose p="6" w="full" maxW="120ch">
        <Markdown remarkPlugins={[remarkGfm]}>{releaseNotes.notes}</Markdown>
      </Prose>
    </VStack>
  );
}
