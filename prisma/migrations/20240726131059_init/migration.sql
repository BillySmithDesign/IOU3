-- CreateTable
CREATE TABLE "Debt" (
    "id" SERIAL NOT NULL,
    "friendName" TEXT NOT NULL,
    "telegramUsername" TEXT NOT NULL,
    "exchangeDate" TIMESTAMP(3) NOT NULL,
    "totalOwed" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "partialPayments" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);
