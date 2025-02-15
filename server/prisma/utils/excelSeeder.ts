import * as XLSX from 'xlsx';
import { PrismaClient, Prisma } from '@prisma/client';
import * as path from 'path';

// NOTE: The following line may cause TypeScript errors related to implicit 'any' types.
// These errors can typically be resolved by installing the '@types/node' package,
// which provides type definitions for Node.js modules. However, the user has
// opted not to install this package at this time. The script should still function
// correctly despite these errors.
const prisma = new PrismaClient();

type ModelName = 'company';

type ModelInputType = {

  company: Prisma.CompanyCreateManyInput;
};

interface ExcelMapping {
  excelField: string;
  modelField: string;
  transform?: (value: any) => any;
  required?: boolean;
}

// Configuration for each file type
const fileConfig: Record<ModelName, { skipRows: number }> = {
  company: { skipRows: 0 }, // Assuming no header rows to skip
};

// Define field mappings for each model
const fieldMappings: Record<ModelName, ExcelMapping[]> = {
  company: [
    { excelField: 'name', modelField: 'name', required: true },
    { excelField: 'address', modelField: 'location', required: false },
    { excelField: 'website', modelField: 'website' },
    { excelField: 'phone', modelField: 'phone', transform: (v) => String(v) },
    { excelField: 'established', modelField: 'established' },
    { excelField: 'web_validity', modelField: 'web_validity', transform: (v) => v.toLowerCase() === 'true' },
    { excelField: 'capabilities', modelField: 'capabilities' },
    { excelField: 'fb_handle', modelField: 'fb_handle' },
    { excelField: 'iconUrl', modelField: 'iconUrl' },
    { excelField: 'distributor', modelField: 'distributor', transform: (v) => v.toLowerCase() === 'true' },
  ],
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
      if (modelName === 'company' && (!transformedRow.name || !transformedRow.location)) {
        return null;
      }

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

    console.log(`Raw data from ${path.basename(filePath)}:`, worksheet_data); // Add this line for debugging

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
      case 'company':
        result = await prisma.company.createMany({
          data: transformedData as Prisma.CompanyCreateManyInput[],
          skipDuplicates: true
        });
        break;
      default:
        throw new Error(`Unsupported model type: ${modelName}`);
    }

    console.log(`Successfully imported ${result.count} records from ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`Error processing ${path.basename(filePath)}:`, error);
    throw error;
  }
}

export async function seedFromExcel() {
  try {
    const seedDataDir = path.join(__dirname, '../seedData');
    
    // Clear existing data
      console.log('Clearing existing data...');
    await prisma.projectPhoto.deleteMany();
    await prisma.companyProject.deleteMany();
    await prisma.review.deleteMany();
    await prisma.service.deleteMany();
    await prisma.partnership.deleteMany();
    await prisma.certification.deleteMany();
    await prisma.description.deleteMany();
    await prisma.company.deleteMany();

    await importExcelToDatabase(
      path.join(seedDataDir, 'Company.xlsx'),
      'company'
    );

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
