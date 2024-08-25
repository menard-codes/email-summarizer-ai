/*
  Warnings:

  - You are about to drop the `ThreadSummaries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `ThreadSummaries`;

-- CreateTable
CREATE TABLE `VectorizedThreads` (
    `threadId` VARCHAR(191) NOT NULL,
    `userEmail` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`threadId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
