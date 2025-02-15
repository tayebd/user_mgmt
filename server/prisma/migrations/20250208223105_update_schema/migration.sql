-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "capabilities" TEXT,
ADD COLUMN     "commercial" BOOLEAN,
ADD COLUMN     "fb_handle" TEXT,
ADD COLUMN     "residential" BOOLEAN,
ADD COLUMN     "web_validity" BOOLEAN,
ALTER COLUMN "website" DROP NOT NULL;
