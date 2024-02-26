import {
  wordLogs,
  wordLog,
  createWordLog,
  updateWordLog,
  deleteWordLog,
} from './wordLogs'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('wordLogs', () => {
  scenario('returns all wordLogs', async (scenario) => {
    const result = await wordLogs()

    expect(result.length).toEqual(Object.keys(scenario.wordLog).length)
  })

  scenario('returns a single wordLog', async (scenario) => {
    const result = await wordLog({ id: scenario.wordLog.one.id })

    expect(result).toEqual(scenario.wordLog.one)
  })

  scenario('creates a wordLog', async () => {
    const result = await createWordLog({
      input: { word: 'String', updatedAt: '2024-02-26T18:01:06.383Z' },
    })

    expect(result.word).toEqual('String')
    expect(result.updatedAt).toEqual(new Date('2024-02-26T18:01:06.383Z'))
  })

  scenario('updates a wordLog', async (scenario) => {
    const original = await wordLog({ id: scenario.wordLog.one.id })
    const result = await updateWordLog({
      id: original.id,
      input: { word: 'String2' },
    })

    expect(result.word).toEqual('String2')
  })

  scenario('deletes a wordLog', async (scenario) => {
    const original = await deleteWordLog({
      id: scenario.wordLog.one.id,
    })
    const result = await wordLog({ id: original.id })

    expect(result).toEqual(null)
  })
})
