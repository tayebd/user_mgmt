import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

// Define the PVPanel interface matching the database model
interface PVPanel {
  manufacturer: string;
  modelNumber: string;
  description?: string;
  tempCoeffPmax?: number;
  tempCoeffIsc?: number;
  tempCoeffVoc?: number;
  tempCoeffIpmax?: number;
  tempCoeffVpmax?: number;
  moduleType?: string;
  shortSide?: number;
  longSide?: number;
  weight?: number;
  performanceWarranty?: string;
  productWarranty?: string;
  efficiency?: number;
  openCircuitVoltage?: number;
  shortCircuitCurrent?: number;
  maxPower?: number;
  certification?: string;
  currentAtPmax?: number;
  voltageAtPmax?: number;
}

// Interface for raw data from the parsed table
interface RawPanelData {
  [key: string]: string | number | undefined;
}

// Abstract parser class
abstract class PanelParser {
  protected manufacturer: string;
  
  constructor(manufacturer: string) {
    this.manufacturer = manufacturer;
  }
  
  abstract parseData(data: string): PVPanel[];
  
  protected parseNumber(value: string | undefined): number | undefined {
    if (!value) return undefined;
    // Remove any non-numeric characters except decimal point and minus sign
    const cleanValue = value.toString().replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? undefined : parsed;
  }
  
  protected parsePercentage(value: string | undefined): number | undefined {
    if (!value) return undefined;
    // Remove % sign and convert to decimal
    const cleanValue = value.toString().replace('%', '').trim();
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? undefined : Math.round((parsed / 100) * 1000) / 1000;
  }
}

// JinkoSolar parser implementation
class JinkoSolarParser extends PanelParser {
  constructor() {
    super('JinkoSolar');
  }
  
  parseData(data: string): PVPanel[] {
    const rows = data.split('\n');
    const headers: string[] = [];
    const models: string[] = [];
    const rawData: { [key: string]: { [key: string]: string } } = {};
    
    // Parse the table structure
    let headerFound = false;
    
    for (const row of rows) {
      const cells = row.split('|').map(cell => cell.trim());
      
      if (cells.length <= 1) continue;
      
      // First row with cells containing model numbers
      if (!headerFound && cells[1] && cells[1].includes('JKM')) {
        headerFound = true;
        
        // Extract model numbers
        for (let i = 1; i < cells.length; i++) {
          if (cells[i] && cells[i].includes('JKM')) {
            models.push(cells[i]);
          }
        }
      }
      // Parameter rows
      else if (headerFound && cells[1]) {
        const parameter = cells[0];
        headers.push(parameter);
        
        // Associate values with model numbers
        for (let i = 0; i < models.length; i++) {
          const modelIndex = i + 1;
          if (!rawData[models[i]]) {
            rawData[models[i]] = {};
          }
          
          if (cells[modelIndex]) {
            rawData[models[i]][parameter] = cells[modelIndex];
          }
        }
      }
    }
    
    // Convert raw data to PVPanel objects
    return models.map(modelNumber => {
      const modelData = rawData[modelNumber];
      
      return {
        manufacturer: this.manufacturer,
        modelNumber,
        description: `JinkoSolar ${modelNumber} PV Panel`,
        tempCoeffPmax: this.parseNumber(modelData['Temperature Coefficients of Pmax']),
        tempCoeffIsc: this.parseNumber(modelData['Temperature Coefficients of Isc']),
        tempCoeffVoc: this.parseNumber(modelData['Temperature Coefficients of Voc']),
        efficiency: this.parsePercentage(modelData['Module Efficiency STC (%)']),
        openCircuitVoltage: this.parseNumber(modelData['Open-circuit Voltage (Voc) STC']),
        shortCircuitCurrent: this.parseNumber(modelData['Short-circuit Current (Isc) STC']),
        maxPower: this.parseNumber(modelData['Maximum Power (Pmax) STC']?.replace('Wp', '')),
        currentAtPmax: this.parseNumber(modelData['Maximum Power Current (Imp) STC']),
        voltageAtPmax: this.parseNumber(modelData['Maximum Power Voltage (Vmp) STC']),
        moduleType: 'Monocrystalline',
      };
    });
  }
}

