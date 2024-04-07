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
  Button,
  Center,
  Flex,
  List,
  MantineProvider,
  Paper,
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
import { useEffect, useRef, useState } from "react"

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

const PlasmoOverlay = () => (
  <ApolloProvider client={client}>
    <MantineProvider cssVariablesSelector=":host">
      <OverlayView />
    </MantineProvider>
  </ApolloProvider>
)

export default PlasmoOverlay

const OverlayView = () => {
  const [message, setMessage] = useState(null)
  const containerRef = useRef(null)

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

  useEffect(() => {
    const container = document.querySelector("#plasmo-shadow-container")
    containerRef.current = container
  }, [containerRef.current])

  const isEmptyResult = !dictionary || dictionary?.searchResult?.length === 0

  return !message || message.action !== "openPopover" ? null : (
    <CustomModal
      opened={opened}
      onClose={close}
      isLoading={loading}
      title={
        <>
          <Text style={{ color: theme.colors.dark[9] }}>
            Explanation for: <b>{dictionary?.estonianWord}.</b>
          </Text>
          <Text size="xs" style={{ color: theme.colors.dark[9] }}>
            The explanation comes from Sonaveeb.ee.
          </Text>
        </>
      }>
      {isEmptyResult ? (
        <EmptyState word={dictionary?.estonianWord} />
      ) : (
        <ExplanationArea data={dictionary} />
      )}
    </CustomModal>
  )
}

const ExplanationArea = ({ data }) => {
  const { searchResult, estonianWord, translations } = data
  const tabDefaultValue = searchResult[0].wordClasses.join(", ")

  const theme = useMantineTheme()

  return (
    <Box>
      <Flex align="center" justify="start" gap="xs">
        <Badge
          variant="default"
          color="blue"
          radius="md"
          size="md"
          style={{
            border: `1px solid ${theme.colors.gray[5]}`
          }}>
          et
        </Badge>
        <Title order={2} style={{ color: theme.colors.dark[9] }}>
          {estonianWord}
        </Title>
      </Flex>
      {translations.length > 0 && <Translations translations={translations} />}

      <Tabs defaultValue={`${tabDefaultValue}-0`} mt="lg">
        <Tabs.List>
          {searchResult.map((result, idx) => {
            const wordClasses = result.wordClasses.join(", ")
            return (
              <Tabs.Tab
                key={`tab-list-${idx}`}
                value={`${wordClasses}-${idx}`}
                style={{ color: theme.colors.dark[9] }}>
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
            <Badge
              variant="default"
              color="blue"
              radius="md"
              size="md"
              style={{
                border: `1px solid ${theme.colors.gray[5]}`
              }}>
              {translation.to}
            </Badge>
            <Text style={{ color: theme.colors.dark[9] }}>
              {translation.translations.join(", ")}
            </Text>
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
      <Title order={3} style={{ color: theme.colors.dark[9] }}>
        Similar words:
      </Title>
      <Text style={{ color: theme.colors.dark[9] }}>
        {similarWords.join(", ")}
      </Text>
    </Stack>
  )
}

const Meanings = ({ meanings }) => {
  const theme = useMantineTheme()

  return (
    <Stack gap="xs">
      <Title order={3} style={{ color: theme.colors.dark[9] }}>
        Meanings:
      </Title>
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
            <Badge
              variant="default"
              color="blue"
              radius="md"
              size="md"
              style={{
                border: `1px solid ${theme.colors.gray[5]}`
              }}>
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
            <Badge
              variant="default"
              color="blue"
              radius="md"
              size="md"
              style={{
                border: `1px solid ${theme.colors.gray[5]}`
              }}>
              en
            </Badge>
            <Text
              flex={1}
              dangerouslySetInnerHTML={{
                __html: parseEkiForeignText(
                  meaning.definitionEn?.translations?.[0]?.text
                )
              }}
              style={{ color: theme.colors.dark[9] }}
            />
          </Flex>
          {meaning.synonyms.length > 0 && (
            <Stack gap="xs">
              <Title order={5} style={{ color: theme.colors.dark[9] }}>
                Synonyms:
              </Title>
              <Text style={{ color: theme.colors.dark[9] }}>
                {meaning.synonyms.join(", ")}
              </Text>
            </Stack>
          )}
          {meaning.partOfSpeech.length > 0 && (
            <Stack gap="xs">
              <Title order={5} style={{ color: theme.colors.dark[9] }}>
                Part of speech:
              </Title>
              <Flex gap="md">
                {meaning.partOfSpeech.map((pos, idx) => (
                  <Badge
                    key={`partOfSpeech-${idx}`}
                    variant="light"
                    color="indigo"
                    size="lg"
                    style={{
                      border: `1px solid ${theme.colors.gray[5]}`
                    }}>
                    {pos.value}
                  </Badge>
                ))}
              </Flex>
            </Stack>
          )}
          {meaning.examples.length > 0 && (
            <Stack gap="xs">
              <Title order={5} style={{ color: theme.colors.dark[9] }}>
                Examples:
              </Title>
              <List>
                {meaning.examples.map((example, idx) => (
                  <List.Item
                    key={`example-${idx}`}
                    style={{ color: theme.colors.dark[9] }}>
                    {example}
                  </List.Item>
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
          <Table.Tr
            style={{
              borderBottom: `1px solid ${theme.colors.gray[2]}`
            }}>
            <Table.Th>Form</Table.Th>
            <Table.Th>Word</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {wordForms.map((wordForm, idx) => (
            <Table.Tr
              key={`wordForm-${idx}`}
              style={{
                borderBottom:
                  idx === wordForms.length - 1
                    ? "none"
                    : `1px solid ${theme.colors.gray[2]}`
              }}>
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
    <Flex align="center" justify="center" h={460}>
      <Stack gap={0}>
        <Center>
          <IconMoodConfuzedFilled size={150} />
        </Center>
        <Text style={{ textAlign: "center", color: theme.colors.dark[9] }}>
          The word explanation data comes from Sonaveeb.ee.
        </Text>
        <Text style={{ textAlign: "center", color: theme.colors.dark[9] }}>
          However, "{word}" can not be found there. Try selecting only the root
          of the word.
        </Text>
      </Stack>
    </Flex>
  )
}

const CustomModal = ({ opened, onClose, title, isLoading, children }) => {
  const theme = useMantineTheme()

  if (!opened) {
    return null
  }

  return (
    <Flex justify="center" align="center" className="sonastik-overlay-modal">
      <Paper shadow="lg" w={800} h={600} bg="white">
        <Box
          p="sm"
          style={{
            borderBottom: `1px solid ${theme.colors.gray[2]}`
          }}>
          {title}
        </Box>
        <Box
          p="sm"
          style={{
            overflowY: "auto",
            maxHeight: "calc(100% - 128px)",
            wordWrap: "break-word",
            ...(isLoading
              ? {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 472
                }
              : {})
          }}>
          {isLoading ? (
            <Text className="sonastik-typewriter">Loading...</Text>
          ) : (
            children
          )}
        </Box>
        <Center
          p="sm"
          style={{
            borderTop: `1px solid ${theme.colors.gray[2]}`
          }}>
          <Button
            onClick={onClose}
            variant="filled"
            style={{
              backgroundColor: theme.colors.blue[8]
            }}>
            Close
          </Button>
        </Center>
      </Paper>
    </Flex>
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
    ?.replace(/<eki-foreign>/g, "<i>")
    ?.replace(/<\/eki-foreign>/g, "</i>")
}
