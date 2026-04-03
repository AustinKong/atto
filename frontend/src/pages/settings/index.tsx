import { Box, Button, Separator, Text, VStack } from '@chakra-ui/react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { toaster } from '@/components/ui/Toaster';
import { settingsQueries } from '@/queries/setting.queries';
import { updateSettings } from '@/services/setting.service';

import { Section } from './Section';
import { Toolbar } from './Toolbar';

export function SettingsPage() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const queryClient = useQueryClient();
  const { data: settings } = useSuspenseQuery(settingsQueries.list());

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsQueries.list().queryKey, updatedSettings);
      toaster.create({ title: 'Settings updated successfully', type: 'success' });
    },
    onError: () => {
      toaster.create({ title: 'Failed to update settings', type: 'error' });
    },
  });

  // Flatten settings for useForm defaultValues
  const defaultValues = React.useMemo(() => {
    if (!settings) return {};
    const result: Record<string, unknown> = {};
    Object.entries(settings).forEach(([section, sectionData]) => {
      Object.entries(sectionData.fields).forEach(([fieldName, field]) => {
        result[`${section}.${fieldName}`] = field.value;
      });
    });
    return result;
  }, [settings]);

  const visibleSections = React.useMemo(() => {
    if (!settings) return [];

    return Object.entries(settings)
      .map(([sectionName, sectionData]) => {
        const fields = Object.entries(sectionData.fields).filter(
          ([, field]) =>
            field.exposure === 'normal' ||
            field.exposure === 'secret' ||
            (field.exposure === 'advanced' && showAdvanced)
        );

        return {
          id: sectionName,
          title: sectionData.title,
          description: sectionData.description,
          fields,
        };
      })
      .filter((section) => section.fields.length > 0);
  }, [settings, showAdvanced]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<Record<string, unknown>>({
    values: defaultValues,
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/dev/seed', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to seed database');
      }
    },
    onSuccess: () => {
      toaster.create({
        title: 'Database seeded successfully',
        description: 'Demo data has been added to the database',
        type: 'success',
      });
    },
    onError: (error) => {
      toaster.create({
        title: 'Seed failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        type: 'error',
      });
    },
  });

  const nukeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/dev/nuke', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to nuke database');
      }
    },
    onSuccess: () => {
      toaster.create({
        title: 'Database cleared',
        description: 'Shutting down application...',
        type: 'success',
      });
    },
    onError: (error) => {
      toaster.create({
        title: 'Nuke failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        type: 'error',
      });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const dirtyData: Record<string, unknown> = {};
    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dirtyData[key] = data[key];
      }
    });

    await updateSettingsMutation.mutateAsync(dirtyData);
  });

  return (
    <VStack h="full" w="full" as="form" align="stretch" onSubmit={onSubmit} gap="0">
      <Toolbar
        showAdvanced={showAdvanced}
        onShowAdvancedChange={setShowAdvanced}
        isDirty={isDirty}
        isLoading={updateSettingsMutation.isPending}
      />
      <Box overflowY="auto">
        <VStack
          gap="2xl"
          p="xl"
          maxW={{ base: 'full', md: 'breakpoint-md', lg: 'breakpoint-lg' }}
          w="full"
          align="stretch"
        >
          {visibleSections.map((section, index) => (
            <React.Fragment key={section.id}>
              <Section
                name={section.id}
                title={section.title}
                description={section.description}
                fields={section.fields}
                register={register}
                control={control}
                errors={errors}
              />
              {index < visibleSections.length - 1 && <Separator w="full" />}
            </React.Fragment>
          ))}

          {showAdvanced && (
            <>
              <Separator w="full" />
              <VStack align="stretch" gap="md">
                <Text textStyle="lg" color="fg.error">
                  ⚠️ Developer Tools
                </Text>
                <Text color="fg.error">
                  Dangerous operations that will permanently delete data. Use with extreme caution.
                </Text>
                <VStack align="stretch" gap="xs">
                  <Button
                    onClick={() => seedMutation.mutate()}
                    loading={seedMutation.isPending}
                    size="sm"
                  >
                    Seed Database with Demo Data
                  </Button>
                  <Button
                    colorPalette="red"
                    onClick={() => nukeMutation.mutate()}
                    loading={nukeMutation.isPending}
                    size="sm"
                  >
                    Nuke Database
                  </Button>
                </VStack>
              </VStack>
            </>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}