// Canadian Solar parser implementation
class CanadianSolarParser extends PanelParser {
  constructor() {
    super('Canadian Solar');
  }
  
  parseData(data: string): PVPanel[] {
    const rows = data.split('\n');
    const headers: string[] = [];
    const models: string[] = [];
    const rawData: { [key: string]: { [key: string]: string } } = {};
    
    // Parse the table structure
    let headerFound = false;
    let currentSection = '';
    
    for (const row of rows) {
      // Skip empty lines
      if (row.trim() === '') continue;
      
      // Check if this is a section header
      if (row.includes('**')) {
        currentSection = row.replace(/\*/g, '').trim();
        continue;
      }
      
      const cells = row.split('|').map(cell => cell.trim());
      
      if (cells.length <= 1) continue;
      
      // First row with cells containing model numbers
      if (!headerFound && cells[1] && cells[1].includes('CS7N-')) {
        headerFound = true;
        
        // Extract model numbers
        for (let i = 1; i < cells.length; i++) {
          if (cells[i] && cells[i].includes('CS7N-')) {
            models.push(cells[i]);
          }
        }
      }
      // Parameter rows
      else if (headerFound && cells[1]) {
        const parameter = cells[0];
        let fullParameter = parameter;
        
        // Include section in parameter name for better context
        if (currentSection) {
          fullParameter = `${currentSection} - ${parameter}`;
        }
        
        headers.push(fullParameter);
        
        // Associate values with model numbers
        for (let i = 0; i < models.length; i++) {
          const modelIndex = i + 1;
          if (!rawData[models[i]]) {
            rawData[models[i]] = {};
          }
          
          if (cells[modelIndex]) {
            rawData[models[i]][fullParameter] = cells[modelIndex];
          }
        }
      }
    }
    
    // Convert raw data to PVPanel objects
    return models.map(modelNumber => {
      const modelData = rawData[modelNumber];
      
      // Extract dimensions
      let longSide: number | undefined;
      let shortSide: number | undefined;
      
      if (modelData['MATERIAL DATA - Panel Dimension (H/W/D)']) {
        const dimensions = modelData['MATERIAL DATA - Panel Dimension (H/W/D)'].split('x');
        if (dimensions.length >= 2) {
          longSide = this.parseNumber(dimensions[0]);
          shortSide = this.parseNumber(dimensions[1]);
        }
      }
      
      return {
        manufacturer: this.manufacturer,
        modelNumber,
        description: `Canadian Solar ${modelNumber} PV Panel`,
        tempCoeffPmax: this.parseNumber(modelData['THERMAL RATINGS - Temperature Coefficient of Pmax']),
        tempCoeffIsc: this.parseNumber(modelData['THERMAL RATINGS - Temperature Coefficient of Isc']),
        tempCoeffVoc: this.parseNumber(modelData['THERMAL RATINGS - Temperature Coefficient of Voc']),
        moduleType: 'Monocrystalline',
        shortSide,
        longSide,
        weight: this.parseNumber(modelData['MATERIAL DATA - Weight']),
        productWarranty: modelData['WARRANTY - Product Warranty'],
        efficiency: this.parsePercentage(modelData['ELECTRICAL DATA AT STC - Panel Efficiency']),
        openCircuitVoltage: this.parseNumber(modelData['ELECTRICAL DATA AT STC - Open Circuit Voltage (Voc)']),
        shortCircuitCurrent: this.parseNumber(modelData['ELECTRICAL DATA AT STC - Short Circuit Current (Isc)']),
        maxPower: this.parseNumber(modelData['ELECTRICAL DATA AT STC - Maximum Power (Pmax)']?.replace('Wp', '')),
        currentAtPmax: this.parseNumber(modelData['ELECTRICAL DATA AT STC - Current at Maximum Power (Impp)']),
        voltageAtPmax: this.parseNumber(modelData['ELECTRICAL DATA AT STC - Voltage at Maximum Power (Vmpp)']),
      };
    });
  }
}

// Factory for creating appropriate parser
class ParserFactory {
  static createParser(filePath: string): PanelParser {
    if (filePath.includes('JinkoSolar')) {
      return new JinkoSolarParser();
    } else if (filePath.includes('CanadianSolar')) {
      return new CanadianSolarParser();
    } else if (filePath.includes('JASolar')) {
      return new JASolarParser();
    } else {
      throw new Error('Unsupported manufacturer format');
    }
  }
}

