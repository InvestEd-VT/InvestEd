-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "cashBalance" DOUBLE PRECISION NOT NULL DEFAULT 10000;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationExpiry" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;
