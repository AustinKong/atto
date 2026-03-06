import type { QueryClient } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

import { ErrorElement } from '@/components/ui/ErrorBoundary';
import { templatesRoute } from '@/pages/templates-page/route';
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
    loader: resumeLoader(queryClient),
    handle: { breadcrumb: 'Resume' },
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <ResumePage />,
      },
      templatesRoute,
    ],
  };
}
