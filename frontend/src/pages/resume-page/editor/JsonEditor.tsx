import { CodeBlock } from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { useColorMode } from '@/components/ui/color-mode';
import { resumeQueries } from '@/queries/resume';

export function JsonEditor() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume } = useSuspenseQuery(resumeQueries.item(resumeId!));
  const { colorMode } = useColorMode();

  const jsonString = JSON.stringify({ sections: resume.sections }, null, 2);

  return (
    <CodeBlock.Root
      code={jsonString}
      language="json"
      meta={{ colorScheme: colorMode }}
      border="none"
      h="fit-content"
    >
      <CodeBlock.Content>
        <CodeBlock.Code>
          <CodeBlock.CodeText />
        </CodeBlock.Code>
      </CodeBlock.Content>
    </CodeBlock.Root>
  );
}
