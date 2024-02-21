import "@mantine/core/styles.css"

import {
  Badge,
  Box,
  Center,
  Flex,
  List,
  MantineProvider,
  Modal,
  Stack,
  Text,
  Title,
  useMantineTheme
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconMoodConfuzedFilled } from "@tabler/icons-react"
import globalCss from "data-text:@mantine/core/styles.css"
import shadowCss from "data-text:~/contents/shadow.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = globalCss + shadowCss
  return style
}

const OverlayView = () => {
  const [message, setMessage] = useState(null)

  const [opened, { open, close }] = useDisclosure(false)

  useEffect(() => {
    const messageListener = (message) => {
      if (message.action === "openPopover") {
        setMessage(message)
        open()
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    // Cleanup function to remove the listener when the component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  if (!message || message.action !== "openPopover") {
    return null
  }

  console.log(message)

  const isEmptyResult = message.data.searchResult.length === 0

  return (
    <MantineProvider cssVariablesSelector=":host">
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text>
            Explanation for: <b>{message.data.estonianWord}</b>
          </Text>
        }
        centered
        size="xl">
        {isEmptyResult ? (
          <EmptyState word={message.data.estonianWord} />
        ) : (
          <ExplanationArea data={message.data} />
        )}
      </Modal>
    </MantineProvider>
  )
}

const ExplanationArea = ({ data }) => {
  const { searchResult, estonianWord } = data
  return (
    <Box>
      <Title order={2}>{estonianWord}</Title>
      {searchResult.map((result, idx) => {
        return (
          <Stack key={idx} gap="xs" mt="lg">
            <WordClasses wordClasses={result.wordClasses} />
            <Meanings meanings={result.meanings} />
          </Stack>
        )
      })}
    </Box>
  )
}

const WordClasses = ({ wordClasses }) => {
  return (
    <Flex align="center" justify="start" gap="md">
      <Text>Word classes: </Text>
      {wordClasses.map((wordClass, idx) => (
        <Badge key={`class-${idx}`} color="blue">
          {wordClass}
        </Badge>
      ))}
    </Flex>
  )
}

const Meanings = ({ meanings }) => {
  const theme = useMantineTheme()

  return (
    <Stack gap="xs">
      <Title order={3}>Meanings:</Title>
      {meanings.map((meaning, idx) => (
        <Stack
          key={`meaning-${idx}`}
          gap="md"
          p="md"
          style={{
            border: `1px solid ${theme.colors.gray[2]}`,
            borderRadius: "8px",
          }}>
          <Flex align="center" gap="xs">
            <Badge variant="default" color="blue" radius="md" size="md">
              et
            </Badge>
            <Text flex={1}>{meaning.definition}</Text>
          </Flex>
          {meaning.synonyms.length > 0 && (
            <Stack gap="xs">
              <Title order={5}>Synonyms:</Title>
              <Text>{meaning.synonyms.join(", ")}</Text>
            </Stack>
          )}
          {meaning.partOfSpeech.length > 0 && (
            <Stack gap="xs">
              <Title order={5}>Part of speech:</Title>
              <Flex gap="md">
                {meaning.partOfSpeech.map((pos, idx) => (
                  <Badge
                    key={`partOfSpeech-${idx}`}
                    variant="light"
                    color="indigo"
                    size="lg">
                    {pos.value}
                  </Badge>
                ))}
              </Flex>
            </Stack>
          )}
          <Stack gap="xs">
            <Title order={5}>Examples:</Title>
            <List>
              {meaning.examples.map((example, idx) => (
                <List.Item key={`example-${idx}`}>{example}</List.Item>
              ))}
            </List>
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}

const EmptyState = ({ word }) => {
  return (
    <Center>
      <Stack gap="md">
        <Center>
          <IconMoodConfuzedFilled size={150} />
        </Center>
        <Text>Sorry! "{word}" can not be found.</Text>
      </Stack>
    </Center>
  )
}

export default OverlayView
