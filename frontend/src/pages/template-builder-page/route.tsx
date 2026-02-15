import type { RouteObject } from 'react-router';

import { TemplateBuilderPage } from './index';

export const templateBuilderRoute: RouteObject = {
  path: '/template-builder',
  element: <TemplateBuilderPage />,
};
