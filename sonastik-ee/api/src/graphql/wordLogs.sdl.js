export const schema = gql`
  type WordLog {
    id: Int!
    word: String!
    totalFound: Int!
    totalNotFound: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Query {
    wordLogs: [WordLog!]! @requireAuth
    wordLog(id: Int!): WordLog @requireAuth
  }

  input CreateWordLogInput {
    word: String!
    totalFound: Int!
    totalNotFound: Int!
  }

  input UpdateWordLogInput {
    word: String
    totalFound: Int
    totalNotFound: Int
  }

  type Mutation {
    createWordLog(input: CreateWordLogInput!): WordLog! @requireAuth
    updateWordLog(id: Int!, input: UpdateWordLogInput!): WordLog! @requireAuth
    deleteWordLog(id: Int!): WordLog! @requireAuth
  }
`
