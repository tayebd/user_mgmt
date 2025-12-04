import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Industry seeding...');
  const industries = [
    { name: 'Aerospace', description: 'Organizations involved in the design, manufacture, and maintenance of aircraft and spacecraft' },
    { name: 'Agriculture', description: 'Businesses involved in farming and food production' },
    { name: 'Automotive', description: 'Organizations involved in the design, manufacture, and sale of motor vehicles' },
    { name: 'Consumer Products/Packaged Goods', description: 'Organizations that manufacture and sell consumer goods' },
    { name: 'Distribution/Transportation', description: 'Organizations involved in logistics and transportation services' },
    { name: 'Electronics', description: 'Organizations involved in the design and manufacture of electronic devices' },
    { name: 'Financial Services/Banking', description: 'Organizations providing financial services and banking operations' },
    { name: 'Government/Military', description: 'Government and military organizations' },
    { name: 'Healthcare', description: 'Organizations providing medical services and healthcare products' },
    { name: 'Industrial Products', description: 'Manufacturers of industrial machinery and equipment' },
    { name: 'Insurance', description: 'Organizations providing insurance services' },
    { name: 'Media and Entertainment', description: 'Organizations involved in media production and entertainment' },
    { name: 'Non-Profit', description: 'Non-profit organizations and charities' },
    { name: 'Other', description: 'Miscellaneous industries not covered by other categories' },
    { name: 'Petroleum/Chemical', description: 'Organizations involved in oil, gas, and chemical production' },
    { name: 'Pharmaceutical', description: 'Organizations involved in drug development and manufacturing' },
    { name: 'Rental', description: 'Organizations providing rental services for equipment and vehicles' },
    { name: 'Research Organization', description: 'Organizations focused on scientific research and development' },
    { name: 'Retail and Wholesale', description: 'Organizations involved in retail and wholesale trade' },
    { name: 'Services', description: 'Organizations providing various professional services' },
    { name: 'Telecom', description: 'Organizations providing telecommunications services' },
    { name: 'Unknown', description: 'Industry classification not specified' },
    { name: 'Utility', description: 'Organizations providing public utilities (electricity, water, etc.)' },
    { name: 'Waste Management/Environmental', description: 'Organizations involved in waste management and environmental services' },
    { name: 'Mining', description: 'Organizations involved in mineral extraction and mining operations' },
    { name: 'SolarPV', description: 'Organizations involved in solar power generation' }
  ];

  try {
    // First, check if the Industry model exists by creating a single record
    const firstIndustry = await prisma.$queryRaw`INSERT INTO "Industry" ("name", "description") VALUES ('Test Industry', 'Test Description') RETURNING id`;
    console.log('Successfully created test industry:', firstIndustry);
    
    // Now use createMany for the rest
    for (const industry of industries) {
      await prisma.$queryRaw`INSERT INTO "Industry" ("name", "description") VALUES (${industry.name}, ${industry.description}) ON CONFLICT DO NOTHING`;
    }
    
    console.log(`Successfully seeded ${industries.length} industries`);
  } catch (error) {
    console.error('Error seeding industries:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
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
