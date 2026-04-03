import { baseRoute } from '@/routes';

import { SignUpPage } from './index';

export function signupRoute() {
  return baseRoute({
    path: 'sign-up',
    element: <SignUpPage />,
  });
}
