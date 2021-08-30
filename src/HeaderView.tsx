import { HamburgerIcon, EditIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  BoxProps,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { useLoggedInUserData } from './authContext';
import { LikeButton } from './LikeButton';
import { Login } from './Login';
import { Logo } from './Logo';
import { registryLinks } from './registryLinks';
import { ShareButton } from './ShareButton';
import { useSourceActor } from './sourceMachine';

export const HeaderView: React.FC<BoxProps> = (props) => {
  const [sourceState] = useSourceActor();

  const loggedInUserData = useLoggedInUserData();
  const registryData = sourceState.context.sourceRegistryData;
  const userOwnsSource = loggedInUserData?.id === registryData?.owner?.id;

  return (
    <Box {...props} background="gray.800">
      <HStack zIndex={1} justifyContent="space-between" height="3rem">
        <Link
          href="/"
          title="Stately.ai"
          display="block"
          height="100%"
          _hover={{
            opacity: 0.8,
          }}
          target="_blank"
          rel="noopener noreferrer"
          marginRight="auto"
        >
          <Logo
            fill="white"
            style={{
              // @ts-ignore
              '--fill': 'white',
              height: '100%',
              padding: '0 .5rem',
            }}
            aria-label="Stately"
          />
        </Link>
        {registryData && (
          <Stack direction="row" spacing="4" alignItems="center" pr="4">
            <Text fontWeight="semibold" fontSize="sm" color="gray.100">
              {registryData?.name || 'Unnamed Source'}
            </Text>
            <HStack>
              <LikeButton />
              <ShareButton sourceId={registryData.id} />
              <Menu closeOnSelect>
                <MenuButton>
                  <IconButton
                    aria-label="Menu"
                    icon={<HamburgerIcon />}
                    size="sm"
                  ></IconButton>
                </MenuButton>
                <MenuList>
                  {userOwnsSource && sourceState.context.sourceID && (
                    <MenuItem
                      as="a"
                      href={registryLinks.editSourceFile(
                        sourceState.context.sourceID,
                      )}
                    >
                      <HStack spacing="3">
                        <EditIcon aria-hidden />
                        <Text>Edit</Text>
                      </HStack>
                    </MenuItem>
                  )}
                  {registryData.owner && (
                    <MenuItem
                      as="a"
                      href={registryLinks.viewUserById(registryData?.owner?.id)}
                    >
                      <HStack spacing="3">
                        <Avatar
                          src={registryData.owner?.avatarUrl || ''}
                          name={registryData.owner?.displayName || ''}
                          size="xs"
                          height="24px"
                          width="24px"
                        ></Avatar>
                        <Text>View Author</Text>
                      </HStack>
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </HStack>
          </Stack>
        )}
        <Login />
      </HStack>
    </Box>
  );
};