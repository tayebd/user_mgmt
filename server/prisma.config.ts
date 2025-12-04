import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Determine which .env file to load
const isTest = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('jest'));
if (isTest) {
  const testEnvPath = path.join(process.cwd(), '.env.test');
  if (fs.existsSync(testEnvPath)) {
    dotenv.config({ path: testEnvPath });
  }
} else {
  dotenv.config();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
