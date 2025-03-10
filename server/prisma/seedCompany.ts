import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

const prisma = new PrismaClient();

interface CompanyData {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  capabilities?: string;
  fb_handle?: string;
  web_validity?: boolean;
  distributor?: boolean;
  commercial?: boolean;
  website?: string;
  iconUrl?: string;
  serviceAreas: string[];
  industryId: number;
}

async function main() {
  const companies: CompanyData[] = [];
  let count = 0;

  const csvFilePath = path.join(__dirname, './seedData/Company.csv');
  console.log(`Reading CSV from: ${csvFilePath}`);
  
  // Check if file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file does not exist at: ${csvFilePath}`);
    return;
  }
  
  // Read the CSV file
  fs.createReadStream(csvFilePath)
    .pipe(csvParser({
      separator: ',',
      headers: ['certification_id', 'name', 'address', 'city', 'state', 'phone', 'email', 'validity_date', 'website', 'web_root', 'iconUrl', 'web_validity', 'capabilities', 'fb_handle', 'distributor', 'commercial']
    }))
    .on('data', (row) => {
      // Convert CSV row to company object
      count++;
      
      // Debug: log the first row to see the structure
      if (count === 1) {
        console.log('First row from CSV:', row);
      }
      
      // Only process rows with a name
      if (!row.name) {
        console.log(`Skipping row ${count} - missing name:`, row);
        return;
      }
      
      companies.push({
        name: row.name,
        address: row.address,
        city: row.city,
        state: row.state,
        postalCode: '', // Not in CSV, using empty string instead of null
        country: 'Tunisia', // Default country based on the data
        phone: row.phone,
        email: row.email,
        capabilities: row.capabilities,
        fb_handle: row.fb_handle,
        website: row.website,
        iconUrl: row.iconUrl,
        serviceAreas: [], // Required field, using empty array as default
        industryId: 76,
        distributor: row.distributor === 'Y',
        web_validity: row.web_validity === 'Y',
        commercial: row.commercial === 'Y'
      });
    })
    .on('end', async () => {
      try {
        console.log(`Read ${count} companies from CSV`);
        console.log(`Attempting to create ${companies.length} companies`);
        
        if (companies.length === 0) {
          console.error('No companies to seed. Check CSV format and data.');
          return;
        }
        
        // Log the first company for debugging
        console.log('First company to be created:', JSON.stringify(companies[0], null, 2));
        
        // Use raw SQL queries to insert companies
        for (const company of companies) {
          try {
            // First check if a company with this name already exists
            const existingCompany = await prisma.$queryRaw`
              SELECT id FROM "Company" WHERE "name" = ${company.name} LIMIT 1
            `;
            
            // Only insert if the company doesn't already exist
            if (!existingCompany || (Array.isArray(existingCompany) && existingCompany.length === 0)) {
              await prisma.$queryRaw`
                INSERT INTO "Company" (
                  "name", "address", "city", "state", "postalCode", "country", 
                  "phone", "email", "capabilities", "fb_handle", "industryId", 
                  "distributor", "web_validity", "commercial", "website", "iconUrl", 
                  "serviceAreas"
                ) VALUES (
                  ${company.name}, ${company.address || ''}, ${company.city || ''}, ${company.state || ''}, 
                  ${company.postalCode || ''}, ${company.country || 'Tunisia'}, ${company.phone || ''}, 
                  ${company.email || ''}, ${company.capabilities || ''}, ${company.fb_handle || ''}, 
                  ${company.industryId}, ${company.distributor || false}, ${company.web_validity || false}, 
                  ${company.commercial || false}, ${company.website || ''}, ${company.iconUrl || ''}, 
                  '{}' /* Empty array for serviceAreas */
                )
              `;
            } else {
              console.log(`Company ${company.name} already exists, skipping...`);
            }
          } catch (insertError) {
            console.error(`Error inserting company ${company.name}:`, insertError);
          }
        }
        
        console.log('Companies seeded successfully');
      } catch (error) {
        console.error('Error seeding companies:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
    });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
