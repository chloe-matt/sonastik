-- CreateTable
CREATE TABLE "WordLog" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordLog_pkey" PRIMARY KEY ("id")
);
