import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';

const prisma = new PrismaClient();

interface OrganizationData {
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
  const organizations: OrganizationData[] = [];
  let count = 0;

  const csvFilePath = path.join(__dirname, './seeds/Organization.csv');
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
      // Convert CSV row to organization object
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
      
      organizations.push({
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
        console.log(`Read ${count} organizations from CSV`);
        console.log(`Attempting to create ${organizations.length} organizations`);
        
        if (organizations.length === 0) {
          console.error('No organizations to seed. Check CSV format and data.');
          return;
        }
        
        // Log the first organization for debugging
        console.log('First organization to be created:', JSON.stringify(organizations[0], null, 2));
        
        // Use raw SQL queries to insert organizations
        for (const organization of organizations) {
          try {
            // First check if a organization with this name already exists
            const existingOrganization = await prisma.$queryRaw`
              SELECT id FROM "Organization" WHERE "name" = ${organization.name} LIMIT 1
            `;
            
            // Only insert if the organization doesn't already exist
            if (!existingOrganization || (Array.isArray(existingOrganization) && existingOrganization.length === 0)) {
              await prisma.$queryRaw`
                INSERT INTO "Organization" (
                  "name", "address", "city", "state", "postalCode", "country", 
                  "phone", "email", "capabilities", "fb_handle", "industryId", 
                  "distributor", "web_validity", "commercial", "website", "iconUrl", 
                  "serviceAreas"
                ) VALUES (
                  ${organization.name}, ${organization.address || ''}, ${organization.city || ''}, ${organization.state || ''}, 
                  ${organization.postalCode || ''}, ${organization.country || 'Tunisia'}, ${organization.phone || ''}, 
                  ${organization.email || ''}, ${organization.capabilities || ''}, ${organization.fb_handle || ''}, 
                  ${organization.industryId}, ${organization.distributor || false}, ${organization.web_validity || false}, 
                  ${organization.commercial || false}, ${organization.website || ''}, ${organization.iconUrl || ''}, 
                  '{}' /* Empty array for serviceAreas */
                )
              `;
            } else {
              console.log(`Organization ${organization.name} already exists, skipping...`);
            }
          } catch (insertError) {
            console.error(`Error inserting organization ${organization.name}:`, insertError);
          }
        }
        
        console.log('Organizations seeded successfully');
      } catch (error) {
        console.error('Error seeding organizations:', error);
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
