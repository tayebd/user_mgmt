import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
const prisma = new PrismaClient();

declare const __dirname: string;

async function deleteAllData() {
  const tablesToDelete: string[] = ["Company"];

  for (const table of tablesToDelete) {
    const model = prisma[table.charAt(0).toLowerCase() + table.slice(1) as keyof typeof prisma];
    try {
      await (model as any).deleteMany({});
      console.log(`Cleared data from ${table}`);
    } catch (error) {
      console.error(`Error clearing data from ${table}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  // Order matters due to foreign key constraints
  const orderedFileNames = [
    "company.json",
  ];

  await deleteAllData();

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);

    // Skip if file doesn't exist
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${fileName} - file not found`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName))
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    const model = prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1) as keyof typeof prisma];

    try {
      for (const data of jsonData) {
        await (model as any).create({ data });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
      console.error(error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
