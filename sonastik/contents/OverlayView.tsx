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
  Table,
  Tabs,
  Text,
  Title,
  useMantineTheme
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconMoodConfuzedFilled } from "@tabler/icons-react"
import globalCss from "data-text:@mantine/core/styles.css"
import shadowCss from "data-text:~/assets/shadow.css"
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

  const isEmptyResult = message.data.searchResult.length === 0

  return (
    <MantineProvider cssVariablesSelector=":host">
      <Modal
        opened={opened}
        onClose={close}
        title={
          <>
            <Text>
              Explanation for: <b>{message.data.estonianWord}.</b>
            </Text>
            <Text size="xs">The explanation comes from Sonaveeb.ee.</Text>
          </>
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
  const { searchResult, estonianWord, translations } = data
  const tabDefaultValue = searchResult[0].wordClasses.join(", ")

  return (
    <Box>
      <Flex align="center" justify="start" gap="xs">
        <Badge variant="default" color="blue" radius="md" size="md">
          et
        </Badge>
        <Title order={2}>{estonianWord}</Title>
      </Flex>
      {translations.length > 0 && <Translations translations={translations} />}

      <Tabs defaultValue={tabDefaultValue} mt="lg">
        <Tabs.List>
          {searchResult.map((result, idx) => {
            const wordClasses = result.wordClasses.join(", ")
            return (
              <Tabs.Tab key={`tab-list-${idx}`} value={wordClasses}>
                {wordClasses}
              </Tabs.Tab>
            )
          })}
        </Tabs.List>

        {searchResult.map((result, idx) => {
          const wordClasses = result.wordClasses.join(", ")
          return (
            <Tabs.Panel key={`tab-panel-${idx}`} value={wordClasses}>
              <Stack key={idx} gap="md" mt="lg">
                {result.meanings.length > 0 && (
                  <Meanings meanings={result.meanings} />
                )}
                {result.similarWords.length > 0 && (
                  <SimilarWords similarWords={result.similarWords} />
                )}
                {result.wordForms.length > 0 && (
                  <WordForms wordForms={result.wordForms} />
                )}
              </Stack>
            </Tabs.Panel>
          )
        })}
      </Tabs>
    </Box>
  )
}

const Translations = ({ translations }) => {
  return (
    <Box>
      {translations.map((translation, idx) => {
        if (translation.translations.length === 0) return null

        return (
          <Flex key={`translation-${idx}`} gap="sm">
            <Badge variant="default" color="blue" radius="md" size="md">
              {translation.to}
            </Badge>
            <Text>{translation.translations.join(", ")}</Text>
          </Flex>
        )
      })}
    </Box>
  )
}

const SimilarWords = ({ similarWords }) => {
  return (
    <Stack gap="xs">
      <Title order={3}>Similar words:</Title>
      <Text>{similarWords.join(", ")}</Text>
    </Stack>
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
            borderRadius: "8px"
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

const WordForms = ({ wordForms }) => {
  return (
    <Stack gap="xs">
      <Title order={3}>Change type:</Title>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Form</Table.Th>
            <Table.Th>Word</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {wordForms.map((wordForm, idx) => (
            <Table.Tr key={`wordForm-${idx}`}>
              <Table.Td>{wordForm.morphValue}</Table.Td>
              <Table.Td>{wordForm.value}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  )
}

const EmptyState = ({ word }) => {
  return (
    <Box>
      <Center>
        <IconMoodConfuzedFilled size={150} />
      </Center>
      <Stack gap={0}>
        <Text style={{ textAlign: "center" }}>
          The word explanation data comes from Sonaveeb.ee.
        </Text>
        <Text style={{ textAlign: "center" }}>
          However, "{word}" can not be found there. Try selecting only the root of the word.
        </Text>
      </Stack>
    </Box>
  )
}

export default OverlayView
