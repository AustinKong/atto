import { createDialogContext } from '@/hooks/use-dialog-context.hooks';

export interface IngestionScrapeData {
  id: string;
  url: string;
}

const { Provider, useContextHook, Context } = createDialogContext<IngestionScrapeData>('Ingestion');

export const IngestionProvider = Provider;
export const useIngestion = useContextHook;
export const IngestionContext = Context;
