import { db } from 'src/lib/db'

/**
 * Saves a log of a word search to the database.
 *
 * @param {Object} params - The parameters for saving the word log.
 * @param {string} params.requestedWord - The word that was searched for.
 * @param {Array} params.searchResult - The results of the search.
 *
 * If a log for the requested word already exists, it updates the totalFound and totalNotFound counts based on the search results.
 * If a log for the requested word does not exist, it creates a new log with the requested word and initial totalFound and totalNotFound counts based on the search results.
 *
 * @returns {Promise<void>} A promise that resolves when the word log has been saved.
 */
export async function saveWordLog({ requestedWord, searchResult }) {
  const wordLog = await db.wordLog.findUnique({
    where: {
      word: requestedWord,
    },
  })

  if (wordLog) {
    await db.wordLog.update({
      where: {
        word: requestedWord,
      },
      data: {
        totalFound:
          searchResult.length > 0 ? wordLog.totalFound + 1 : wordLog.totalFound,
        totalNotFound:
          searchResult.length === 0
            ? wordLog.totalNotFound + 1
            : wordLog.totalNotFound,
      },
    })
  } else {
    await db.wordLog.create({
      data: {
        word: requestedWord,
        totalFound: searchResult.length > 0 ? 1 : 0,
        totalNotFound: searchResult.length === 0 ? 1 : 0,
      },
    })
  }
}
