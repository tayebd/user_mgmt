import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as csv from "fast-csv";

const prisma = new PrismaClient();

// Define a simpler interface that matches the CSV structure
interface CompanyCsvRow {
  name: string;
  address?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  website?: string;
  iconUrl?: string;
  web_validity?: string;
  capabilities?: string;
  fb_handle?: string;
  distributor?: string;
  commercial?: string;
  industryId?: string;
}

async function main() {
  fs.createReadStream(path.resolve(__dirname, "seedData/Company.csv"))
    .pipe(csv.parse({ headers: true }))
    // pipe the parsed input into a csv formatter
    .pipe(csv.format({ headers: true }))
    // Using the transform function from the formatting stream
    .transform(async (row: any, next) => {
      // Convert string values to appropriate types
      const industryId = row.industryId ? parseInt(row.industryId) : 76;
      const distributor = row.distributor === 'true' || row.distributor === 'Y';
      const commercial = row.commercial === 'true' || row.commercial === 'Y';
      const web_validity = row.web_validity === 'true' || row.web_validity === 'Y';
      
      // If company data exist update it, otherwise create it
      const res = await prisma.company.upsert({
        where: { name: row.name },
        update: {
          address: row.address || '',
          postalCode: row.postalCode || '',
          city: row.city || '',
          state: row.state || '',
          phone: row.phone || '',
          email: row.email || '',
          website: row.website || '',
          iconUrl: row.iconUrl || '',
          capabilities: row.capabilities || '',
          fb_handle: row.fb_handle || '',
          distributor,
          commercial,
          web_validity,
          industryId,
          serviceAreas: []
        },
        create: {
          name: row.name,
          address: row.address || '',
          postalCode: row.postalCode || '',
          city: row.city || '',
          state: row.state || '',
          phone: row.phone || '',
          email: row.email || '',
          website: row.website || '',
          iconUrl: row.iconUrl || '',
          capabilities: row.capabilities || '',
          fb_handle: row.fb_handle || '',
          distributor,
          commercial,
          web_validity,
          industryId,
          serviceAreas: []
        },
      });

      return next(null, res);
    })
    .pipe(process.stdout)
    .on("end", () => {
      process.exit();
    });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });