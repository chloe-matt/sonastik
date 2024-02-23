import "@mantine/core/styles.css"

import {
  Anchor,
  Box,
  Center,
  Image,
  MantineProvider,
  Stack,
  Text,
  Title
} from "@mantine/core"
import iconImage from "data-base64:~/assets/icon.png"
import globalCss from "data-text:@mantine/core/styles.css"
import shadowCss from "data-text:~/assets/shadow.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = globalCss + shadowCss
  return style
}

function IndexPopup() {
  const currentYear = new Date().getFullYear()

  return (
    <MantineProvider cssVariablesSelector=":host">
      <Box p="lg" w={300}>
        <Center>
          <Stack gap={0}>
            <Center>
              <Image
                src={iconImage}
                radius={8}
                h={50}
                w={50}
                style={{ border: `2px solid gray` }}
              />
            </Center>
            <Title order={4} style={{ textAlign: "center" }}>
              Sõnastik.ee
            </Title>
            <Text size="xs" style={{ textAlign: "center" }}>
              version 1.1.0
            </Text>
          </Stack>
        </Center>
        <Stack gap={0} mt="lg">
          <Text size="xs" style={{ textAlign: "center" }}>
            &copy; 2023-{currentYear}{" "}
            <Anchor
              href="https://www.chloematt.com"
              target="_blank"
              underline="always">
              Chloe &amp; Matt OÜ
            </Anchor>
          </Text>
          <Text size="xs" style={{ textAlign: "center" }}>All Rights Reserved</Text>
        </Stack>
      </Box>
    </MantineProvider>
  )
}

export default IndexPopup
