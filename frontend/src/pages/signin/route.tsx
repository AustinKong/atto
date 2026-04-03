import { baseRoute } from '@/routes';

import { SignInPage } from './index';

export function signinRoute() {
  return baseRoute({
    path: 'sign-in',
    element: <SignInPage />,
  });
}
