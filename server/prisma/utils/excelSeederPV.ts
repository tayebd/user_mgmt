import * as XLSX from 'xlsx';
import { PrismaClient, Prisma } from '@prisma/client';
import * as path from 'path';

const prisma = new PrismaClient();

type ModelName = 'inverter' | 'pVPanel' ;

type ModelInputType = {
  inverter: Prisma.InverterCreateManyInput;
  pVPanel: Prisma.PVPanelCreateManyInput;
};

interface ExcelMapping {
  excelField: string;
  modelField: string;
  transform?: (value: any) => any;
  required?: boolean;
}

// Configuration for each file type
const fileConfig: Record<ModelName, { skipRows: number }> = {
  inverter: { skipRows: 1 },
  pVPanel: { skipRows: 1 },
  // energyStorageSystem: { skipRows: 15 }
};

// Define field mappings for each model
const fieldMappings: Record<ModelName, ExcelMapping[]> = {
  inverter: [
    { excelField: 'Manufacturer Name', modelField: 'manufacturerName', required: true },
    { excelField: 'Model Number', modelField: 'modelNumber', transform: (v) => String(v), required: true },
    { excelField: 'Description', modelField: 'description' },
    { excelField: 'Phase', modelField: 'phaseType' },
    { excelField: 'Output Voltage', modelField: 'outputVoltage', transform: (v) => parseFloat(v) },
    { excelField: 'Max Continuous Current', modelField: 'maxContinuousCurrent', transform: (v) => parseFloat(v) },
    { excelField: 'Max Continuous Power', modelField: 'maxContinuousPower', transform: (v) => parseFloat(v) },
  ],
  pVPanel: [
    { excelField: 'Manufacturer', modelField: 'manufacturer', required: true },
    { excelField: 'Model Number', modelField: 'modelNumber', transform: (v) => String(v), required: true },
    { excelField: 'Description', modelField: 'description' },
    { excelField: 'Nameplate Max Power', modelField: 'nameplateMaxPower', transform: (v) => parseFloat(v) },
    { excelField: 'PTC Rating', modelField: 'ptcRating', transform: (v) => parseFloat(v) },
    { excelField: 'Technology', modelField: 'technology' },
    { excelField: 'Number of Cells', modelField: 'numberOfCells', transform: (v) => parseInt(v) },
    { excelField: 'Active Area', modelField: 'activeArea', transform: (v) => parseFloat(v) },
    { excelField: 'Notes', modelField: 'notes' }
  ],
  // energyStorageSystem: [
  //   { excelField: 'Manufacturer Name', modelField: 'manufacturerName', required: true },
  //   { excelField: 'Brand', modelField: 'brand' },
  //   { excelField: 'Model Number', modelField: 'modelNumber', transform: (v) => String(v), required: true },
  //   { excelField: 'Technology', modelField: 'technology' },
  //   { excelField: 'Description', modelField: 'description' },
  //   { excelField: 'Nameplate Energy Capacity', modelField: 'nameplateEnergyCapacity', transform: (v) => parseFloat(v) },
  //   { excelField: 'Nameplate Power', modelField: 'nameplatePower', transform: (v) => parseFloat(v) },
  //   { excelField: 'Nominal Voltage', modelField: 'nominalVoltage', transform: (v) => parseFloat(v) },
  //   { excelField: 'Notes', modelField: 'notes' }
  // ]
};

function validateRow(row: any, mapping: ExcelMapping[], fileName: string, rowIndex: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  mapping.filter(field => field.required).forEach(field => {
    if (row[field.excelField] === undefined || row[field.excelField] === null || row[field.excelField] === '') {
      errors.push(`Missing required field '${field.excelField}'`);
    }
  });

  // Validate numeric fields
  mapping.forEach(field => {
    const value = row[field.excelField];
    if (value !== undefined && value !== null && value !== '') {
      if (field.transform === parseFloat && isNaN(parseFloat(value))) {
        errors.push(`Invalid number format for field '${field.excelField}': ${value}`);
      }
      if (field.transform === parseInt && isNaN(parseInt(value))) {
        errors.push(`Invalid integer format for field '${field.excelField}': ${value}`);
      }
    }
  });

  if (errors.length > 0) {
    console.warn(`Validation errors in ${fileName} row ${rowIndex + 1}:`, errors);
  }

  return { isValid: errors.length === 0, errors };
}

