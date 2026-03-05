import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { resumeQueries } from '@/queries/resume';

import { ResumePage } from './index';

function resumeLoader(queryClient: QueryClient) {
  return async ({ params }: LoaderFunctionArgs) => {
    const { resumeId } = params;
    if (!resumeId) throw new Error('Resume ID is required');

    const resume = await queryClient.ensureQueryData(resumeQueries.item(resumeId));
    return { resume };
  };
}

// /resumes/:resumeId (no breadcrumb context needed)
export function resumeRoute(queryClient: QueryClient) {
  return {
    path: 'resumes/:resumeId',
    element: <ResumePage />,
    loader: resumeLoader(queryClient),
    handle: { breadcrumb: 'Resume' },
    errorElement: <ErrorElement />,
  };
}
