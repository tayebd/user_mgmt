import { PrismaClient, Inverter } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();

async function main() {
  const inverters: Omit<Inverter, 'id'>[] = [];

  fs.createReadStream('prisma/seeds/Inverters.csv')
    .pipe(csv())
    .on('data', (row) => {
      inverters.push({
        manufacturer: row.manufacturer || null,
        modelNumber: row.modelNumber || null,
        description: row.description || null,
        phaseType: row.phaseType || null,
        outputVoltage: row.outputVoltage ? parseFloat(row.outputVoltage) : null,
        nominalFrequency: row.nominalFrequency ? parseFloat(row.nominalFrequency) : null,
        maxOutputCurrent: row.maxOutputCurrent ? parseFloat(row.maxOutputCurrent) : null,
        nominalOutputPower: row.nominalOutputPower ? parseFloat(row.nominalOutputPower) : null,
        maxOutputPower: row.maxOutputPower ? parseFloat(row.maxOutputPower) : null,
        maxApparentPower: row.maxApparentPower ? parseFloat(row.maxApparentPower) : null,
        powerFactor: row.powerFactor ? parseFloat(row.powerFactor) : null,
        totalHarmonicDistortion: row.totalHarmonicDistortion ? parseFloat(row.totalHarmonicDistortion) : null,
        acGridConnectionType: row.acGridConnectionType || null,
        maxDcVoltage: row.maxDcVoltage ? parseFloat(row.maxDcVoltage) : null,
        startVoltage: row.startVoltage ? parseFloat(row.startVoltage) : null,
        nominalDcVoltage: row.nominalDcVoltage ? parseFloat(row.nominalDcVoltage) : null,
        mpptVoltageRangeMin: row.mpptVoltageRangeMin ? parseFloat(row.mpptVoltageRangeMin) : null,
        mpptVoltageRangeMax: row.mpptVoltageRangeMax ? parseFloat(row.mpptVoltageRangeMax) : null,
        numberOfMpptTrackers: row.numberOfMpptTrackers ? parseInt(row.numberOfMpptTrackers) : null,
        stringsPerMppt: row.stringsPerMppt ? parseInt(row.stringsPerMppt) : null,
        maxInputCurrentPerMppt: row.maxInputCurrentPerMppt ? parseFloat(row.maxInputCurrentPerMppt) : null,
        maxShortCircuitCurrent: row.maxShortCircuitCurrent ? parseFloat(row.maxShortCircuitCurrent) : null,
        maxRecommendedPvPower: row.maxRecommendedPvPower ? parseFloat(row.maxRecommendedPvPower) : null,
        maxEfficiency: row.maxEfficiency ? parseFloat(row.maxEfficiency) : null,
        europeanEfficiency: row.europeanEfficiency ? parseFloat(row.europeanEfficiency) : null,
        mpptEfficiency: row.mpptEfficiency ? parseFloat(row.mpptEfficiency) : null,
        dimensions: row.dimensions || null,
        weight: row.weight ? parseFloat(row.weight) : null,
        ipRating: row.ipRating || null,
        operatingTempRange: row.operatingTempRange || null,
        coolingMethod: row.coolingMethod || null,
        noiseLevel: row.noiseLevel ? parseFloat(row.noiseLevel) : null,
        communicationInterfaces: row.communicationInterfaces || null,
        displayType: row.displayType || null,
        protectionFeatures: row.protectionFeatures || null,
        certifications: row.certifications || null,
        warrantyYears: row.warrantyYears ? parseInt(row.warrantyYears) : null,
      });
    })
    .on('end', async () => {
      try {
        await prisma.inverter.createMany({
          data: inverters,
          skipDuplicates: true,
        });
        console.log('Inverter data seeded successfully.');
      } catch (error) {
        console.error('Error seeding inverter data:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
