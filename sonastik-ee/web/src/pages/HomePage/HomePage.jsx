import {
  AppShell,
  Flex,
  Image,
  Title,
  Stack,
  Grid,
  Center,
  Anchor,
  Text,
} from '@mantine/core'
import { Metadata } from '@redwoodjs/web'

const HomePage = () => {
  return (
    <>
      <Metadata
        title="Sõnastik - An Estonian language dictionary"
        description="A browser extension for Estonian language dictionary"
      />

      <AppShell padding="md">
        <AppShell.Main mb={{ base: 40, md: 0 }}>
          <Flex align="center" justify="center" gap="xs">
            <Anchor href="/" c="black">
              <Title
                order={1}
                ff="Estonia, cursive"
                fw={700}
                style={{ fontSize: 80 }}
              >
                Sõnastik
              </Title>
            </Anchor>
          </Flex>
          <Grid mt="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Center h={{ base: 'auto', md: 350 }}>
                <Stack gap="md">
                  <Title order={2} ff="Noto Serif Khojki, serif">
                    A browser extension to find the explanation of any Estonian
                    word on any website.
                  </Title>
                  <Title order={4} ff="Noto Serif Khojki, serif">
                    You only need to select the word, right click, then click on
                    the "Explain" button.
                  </Title>
                  <Text ff="Noto Serif Khojki, serif">
                    Install on your browser:
                  </Text>
                  <Flex align="center" gap="md">
                    <Anchor
                      href="https://chromewebstore.google.com/detail/sonastik/ijdjjhijnaefjpgmmhklebjmobkcnndf"
                      target="_blank"
                    >
                      <Image
                        src="/chrome-store.png"
                        alt="Chrome icon"
                        h={{ base: 'auto', md: 60 }}
                        w={{ base: 100, md: 'auto' }}
                      />
                    </Anchor>
                    <Anchor
                      href="https://addons.mozilla.org/en-US/firefox/addon/s%C3%B5nastik/"
                      target="_blank"
                    >
                      <Image
                        src="/firefox-addons.svg"
                        alt="Firefox icon"
                        h={{ base: 'auto', md: 60 }}
                        w={{ base: 100, md: 'auto' }}
                      />
                    </Anchor>
                  </Flex>
                </Stack>
              </Center>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Image
                src="/main-image.jpg"
                alt="Main image"
                h={{ base: 'auto', md: '100%' }}
                w={{ base: '100%' }}
              />
            </Grid.Col>
          </Grid>
        </AppShell.Main>
        <AppShell.Footer py="md" withBorder={false}>
          <Text size="xs" ta="center">
            Made with 💙🖤🤍 by Chloe &amp; Matt OÜ
          </Text>
          <Text size="xs" ta="center">
            &copy; 2023-{new Date().getFullYear()} All rights reserved.
          </Text>
        </AppShell.Footer>
      </AppShell>
    </>
  )
}

export default HomePage
