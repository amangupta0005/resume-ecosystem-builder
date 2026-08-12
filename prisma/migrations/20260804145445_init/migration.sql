-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('completed', 'in-progress');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "techStack" TEXT[],
    "status" "ProjectStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bullet" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Bullet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDomain" (
    "projectId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,

    CONSTRAINT "ProjectDomain_pkey" PRIMARY KEY ("projectId","domainId")
);

-- CreateTable
CREATE TABLE "ResumeConfig" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeProject" (
    "id" TEXT NOT NULL,
    "resumeConfigId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ResumeProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeBulletOverride" (
    "id" TEXT NOT NULL,
    "resumeConfigId" TEXT NOT NULL,
    "bulletId" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ResumeBulletOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bullet_projectId_order_key" ON "Bullet"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeConfig_domainId_key" ON "ResumeConfig"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeProject_resumeConfigId_projectId_key" ON "ResumeProject"("resumeConfigId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeProject_resumeConfigId_order_key" ON "ResumeProject"("resumeConfigId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeBulletOverride_resumeConfigId_bulletId_key" ON "ResumeBulletOverride"("resumeConfigId", "bulletId");

-- AddForeignKey
ALTER TABLE "Bullet" ADD CONSTRAINT "Bullet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDomain" ADD CONSTRAINT "ProjectDomain_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDomain" ADD CONSTRAINT "ProjectDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeConfig" ADD CONSTRAINT "ResumeConfig_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeProject" ADD CONSTRAINT "ResumeProject_resumeConfigId_fkey" FOREIGN KEY ("resumeConfigId") REFERENCES "ResumeConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeProject" ADD CONSTRAINT "ResumeProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeBulletOverride" ADD CONSTRAINT "ResumeBulletOverride_resumeConfigId_fkey" FOREIGN KEY ("resumeConfigId") REFERENCES "ResumeConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeBulletOverride" ADD CONSTRAINT "ResumeBulletOverride_bulletId_fkey" FOREIGN KEY ("bulletId") REFERENCES "Bullet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
