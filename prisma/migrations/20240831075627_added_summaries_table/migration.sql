-- CreateTable
CREATE TABLE `ThreadSummaries` (
    `threadId` VARCHAR(191) NOT NULL,
    `threadSummary` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`threadId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
