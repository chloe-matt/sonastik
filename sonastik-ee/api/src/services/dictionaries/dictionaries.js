import axios from 'axios'
import { saveWordLog } from 'src/services/wordLogs/repositories'

export const dictionary = async ({ requestedWord }) => {
  const lowerCaseRequestedWord = requestedWord.toLowerCase()

  const response = await axios.get(`https://api.sonapi.ee/v2/${lowerCaseRequestedWord}`)
  const data = response.data

  // Save to the word log
  saveWordLog({ requestedWord, searchResult: data.searchResult })

  return data
}
