import { CodeBlock } from '@chakra-ui/react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useColorMode } from '@/components/ui/color-mode';
import type { ResumeFormData } from '@/types/resume';

export function JsonEditor() {
  const { control } = useFormContext<ResumeFormData>();
  const { colorMode } = useColorMode();

  const formData = useWatch({
    control,
    name: 'data',
  });

  const jsonString = JSON.stringify(formData, null, 2);

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
