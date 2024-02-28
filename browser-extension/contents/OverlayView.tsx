import "@mantine/core/styles.css"

import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
  useQuery
} from "@apollo/client"
import {
  Badge,
  Box,
  Center,
  Flex,
  List,
  MantineProvider,
  Modal,
  Skeleton,
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

const GET_WORD_EXPLANATION = gql`
  query GetWordExplanation($requestedWord: String!) {
    dictionary(requestedWord: $requestedWord) {
      requestedWord
      estonianWord
      searchResult {
        wordClasses
        similarWords
        meanings {
          definition
          definitionEn {
            translations {
              text
            }
          }
          partOfSpeech {
            code
            value
          }
          examples
          synonyms
        }
        wordForms {
          inflectionType
          morphValue
          code
          value
        }
      }
      translations {
        from
        to
        input
        translations
      }
    }
  }
`

const client = new ApolloClient({
  uri: "https://sonastik-ee-api.onrender.com/graphql",
  cache: new InMemoryCache()
})

const App = () => (
  <ApolloProvider client={client}>
    <MantineProvider cssVariablesSelector=":host">
      <OverlayView />
    </MantineProvider>
  </ApolloProvider>
)

export default App

const OverlayView = () => {
  const [message, setMessage] = useState(null)

  const [opened, { open, close }] = useDisclosure(false)

  const { loading, dictionary } = useGetWordExplanation(
    message?.data?.requestedWord
  )

  const theme = useMantineTheme()

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
  }, [message])

  const isEmptyResult = !dictionary || dictionary?.searchResult?.length === 0

  return !message || message.action !== "openPopover" ? null : (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <>
          <Text style={{ color: theme.colors.dark[9] }}>
            Explanation for: <b>{dictionary?.estonianWord}.</b>
          </Text>
          <Text size="xs" style={{ color: theme.colors.dark[9] }}>The explanation comes from Sonaveeb.ee.</Text>
        </>
      }
      centered
      size="xl">
      <Skeleton visible={loading}>
        {isEmptyResult ? (
          <EmptyState word={dictionary?.estonianWord} />
        ) : (
          <ExplanationArea data={dictionary} />
        )}
      </Skeleton>
    </Modal>
  )
}

const ExplanationArea = ({ data }) => {
  const { searchResult, estonianWord, translations } = data
  const tabDefaultValue = searchResult[0].wordClasses.join(", ")

  const theme = useMantineTheme()

  return (
    <Box>
      <Flex align="center" justify="start" gap="xs">
        <Badge variant="default" color="blue" radius="md" size="md">
          et
        </Badge>
        <Title order={2} style={{ color: theme.colors.dark[9] }}>{estonianWord}</Title>
      </Flex>
      {translations.length > 0 && <Translations translations={translations} />}

      <Tabs defaultValue={`${tabDefaultValue}-0`} mt="lg">
        <Tabs.List>
          {searchResult.map((result, idx) => {
            const wordClasses = result.wordClasses.join(", ")
            return (
              <Tabs.Tab key={`tab-list-${idx}`} value={`${wordClasses}-${idx}`} style={{ color: theme.colors.dark[9] }}>
                {idx + 1}. {wordClasses}
              </Tabs.Tab>
            )
          })}
        </Tabs.List>

        {searchResult.map((result, idx) => {
          const wordClasses = result.wordClasses.join(", ")
          return (
            <Tabs.Panel
              key={`tab-panel-${idx}`}
              value={`${wordClasses}-${idx}`}>
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
  const theme = useMantineTheme()

  return (
    <Box>
      {translations.map((translation, idx) => {
        if (translation.translations.length === 0) return null

        return (
          <Flex key={`translation-${idx}`} gap="sm">
            <Badge variant="default" color="blue" radius="md" size="md">
              {translation.to}
            </Badge>
            <Text style={{ color: theme.colors.dark[9] }}>{translation.translations.join(", ")}</Text>
          </Flex>
        )
      })}
    </Box>
  )
}

const SimilarWords = ({ similarWords }) => {
  const theme = useMantineTheme()

  return (
    <Stack gap="xs">
      <Title order={3} style={{ color: theme.colors.dark[9] }}>Similar words:</Title>
      <Text style={{ color: theme.colors.dark[9] }}>{similarWords.join(", ")}</Text>
    </Stack>
  )
}

const Meanings = ({ meanings }) => {
  const theme = useMantineTheme()

  return (
    <Stack gap="xs">
      <Title order={3} style={{ color: theme.colors.dark[9] }}>Meanings:</Title>
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
            <Text
              flex={1}
              dangerouslySetInnerHTML={{
                __html: parseEkiForeignText(meaning.definition)
              }}
              style={{ color: theme.colors.dark[9] }}
            />
          </Flex>
          <Flex align="center" gap="xs">
            <Badge variant="default" color="blue" radius="md" size="md">
              en
            </Badge>
            <Text
              flex={1}
              dangerouslySetInnerHTML={{
                __html: parseEkiForeignText(
                  meaning.definitionEn.translations?.[0]?.text
                )
              }}
              style={{ color: theme.colors.dark[9] }}
            />
          </Flex>
          {meaning.synonyms.length > 0 && (
            <Stack gap="xs">
              <Title order={5} style={{ color: theme.colors.dark[9] }}>Synonyms:</Title>
              <Text style={{ color: theme.colors.dark[9] }}>{meaning.synonyms.join(", ")}</Text>
            </Stack>
          )}
          {meaning.partOfSpeech.length > 0 && (
            <Stack gap="xs">
              <Title order={5} style={{ color: theme.colors.dark[9] }}>Part of speech:</Title>
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
          {meaning.examples.length > 0 && (
            <Stack gap="xs">
              <Title order={5} style={{ color: theme.colors.dark[9] }}>Examples:</Title>
              <List>
                {meaning.examples.map((example, idx) => (
                  <List.Item key={`example-${idx}`} style={{ color: theme.colors.dark[9] }}>{example}</List.Item>
                ))}
              </List>
            </Stack>
          )}
        </Stack>
      ))}
    </Stack>
  )
}

const WordForms = ({ wordForms }) => {
  const theme = useMantineTheme()

  return (
    <Stack gap="xs" style={{ color: theme.colors.dark[9] }}>
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
  const theme = useMantineTheme()

  return (
    <Box>
      <Center>
        <IconMoodConfuzedFilled size={150} />
      </Center>
      <Stack gap={0}>
        <Text style={{ textAlign: "center", color: theme.colors.dark[9] }}>
          The word explanation data comes from Sonaveeb.ee.
        </Text>
        <Text style={{ textAlign: "center", color: theme.colors.dark[9] }}>
          However, "{word}" can not be found there. Try selecting only the root
          of the word.
        </Text>
      </Stack>
    </Box>
  )
}

function useGetWordExplanation(requestedWord = null) {
  const { loading, error, data } = useQuery(GET_WORD_EXPLANATION, {
    variables: { requestedWord },
    skip: !requestedWord,
    fetchPolicy: "cache-first"
  })

  return { loading, error, dictionary: data?.dictionary }
}

function parseEkiForeignText(text) {
  return text
    .replace(/<eki-foreign>/g, "<i>")
    .replace(/<\/eki-foreign>/g, "</i>")
}
