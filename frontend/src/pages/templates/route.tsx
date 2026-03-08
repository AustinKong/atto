import { TemplatesPage } from './index';

export function templatesRoute() {
  return {
    path: '/templates',
    element: <TemplatesPage />,
    handle: { breadcrumb: 'Templates' },
  };
}
