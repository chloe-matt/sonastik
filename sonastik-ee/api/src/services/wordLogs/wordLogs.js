import { db } from 'src/lib/db'

export const wordLogs = () => {
  return db.wordLog.findMany()
}

export const wordLog = ({ id }) => {
  return db.wordLog.findUnique({
    where: { id },
  })
}

export const createWordLog = ({ input }) => {
  return db.wordLog.create({
    data: input,
  })
}

export const updateWordLog = ({ id, input }) => {
  return db.wordLog.update({
    data: input,
    where: { id },
  })
}

export const deleteWordLog = ({ id }) => {
  return db.wordLog.delete({
    where: { id },
  })
}
