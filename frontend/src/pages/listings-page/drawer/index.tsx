import { Box, Center, CloseButton, Spinner, Tabs } from '@chakra-ui/react';
import { Link, Outlet, useMatch, useNavigate, useParams } from 'react-router';

import { useListingQuery } from '@/hooks/listings';

import { type DrawerContext } from './drawerContext';

export { Applications } from './applications';
export { Info } from './info';
export { Research } from './research';

export function ListingDrawer() {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string; applicationId?: string }>();
  const { data: listing, isLoading } = useListingQuery(listingId!);

  const isResearch = useMatch('/listings/:listingId/research');
  const isApplications = useMatch('/listings/:listingId/applications/*');

  const activeTab = isResearch ? 'research' : isApplications ? 'applications' : 'info';

  if (isLoading) {
    return (
      <Center h="full">
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!listing) {
    return (
      <Center h="full">
        <CloseButton
          position="absolute"
          right="0"
          onClick={() => navigate('/listings', { replace: true })}
          variant="plain"
        />
        Listing not found.
      </Center>
    );
  }

  return (
    <Tabs.Root h="full" display="flex" flexDirection="column" value={activeTab} navigate={() => {}}>
      <Tabs.List borderBottom="none">
        <Tabs.Trigger value="info" asChild>
          <Link to={`/listings/${listingId}`}>Details</Link>
        </Tabs.Trigger>
        <Tabs.Trigger value="applications" asChild>
          <Link to={`/listings/${listingId}/applications`}>Applications</Link>
        </Tabs.Trigger>
        <Tabs.Trigger value="research" asChild>
          <Link to={`/listings/${listingId}/research`}>Research</Link>
        </Tabs.Trigger>
        <CloseButton
          position="absolute"
          right="0"
          onClick={() => navigate('/listings', { replace: true })}
          variant="plain"
        />
      </Tabs.List>
      <Box flex="1" overflowY="auto" py="2">
        <Outlet context={{ listing } satisfies DrawerContext} />
      </Box>
    </Tabs.Root>
  );
}
