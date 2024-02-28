export const schema = gql`
  type Query {
    dictionary(requestedWord: String!): Dictionary @skipAuth
  }

  type Dictionary {
    requestedWord: String!
    estonianWord: String!
    searchResult: [SearchResult]
    translations: [Translation]
  }

  type SearchResult {
    wordClasses: [String]
    wordForms: [WordForm]
    meanings: [Meaning]
    similarWords: [String]
  }

  type WordForm {
    inflectionType: String
    code: String
    morphValue: String
    value: String
  }

  type PartOfSpeech {
    code: String
    value: String
  }

  type Meaning {
    definition: String!
    """
    Definition in English, it's machine translated from DeepL.
    """
    definitionEn: DeepL
    partOfSpeech: [PartOfSpeech]
    examples: [String]
    synonyms: [String]
  }

  type Translation {
    from: String
    to: String
    input: String
    translations: [String]
  }

  type DeepL {
    translations: [DeepLResponse]
  }

  type DeepLResponse {
    detected_source_language: String
    text: String
  }
`
