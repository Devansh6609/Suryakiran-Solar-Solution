-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Master', 'Vendor');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('rooftop', 'pump', 'Contact_Inquiry');

-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('New_Lead', 'Verified_Lead', 'Qualified', 'Site_Survey_Scheduled', 'Proposal_Sent', 'Negotiation', 'Closed_Won', 'Closed_Lost');

-- CreateEnum
CREATE TYPE "LeadScoreStatus" AS ENUM ('Hot', 'Warm', 'Cold');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Vendor',
    "country" TEXT,
    "state" TEXT,
    "district" TEXT,
    "profileImage" TEXT,
    "resetToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "source" TEXT,
    "pipelineStage" "PipelineStage" NOT NULL DEFAULT 'New_Lead',
    "score" INTEGER NOT NULL DEFAULT 30,
    "scoreStatus" "LeadScoreStatus" NOT NULL DEFAULT 'Cold',
    "assignedVendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user" TEXT,
    "notes" TEXT,
    "leadId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedVendorId_fkey" FOREIGN KEY ("assignedVendorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
