import { useQuery, gql } from "@apollo/client";

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
`;

export const useGetWordExplanation = (requestedWord: string | null, options: any = {}) => {
	const { loading, error, data } = useQuery(GET_WORD_EXPLANATION, {
		variables: { requestedWord },
		skip: !requestedWord,
		fetchPolicy: "cache-first",
		...options
	})

	return { loading, error, dictionary: data?.dictionary }
}
