import {
  Button,
  createListCollection,
  Field,
  Heading,
  HStack,
  Icon,
  Portal,
  RadioCard,
  Select,
  Steps,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LuArrowRight, LuCheck, LuFlaskConical } from 'react-icons/lu';
import { SiGooglegemini, SiOpenai } from 'react-icons/si';
import { Navigate, useNavigate } from 'react-router';

import { AuthSplitLayout } from '@/components/layouts/auth-split';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toaster } from '@/components/ui/Toaster';
import { useAuth } from '@/hooks/use-auth.hooks';
import { useTestModelProvider } from '@/mutations/onboarding.mutations';
import { useUpdateSettings } from '@/mutations/setting.mutations';
import { settingsQueries } from '@/queries/setting.queries';
import { Loader } from '@/routes/base-route/Loader';
import type { ModelProvider } from '@/types/onboarding.types';
import type { SettingsSection } from '@/types/setting.types';

import { OnboardingAside } from './Aside';

type OnboardingFormValues = {
  provider: ModelProvider | null;
  apiKey: string;
  model: string;
};

type ProviderConfig = {
  label: string;
  icon: ReactNode;
};

const PROVIDER_CONFIG: Record<ModelProvider, ProviderConfig> = {
  openai: {
    label: 'OpenAI',
    icon: <SiOpenai />,
  },
  gemini: {
    label: 'Gemini',
    icon: <SiGooglegemini />,
  },
};

