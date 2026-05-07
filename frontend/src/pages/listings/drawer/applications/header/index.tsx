import {
  Button,
  HStack,
  Icon,
  IconButton,
  Menu,
  Portal,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { LuArrowUpRight, LuChevronDown, LuFileText } from 'react-icons/lu';
import { PiPlus } from 'react-icons/pi';
import { Link, useNavigate, useParams } from 'react-router';

import type { Listing } from '@/types/listing.types';

import { Section } from '../../Section';
import { CreateApplicationModal } from './CreateApplicationModal';

export function Header({ listing }: { listing: Listing }) {
  const { listingId, applicationId } = useParams<{
    listingId: string;
    applicationId?: string;
  }>();
  const navigate = useNavigate();
  const { open, onOpen, setOpen } = useDisclosure();

  const selectedApplicationId = applicationId ?? null;
  const application = listing.applications.find((app) => app.id === selectedApplicationId) ?? null;
  const applicationTitle = application?.name ?? 'Select application';
  const hasApplications = listing.applications.length > 0;

  return (
    <Section
      title={
        <Menu.Root positioning={{ placement: 'bottom-start' }}>
          <Menu.Trigger asChild>
            <HStack align="center" gap="xs" cursor="pointer" userSelect="none">
              {applicationTitle}
              <Icon color="fg.muted">
                <LuChevronDown />
              </Icon>
            </HStack>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="64">
                {hasApplications ? (
                  listing.applications.map((app) => (
                    <Menu.Item
                      key={app.id}
                      value={app.id}
                      onClick={() => {
                        if (!listingId) return;
                        navigate(`/listings/${listingId}/applications/${app.id}`);
                      }}
                    >
                      {app.name}
                    </Menu.Item>
                  ))
                ) : (
                  <Menu.Item value="none" disabled>
                    No applications yet
                  </Menu.Item>
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      }
      action={
        <IconButton
          aria-label="Create new application"
          variant="plain"
          size="xs"
          mr="-3"
          onClick={onOpen}
        >
          <PiPlus />
        </IconButton>
      }
    >
      <Stack direction={{ base: 'column', md: 'row' }} gap="xs">
        {application ? (
          <Button asChild variant="outline" flex="1">
            <Link
              to={`/listings/${listing.id}/applications/${application.id}/resumes/${application.resumeId}`}
            >
              View Resume
              <LuArrowUpRight />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" disabled flex="1">
            View Resume
            <LuArrowUpRight />
          </Button>
        )}
        <Button variant="outline" disabled flex="1">
          <LuFileText />
          View CV (Planned)
        </Button>
      </Stack>

      <CreateApplicationModal
        open={open}
        onOpenChange={setOpen}
        onCreated={(createdApplicationId) => {
          if (!listingId) return;
          navigate(`/listings/${listingId}/applications/${createdApplicationId}`);
        }}
      />
    </Section>
  );
}
