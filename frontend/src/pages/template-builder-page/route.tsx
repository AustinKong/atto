import { TemplateBuilderPage } from './index';

export function templateBuilderRoute() {
  return {
    path: '/template-builder',
    element: <TemplateBuilderPage />,
    handle: { breadcrumb: 'Template Builder' },
  };
}