const ONBOARDING_STEPS = [
  { title: 'Provider' },
  { title: 'API key' },
  { title: 'Model' },
  { title: 'Test' },
] as const;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { isLoaded, accessMode } = useAuth();
  const { data: settings } = useSuspenseQuery(settingsQueries.list());
  const { control, handleSubmit, register, setValue, watch } = useForm<OnboardingFormValues>({
    defaultValues: {
      provider: null,
      apiKey: '',
      model: '',
    },
  });
  const provider = watch('provider');
  const apiKey = watch('apiKey');
  const model = watch('model');

  const testModelProviderMutation = useTestModelProvider();
  const updateSettingsMutation = useUpdateSettings();

  const hasProvider = provider !== null;
  const hasApiKey = apiKey.trim().length > 0;
  const canChooseModel = hasProvider && hasApiKey;
  const canTest = canChooseModel && model.length > 0;
  const canSave = testModelProviderMutation.isSuccess;
  const activeStep = getActiveStep(provider, apiKey, model);
  const providerOptions = useMemo(() => getProviderOptions(settings), [settings]);
  const providerModels = useMemo(() => getModelOptions(settings, provider), [settings, provider]);
  const modelCollection = useMemo(
    () =>
      createListCollection({
        items: providerModels.map((modelOption) => ({
          label: modelOption,
          value: modelOption,
        })),
      }),
    [providerModels]
  );
  if (!isLoaded) {
    return <Loader />;
  }

  if (accessMode === 'signed_out') {
    return <Navigate to="/auth" replace />;
  }

  function resetTestState() {
    testModelProviderMutation.reset();
  }

  function handleTestProvider() {
    if (!provider || !canTest) {
      return;
    }

    testModelProviderMutation.mutate({
      provider,
      apiKey: apiKey.trim(),
      model,
    });
  }

  async function handleSaveAndProceed(values: OnboardingFormValues) {
    if (!values.provider || !canSave) {
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        model: {
          api_key: values.apiKey.trim(),
          llm: values.model,
          provider: values.provider,
          embedding: getEmbeddingModel(settings, values.provider),
        },
      });
      toaster.success({ title: 'AI provider saved' });
      navigate('/');
    } catch {
      toaster.error({ title: 'Failed to save AI provider' });
    }
  }

  return (
    <AuthSplitLayout aside={<OnboardingAside provider={provider} />}>
      <VStack
        as="form"
        align="stretch"
        gap="lg"
        w="xl"
        maxW="full"
        onSubmit={handleSubmit(handleSaveAndProceed)}
      >
        <VStack align="start" gap="xs">
          <Heading textStyle="title-lg">Set up AI in Atto</Heading>
          <Text textStyle="caption">
            Connect a model provider now, or skip and add one later from Settings.
          </Text>
        </VStack>

        <Steps.Root step={activeStep} count={ONBOARDING_STEPS.length} size="xs">
          <Steps.List>
            {ONBOARDING_STEPS.map((step, index) => (
              <Steps.Item key={step.title} index={index} title={step.title}>
                <Steps.Indicator />
                <Steps.Title>{step.title}</Steps.Title>
                <Steps.Separator />
              </Steps.Item>
            ))}
          </Steps.List>
        </Steps.Root>

        <Field.Root required>
          <Field.Label textStyle="caption">Model provider</Field.Label>
          <Controller
            control={control}
            name="provider"
            render={({ field }) => (
              <RadioCard.Root
                value={field.value}
                orientation="vertical"
                w="full"
                onValueChange={(details) => {
                  if (!isModelProvider(details.value) || !providerOptions.includes(details.value)) {
                    return;
                  }

                  if (details.value !== field.value) {
                    setValue('apiKey', '');
                  }
                  field.onChange(details.value);
                  setValue('model', '');
                  resetTestState();
                }}
              >
                <HStack w="full" align="stretch" flexDir={{ base: 'column', md: 'row' }}>
                  {providerOptions.map((providerOption) => (
                    <RadioCard.Item key={providerOption} value={providerOption} flex="1" w="full">
                      <RadioCard.ItemHiddenInput />
                      <RadioCard.ItemControl h="full" minH="24" justifyContent="center">
                        <Icon size="xl" color="fg.muted">
                          {PROVIDER_CONFIG[providerOption].icon}
                        </Icon>
                        <RadioCard.ItemText textStyle="body">
                          {PROVIDER_CONFIG[providerOption].label}
                        </RadioCard.ItemText>
                      </RadioCard.ItemControl>
                    </RadioCard.Item>
                  ))}
                </HStack>
              </RadioCard.Root>
            )}
          />
        </Field.Root>

        <Field.Root required disabled={!hasProvider}>
          <Field.Label textStyle="caption">API key</Field.Label>
          <PasswordInput
            disabled={!hasProvider}
            placeholder="Paste your API key"
            {...register('apiKey', { onChange: resetTestState })}
          />
          <Field.HelperText textStyle="caption">
            The key is stored locally in your Atto config.
          </Field.HelperText>
        </Field.Root>

        <Field.Root required disabled={!canChooseModel}>
          <Field.Label textStyle="caption">Model</Field.Label>
          <Controller
            control={control}
            name="model"
            render={({ field }) => (
              <Select.Root
                collection={modelCollection}
                value={field.value ? [field.value] : []}
                disabled={!canChooseModel}
                onValueChange={(details) => {
                  const nextModel = details.value[0];

                  if (!nextModel || !providerModels.includes(nextModel)) {
                    return;
                  }

                  field.onChange(nextModel);
                  resetTestState();
                }}
              >
                <Select.HiddenSelect />
                <Select.Control w="full">
                  <Select.Trigger>
                    <Select.ValueText placeholder="Choose a model" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {modelCollection.items.map((modelOption) => (
                        <Select.Item key={modelOption.value} item={modelOption}>
                          {modelOption.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            )}
          />
          <Field.HelperText textStyle="caption">Choose the model Atto will use.</Field.HelperText>
        </Field.Root>

        <VStack align="stretch" gap="2xs">
          {canSave ? (
            <Button type="submit" loading={updateSettingsMutation.isPending}>
              Save and proceed <LuCheck />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!canTest}
              loading={testModelProviderMutation.isPending}
              onClick={handleTestProvider}
            >
              Test connection <LuFlaskConical />
            </Button>
          )}

          <TestConnectionStatus
            message={getTestConnectionMessage(
              testModelProviderMutation.data,
              testModelProviderMutation.error
            )}
            isSuccessful={testModelProviderMutation.isSuccess}
            isLoading={testModelProviderMutation.isPending}
          />
        </VStack>

        <VStack align="stretch" gap="xs">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Skip <LuArrowRight />
          </Button>
          <Text textStyle="caption" textAlign="center">
            Skipping leaves most AI-powered features unusable until a provider is added.
          </Text>
        </VStack>
      </VStack>
    </AuthSplitLayout>
  );
}

function TestConnectionStatus({
  message,
  isSuccessful,
  isLoading,
}: {
  message: string;
  isSuccessful: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <HStack minH="5" gap="xs" color="fg.muted">
        <Text textStyle="caption">Testing connection...</Text>
      </HStack>
    );
  }

  if (!message) {
    return (
      <HStack minH="5" gap="xs" color="fg.muted">
        <Text textStyle="caption">Run a test before saving.</Text>
      </HStack>
    );
  }

  return (
    <HStack minH="5" gap="xs" color={isSuccessful ? 'fg.success' : 'fg.error'}>
      <Text textStyle="caption" color="inherit" lineClamp={2}>
        {isSuccessful ? 'Connection verified:' : 'Test failed:'} {message}
      </Text>
    </HStack>
  );
}

function getTestConnectionMessage(data: string | undefined, error: Error | null): string {
  if (error) {
    return error.message;
  }

  return data ?? '';
}

function getActiveStep(provider: ModelProvider | null, apiKey: string, model: string): number {
  if (!provider) {
    return 0;
  }
  if (apiKey.trim().length === 0) {
    return 1;
  }
  if (!model) {
    return 2;
  }
  return 3;
}

function isModelProvider(value: string | null): value is ModelProvider {
  return value === 'openai' || value === 'gemini';
}

function getProviderOptions(settings: Record<string, SettingsSection>): ModelProvider[] {
  const providerField = settings.model?.fields.provider;

  if (providerField?.type !== 'string') {
    return [];
  }

  return (providerField.enum ?? []).filter(isModelProvider);
}

function getModelOptions(
  settings: Record<string, SettingsSection>,
  provider: ModelProvider | null
): string[] {
  if (!provider) {
    return [];
  }

  const modelField = settings.model?.fields.llm;
  if (modelField?.type !== 'string') {
    return [];
  }

  return modelField.enumByProvider?.[provider] ?? modelField.enum ?? [];
}

function getEmbeddingModel(
  settings: Record<string, SettingsSection>,
  provider: ModelProvider
): string {
  const embeddingField = settings.model?.fields.embedding;

  if (embeddingField?.type !== 'string') {
    return '';
  }

  return embeddingField.enumByProvider?.[provider]?.[0] ?? String(embeddingField.value ?? '');
}
