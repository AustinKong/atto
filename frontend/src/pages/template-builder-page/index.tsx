import {
  Box,
  Button,
  createListCollection,
  HStack,
  IconButton,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { PiArrowClockwise, PiMagnifyingGlass } from 'react-icons/pi';

import { ReadonlyResumePreview } from '@/components/shared/resume-preview';
import { templateQueries } from '@/queries/template';

import { EDGE_CASE_PRESETS } from './presets';

export function TemplateBuilderPage() {
  const queryClient = useQueryClient();
  const {
    data: templateData,
    isLoading: namesLoading,
    refetch: refetchNames,
  } = useQuery(templateQueries.list());
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>(Object.keys(EDGE_CASE_PRESETS)[0]);

  const templateNames = useMemo(() => templateData?.items || [], [templateData]);

  const templateCollection = createListCollection({
    items: templateNames.map((summary) => ({
      label: summary.title || summary.id,
      value: summary.id,
    })),
  });

  const presetCollection = createListCollection({
    items: Object.keys(EDGE_CASE_PRESETS).map((key) => ({
      label: EDGE_CASE_PRESETS[key as keyof typeof EDGE_CASE_PRESETS].name,
      value: key,
    })),
  });

  // Auto-select first template when templates load
  useEffect(() => {
    if (templateNames.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templateNames[0].id);
    }
  }, [templateNames, selectedTemplate]);

  const preset =
    EDGE_CASE_PRESETS[selectedPreset as keyof typeof EDGE_CASE_PRESETS] ||
    EDGE_CASE_PRESETS[Object.keys(EDGE_CASE_PRESETS)[0]];

  const { data: templateContent } = useQuery({
    ...templateQueries.localItem(selectedTemplate),
    enabled: !!selectedTemplate,
  });

  const handleRefreshTemplate = () => {
    if (selectedTemplate) {
      queryClient.invalidateQueries({
        queryKey: ['templates', 'local', selectedTemplate],
      });
    }
  };

  const handleRefreshNames = () => {
    refetchNames();
  };

  return (
    <VStack h="full" gap="0" alignItems="stretch">
      <HStack p="4" borderBottom="1px solid" borderColor="border" gap="4" wrap="wrap">
        <Box w="250px">
          <Select.Root
            size="sm"
            collection={templateCollection}
            value={selectedTemplate ? [selectedTemplate] : []}
            onValueChange={({ value }) => setSelectedTemplate(value[0] || '')}
            disabled={namesLoading}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select template..." />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner zIndex="popover">
              <Select.Content>
                {(templateCollection.items as Array<{ label: string; value: string }>).map(
                  (item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                    </Select.Item>
                  )
                )}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Box>

        <IconButton
          aria-label="Refresh template names"
          onClick={handleRefreshNames}
          disabled={namesLoading}
          variant="subtle"
        >
          <PiMagnifyingGlass />
        </IconButton>
        <Button onClick={handleRefreshTemplate} disabled={!selectedTemplate}>
          <PiArrowClockwise />
          Rerender template (HMR)
        </Button>

        <Box w="250px">
          <Select.Root
            size="sm"
            collection={presetCollection}
            value={[selectedPreset]}
            onValueChange={({ value }) => setSelectedPreset(value[0])}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select preset..." />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner zIndex="popover">
              <Select.Content>
                {(presetCollection.items as Array<{ label: string; value: string }>).map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Box>
      </HStack>

      <Box resize="both" overflow="auto" w="500px" h="400px">
        {selectedTemplate && templateContent ? (
          <ReadonlyResumePreview
            template={templateContent}
            sections={preset.sections}
            profile={preset.profile}
          />
        ) : (
          <VStack h="full" justify="center" align="center" color="fg.muted">
            <p>Select a template to get started</p>
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
