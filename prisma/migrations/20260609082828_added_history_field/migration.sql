-- CreateTable
CREATE TABLE "History" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "History_userId_idx" ON "History"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "History_userId_videoId_key" ON "History"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
