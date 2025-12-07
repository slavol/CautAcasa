-- CreateTable
CREATE TABLE "AiQueryLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiQueryLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AiQueryLog" ADD CONSTRAINT "AiQueryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
