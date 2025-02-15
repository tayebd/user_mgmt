import { PrismaClient } from '@prisma/client';
import { seedFromExcel } from './utils/excelSeeder';

const prisma = new PrismaClient();

async function main() {
  /*
  // Create sample companies
const company1 = await prisma.company.create({
  data: {
    name: 'Sample Company 1',
    location: 'Sample Location 1',
    website: 'http://sample1.com',
    iconUrl: '/icon1.png',
    descriptions: {
      create: [
        { language: 'en', text: 'English description for Sample Company 1' },
        { language: 'es', text: 'Descripción en español para Sample Company 1' },
        { language: 'fr', text: 'Description en français pour Sample Company 1' },
      ],
    },
  },
});

const company2 = await prisma.company.create({
  data: {
    name: 'Sample Company 2',
    location: 'Sample Location 2',
    website: 'http://sample2.com',
    iconUrl: '/icon2.png',
    descriptions: {
      create: [
        { language: 'en', text: 'English description for Sample Company 2' },
        { language: 'es', text: 'Descripción en español para Sample Company 2' },
        { language: 'fr', text: 'Description en français pour Sample Company 2' },
      ],
    },
  },
});

  // Create sample CompanyProjects
  const companyProject1 = await prisma.companyProject.create({
    data: {
      name: 'Project 1 for Company 1',
      description: 'Description of Project 1',
      companyId: company1.id,
      location: 'Project 1 Location',
      capacityKw: 10.5,
      completedAt: new Date()
    },
  });

    // Create photos for companyProject1
  const project1Photos = await prisma.projectPhoto.createMany({
    data: [
      {
        url: 'http://example.com/project1_photo1.jpg',
        caption: 'Project 1 Photo 1',
        projectId: companyProject1.id,
      },
      {
        url: 'http://example.com/project1_photo2.jpg',
        caption: 'Project 1 Photo 2',
        projectId: companyProject1.id,
      },
    ],
  });

  const companyProject2 = await prisma.companyProject.create({
    data: {
      name: 'Project 2 for Company 1',
      description: 'Description of Project 2',
      companyId: company1.id,
      location: 'Project 2 Location',
      capacityKw: 5.2
    },
  });

  const project2Photo = await prisma.projectPhoto.create({
    data: {
      url: 'http://example.com/project2_photo1.jpg',
      projectId: companyProject2.id
    }
  });

    const companyProject3 = await prisma.companyProject.create({
    data: {
      name: 'Project 1 for Company 2',
      description: 'Description of Project 1 for company 2',
      companyId: company2.id,
      location: 'Project 1 Location',
      capacityKw: 10.5,
      completedAt: new Date()
    },
  });

  const project3Photos = await prisma.projectPhoto.createMany({
    data: [
      {
        url: 'http://example.com/project1_photo1.jpg',
        caption: 'Project 1 Photo 1',
        projectId: companyProject3.id,
      },
      {
        url: 'http://example.com/project1_photo2.jpg',
        caption: 'Project 1 Photo 2',
        projectId: companyProject3.id,
      },
    ],
  });

  console.log({ company1, company2, companyProject1, companyProject2, companyProject3 });
}
*/
  await seedFromExcel();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
