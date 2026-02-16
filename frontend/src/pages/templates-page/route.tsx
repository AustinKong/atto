import type { RouteObject } from 'react-router';

import { TemplatesPage } from './index';

export const templatesRoute: RouteObject = {
  path: '/templates',
  element: <TemplatesPage />,
};
