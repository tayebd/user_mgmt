import { PrismaClient } from '@prisma/client';
import { seedFromExcel } from './utils/excelSeeder';

const prisma = new PrismaClient();

async function main() {
  /*
  // Create sample organizations
const organization1 = await prisma.organization.create({
  data: {
    name: 'Sample Organization 1',
    location: 'Sample Location 1',
    website: 'http://sample1.com',
    iconUrl: '/icon1.png',
    descriptions: {
      create: [
        { language: 'en', text: 'English description for Sample Organization 1' },
        { language: 'es', text: 'Descripción en español para Sample Organization 1' },
        { language: 'fr', text: 'Description en français pour Sample Organization 1' },
      ],
    },
  },
});

const organization2 = await prisma.organization.create({
  data: {
    name: 'Sample Organization 2',
    location: 'Sample Location 2',
    website: 'http://sample2.com',
    iconUrl: '/icon2.png',
    descriptions: {
      create: [
        { language: 'en', text: 'English description for Sample Organization 2' },
        { language: 'es', text: 'Descripción en español para Sample Organization 2' },
        { language: 'fr', text: 'Description en français pour Sample Organization 2' },
      ],
    },
  },
});

  // Create sample OrganizationProjects
  const organizationProject1 = await prisma.organizationProject.create({
    data: {
      name: 'Project 1 for Organization 1',
      description: 'Description of Project 1',
      organizationId: organization1.id,
      location: 'Project 1 Location',
      capacityKw: 10.5,
      completedAt: new Date()
    },
  });

    // Create photos for organizationProject1
  const project1Photos = await prisma.projectPhoto.createMany({
    data: [
      {
        url: 'http://example.com/project1_photo1.jpg',
        caption: 'Project 1 Photo 1',
        projectId: organizationProject1.id,
      },
      {
        url: 'http://example.com/project1_photo2.jpg',
        caption: 'Project 1 Photo 2',
        projectId: organizationProject1.id,
      },
    ],
  });

  const organizationProject2 = await prisma.organizationProject.create({
    data: {
      name: 'Project 2 for Organization 1',
      description: 'Description of Project 2',
      organizationId: organization1.id,
      location: 'Project 2 Location',
      capacityKw: 5.2
    },
  });

  const project2Photo = await prisma.projectPhoto.create({
    data: {
      url: 'http://example.com/project2_photo1.jpg',
      projectId: organizationProject2.id
    }
  });

    const organizationProject3 = await prisma.organizationProject.create({
    data: {
      name: 'Project 1 for Organization 2',
      description: 'Description of Project 1 for organization 2',
      organizationId: organization2.id,
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
        projectId: organizationProject3.id,
      },
      {
        url: 'http://example.com/project1_photo2.jpg',
        caption: 'Project 1 Photo 2',
        projectId: organizationProject3.id,
      },
    ],
  });

  console.log({ organization1, organization2, organizationProject1, organizationProject2, organizationProject3 });
}
*/
  // await seedFromExcel();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
