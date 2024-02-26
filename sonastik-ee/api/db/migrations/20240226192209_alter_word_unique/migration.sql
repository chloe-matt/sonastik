/*
  Warnings:

  - A unique constraint covering the columns `[word]` on the table `WordLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WordLog_word_key" ON "WordLog"("word");

-- CreateIndex
CREATE INDEX "WordLog_word_idx" ON "WordLog"("word");