function transformExcelData<T extends ModelName>(
  data: any[],
  mapping: ExcelMapping[],
  modelName: T,
  fileName: string
): ModelInputType[T][] {
  return data
    .map((row: any, index: number) => {
      // Validate row
      const validation = validateRow(row, mapping, fileName, index);
      if (!validation.isValid) {
        return null;
      }

      const transformedRow: any = {};
      mapping.forEach(({ excelField, modelField, transform }) => {
        if (row[excelField] !== undefined && row[excelField] !== null) {
          try {
            transformedRow[modelField] = transform ? transform(row[excelField]) : row[excelField];
          } catch (error) {
            console.error(`Error transforming field '${excelField}' with value:`, row[excelField]);
            return null;
          }
        }
      });

      // Type guard based on model
      if (modelName === 'inverter' && (!transformedRow.manufacturerName || !transformedRow.modelNumber)) {
        return null;
      }
      if (modelName === 'pVPanel' && (!transformedRow.manufacturer || !transformedRow.modelNumber)) {
        return null;
      }
      // if (modelName === 'energyStorageSystem' && (!transformedRow.manufacturerName || !transformedRow.modelNumber)) {
      //   return null;
      // }

      return transformedRow;
    })
    .filter((row): row is ModelInputType[T] => row !== null);
}

async function importExcelToDatabase(filePath: string, modelName: ModelName) {
  try {
    console.log(`Processing ${path.basename(filePath)}...`);

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Modify the range to skip header rows
    const skipRows = fileConfig[modelName].skipRows;
    range.s.r = skipRows; // Start from the row after headers
    
    // Update the range in the worksheet
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    // Convert to JSON with the modified range
    const worksheet_data = XLSX.utils.sheet_to_json(worksheet);

    if (!worksheet_data || worksheet_data.length === 0) {
      console.warn(`No data found in ${path.basename(filePath)} after skipping ${skipRows} rows`);
      return;
    }

    // Get mapping for this model
    const mapping = fieldMappings[modelName];
    if (!mapping) {
      throw new Error(`No field mapping found for model: ${modelName}`);
    }

    // Transform data based on model type
    const transformedData = transformExcelData(worksheet_data, mapping, modelName, path.basename(filePath));

    if (transformedData.length === 0) {
      console.warn(`No valid data found in ${path.basename(filePath)} after transformation`);
      return;
    }

    console.log(`Found ${transformedData.length} valid records in ${path.basename(filePath)}`);

    // Bulk insert based on model type
    let result;
    switch (modelName) {
      case 'inverter':
        result = await prisma.inverter.createMany({
          data: transformedData as Prisma.InverterCreateManyInput[],
          skipDuplicates: true
        });
        break;
      case 'pVPanel':
        result = await prisma.pVPanel.createMany({
          data: transformedData as Prisma.PVPanelCreateManyInput[],
          skipDuplicates: true
        });
        break;
      // case 'energyStorageSystem':
      //   result = await prisma.energyStorageSystem.createMany({
      //     data: transformedData as Prisma.EnergyStorageSystemCreateManyInput[],
      //     skipDuplicates: true
      //   });
      // break;
      default:
        throw new Error(`Unsupported model type: ${modelName}`);
    }

    console.log(`Successfully imported ${result.count} records from ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}:`, error);
    throw error;
  }
}

async function seedFromExcel() {
  try {
    const seedDataDir = path.join(__dirname, '../seedData');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.inverter.deleteMany();
    await prisma.pVPanel.deleteMany();
    // await prisma.energyStorageSystem.deleteMany();

    // Import data from Excel files
    await importExcelToDatabase(
      path.join(seedDataDir, 'Inverter.xlsx'),
      'inverter'
    );

    await importExcelToDatabase(
      path.join(seedDataDir, 'PVPanel.xlsx'),
      'pVPanel'
    );

    // await importExcelToDatabase(
    //   path.join(seedDataDir, 'ESS.xlsx'),
    //   'energyStorageSystem'
    // );

    console.log('Excel seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seeder if this file is run directly
if (require.main === module) {
  seedFromExcel();
}
