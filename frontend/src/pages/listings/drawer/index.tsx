import { CloseButton, Icon, Tabs } from '@chakra-ui/react';
import { LuArrowUpRight } from 'react-icons/lu';
import { Link, useNavigate, useParams } from 'react-router';

import { Info as DetailsTab } from './info';
import { Intelligence as IntelligenceTab } from './research';

export function ListingDrawer() {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();

  return (
    <Tabs.Root defaultValue="info">
      <Tabs.List>
        <Tabs.Trigger value="info">Info</Tabs.Trigger>
        <Tabs.Trigger value="research">Research</Tabs.Trigger>
        <Tabs.Trigger value="applications" asChild>
          <Link to={`/listings/${listingId}/applications`}>
            Applications{' '}
            <Icon size="md">
              <LuArrowUpRight />
            </Icon>
          </Link>
        </Tabs.Trigger>
        <CloseButton
          position="absolute"
          right="0"
          onClick={() => navigate('/listings', { replace: true })}
          variant="plain"
        />
      </Tabs.List>
      <Tabs.Content value="info">
        <DetailsTab />
      </Tabs.Content>
      <Tabs.Content value="research">
        <IntelligenceTab />
      </Tabs.Content>
    </Tabs.Root>
  );
}
