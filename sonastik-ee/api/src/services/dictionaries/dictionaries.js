import axios from 'axios'

import { cache } from 'src/lib/cache'
import { saveWordLog } from 'src/services/wordLogs/repositories'

export const dictionary = async ({ requestedWord }) => {
  const lowerCaseRequestedWord = requestedWord.toLowerCase()

  const response = await axios.get(
    `https://api.sonapi.ee/v2/${lowerCaseRequestedWord}`
  )
  const dictionaryData = response.data

  // Save to the word log
  saveWordLog({ requestedWord, searchResult: dictionaryData.searchResult })

  return cache(lowerCaseRequestedWord, () => dictionaryData)
}

export const Meaning = {
  definitionEn: async (_args, gqlArgs) => {
    const { definition } = gqlArgs.root

    if (!definition) return null

    const response = await axios.post(
      'https://api-free.deepl.com/v2/translate',
      {
        text: [definition],
        source_lang: 'ET',
        target_lang: 'EN',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        },
      }
    )

    return cache([definition], () => response.data)
  },
}
