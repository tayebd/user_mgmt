import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

const prisma = new PrismaClient();

async function seedPvPanels() {
  const csvFilePath = path.resolve(__dirname, '../prisma/seeds/pvPanels.csv');

  const stream = fs.createReadStream(csvFilePath);
  const csvStream = csv.parse({ headers: true });

  stream.pipe(csvStream);

  const panels: any[] = [];

  csvStream.on('data', (data) => {
    panels.push(data);
  });

  csvStream.on('end', async () => {
    for (const panel of panels) {
      await prisma.pVPanel.create({
        data: {
          maker: panel.maker,
          model: panel.model,
          description: panel.description,
          tempCoeffPmax: parseFloat(panel.tempCoeffPmax),
          tempCoeffIsc: parseFloat(panel.tempCoeffIsc),
          tempCoeffVoc: parseFloat(panel.tempCoeffVoc),
          tempCoeffIpmax: parseFloat(panel.tempCoeffIpmax),
          tempCoeffVpmax: parseFloat(panel.tempCoeffVpmax),
          moduleType: panel.moduleType,
          shortSide: parseFloat(panel.shortSide),
          longSide: parseFloat(panel.longSide),
          weight: parseFloat(panel.weight),
          performanceWarranty: panel.performanceWarranty,
          productWarranty: panel.productWarranty,
          efficiency: parseFloat(panel.efficiency),
          openCircuitVoltage: parseFloat(panel.openCircuitVoltage),
          shortCircuitCurrent: parseFloat(panel.shortCircuitCurrent),
          maxPower: parseFloat(panel.maxPower),
          certification: panel.certification,
          currentAtPmax: parseFloat(panel.currentAtPmax),
          voltageAtPmax: parseFloat(panel.voltageAtPmax),
        },
      });
    }

    console.log('Seeding completed successfully.');
    await prisma.$disconnect();
  });

  csvStream.on('error', (error) => {
    console.error('Error parsing CSV:', error);
    prisma.$disconnect();
  });
}

seedPvPanels().catch((error) => {
  console.error('Error seeding database:', error);
});