// Main function to process files
async function processFiles(inputFiles: string[], outputFile: string): Promise<void> {
  const allPanels: PVPanel[] = [];

  for (const file of inputFiles) {
    try {
      const data = fs.readFileSync(file, 'utf8');
      const parser = ParserFactory.createParser(file);
      const panels = parser.parseData(data);
      allPanels.push(...panels);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  // Write to CSV
  const csvStream = csv.format({ headers: true });
  const writeStream = fs.createWriteStream(outputFile);

  csvStream.pipe(writeStream);

  for (const panel of allPanels) {
    csvStream.write(panel);
  }

  csvStream.end();

  console.log(`Processed ${allPanels.length} panels and saved to ${outputFile}`);
}

// // Example usage
// const inputFiles = ['jinko_solar.txt', 'canadian_solar.txt'];
// const outputFile = 'pv_panels.csv';

// processFiles(inputFiles, outputFile).catch(console.error);

// Parser registration class - to easily add new parsers

class ParserRegistry {
  private static parsers: { [key: string]: new () => PanelParser } = {};
  
  static register(name: string, parserClass: new () => PanelParser): void {
    ParserRegistry.parsers[name] = parserClass;
  }
  
  static getParser(name: string): PanelParser | undefined {
    const ParserClass = ParserRegistry.parsers[name];
    return ParserClass ? new ParserClass() : undefined;
  }
  
  static getRegisteredParsers(): string[] {
    return Object.keys(ParserRegistry.parsers);
  }
}

// JASolar parser implementation
class JASolarParser extends PanelParser {
  constructor() {
    super('JASolar');
  }

  parseData(data: string): PVPanel[] {
    const rows = data.split('\n').filter(row => row.trim() !== '');
    const panels: PVPanel[] = [];

    // First row contains headers
    const headers = rows[0].split(',').map(h => h.trim());

    // Process data rows
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].split(',').map(cell => cell.trim());
      const panelData: { [key: string]: string } = {};

      // Create key-value pairs from headers and cells
      headers.forEach((header, index) => {
        panelData[header] = cells[index];
      });

      const modelNumber = panelData['Module Type'];

      panels.push({
        manufacturer: this.manufacturer,
        modelNumber: modelNumber,
        description: `JASolar ${modelNumber}`,
        maxPower: this.parseNumber(panelData['Rated Maximum Power (Pmax)']),
        openCircuitVoltage: this.parseNumber(panelData['Open Circuit Voltage (Voc)']),
        voltageAtPmax: this.parseNumber(panelData['Maximum Power Voltage (Vmp)']),
        shortCircuitCurrent: this.parseNumber(panelData['Short Circuit Current (Isc)']),
        currentAtPmax: this.parseNumber(panelData['Maximum Power Current (Imp)']),
        efficiency: this.parsePercentage(panelData['Module Efficiency']),
        tempCoeffIsc: this.parseNumber(panelData['Temperature Coefficient of Isc/a_Isc']),
        tempCoeffVoc: this.parseNumber(panelData['Temperature Coefficient of Voc (ẞ_Voc)']),
        tempCoeffPmax: this.parseNumber(panelData['Temperature Coefficient of Pmax(y_Pmp)']),
        moduleType: 'Monocrystalline'
      });
    }

    return panels;
  }
}

// Register parsers
ParserRegistry.register('JinkoSolar', JinkoSolarParser);
ParserRegistry.register('CanadianSolar', CanadianSolarParser);
ParserRegistry.register('JASolar', JASolarParser);


async function main() {
const filePaths = [
  // path.resolve(__dirname, '../data/CanadianSolar.txt'),
  // path.resolve(__dirname, '../data/JinkoSolar.txt'),
  path.resolve(__dirname, '../data/JASolar.txt'),
];

  const outputPath = path.join(__dirname, '../prisma/seeds/pvPanels.csv');
  console.log(`writing to CSV: ${outputPath}`);

  await processFiles(filePaths, outputPath);

  console.log(`Seed data written to ${outputPath}`);
}

main().catch(console.error);