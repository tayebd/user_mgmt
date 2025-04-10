import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

// Define the Inverter interface matching the database model
type Inverter = {
  id?: number;
  model: string;
  description?: string | null;
  maker?: string | null;
  
  // AC Output Parameters
  phaseType?: string | null;
  outputVoltage?: number | null;
  nominalFrequency?: number | null;
  maxOutputCurrent?: number | null;
  nominalOutputPower?: number | null;
  maxOutputPower?: number | null;
  maxApparentPower?: number | null;
  powerFactor?: number | null;
  totalHarmonicDistortion?: number | null;
  acGridConnectionType?: string | null;
  
  // DC Input Parameters
  maxDcVoltage?: number | null;
  startVoltage?: number | null;
  nominalDcVoltage?: number | null;
  mpptVoltageRangeMin?: number | null;
  mpptVoltageRangeMax?: number | null;
  numberOfMpptTrackers?: number | null;
  stringsPerMppt?: number | null;
  maxInputCurrentPerMppt?: number | null;
  maxShortCircuitCurrent?: number | null;
  maxRecommendedPvPower?: number | null;
  
  // Efficiency
  maxEfficiency?: number | null;
  europeanEfficiency?: number | null;
  mpptEfficiency?: number | null;
  
  // Physical & Environmental
  dimensions?: string | null;
  weight?: number | null;
  ipRating?: string | null;
  operatingTempRange?: string | null;
  coolingMethod?: string | null;
  noiseLevel?: number | null;
  
  // Communication & Protection
  communicationInterfaces?: string | null;
  displayType?: string | null;
  protectionFeatures?: string | null;
  
  // Certifications & Warranty
  certifications?: string | null;
  warrantyYears?: number | null;
};

// Interface for raw data from the parsed table
interface RawInverterData {
  [key: string]: string | number | undefined;
}

// Abstract parser class
abstract class InverterParser {
  protected maker: string;
  
    constructor(maker: string) {
    this.maker = maker;
  }
  
    abstract parseData(data: string): Inverter[];
  
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

// Factory for creating appropriate parser
class ParserFactory {
  static createParser(filePath: string): InverterParser {
    if (filePath.includes('Growatt')) {
      return new GrowattParser();
    } else {
      throw new Error('Unsupported maker format');
    }
  }
}

// Main function to process files
async function processFiles(inputFiles: string[], outputFile: string): Promise<void> {
  const allInverters: Inverter[] = [];


  for (const file of inputFiles) {
    try {
      const data = fs.readFileSync(file, 'utf8');
      const parser = ParserFactory.createParser(file);
      const panels = parser.parseData(data);
      allInverters.push(...panels);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }

  // Write to CSV
  const csvStream = csv.format({ headers: true });
  const writeStream = fs.createWriteStream(outputFile);

  csvStream.pipe(writeStream);

  for (const inverter of allInverters) {
    csvStream.write(inverter);
  }

  csvStream.end();

  console.log(`Processed ${allInverters.length} inverters and saved to ${outputFile}`);
}


class ParserRegistry {
  private static parsers: { [key: string]: new () => InverterParser } = {};
  
  static register(name: string, parserClass: new () => InverterParser): void {
    ParserRegistry.parsers[name] = parserClass;
  }
  
  static getParser(name: string): InverterParser | undefined {
    const ParserClass = ParserRegistry.parsers[name];
    return ParserClass ? new ParserClass() : undefined;
  }
  
  static getRegisteredParsers(): string[] {
    return Object.keys(ParserRegistry.parsers);
  }
}

// Helper function to parse float values or return null if parsing fails
function parseFloatOrNull(value: string | undefined): number | null {
  if (!value) return null;
  // Handle percentage values
  if (value.includes('%')) {
    value = value.replace('%', '');
  }
  // Extract first number from range if needed (e.g. "230V (180-270V)" -> 230)
  if (value.includes('(')) {
    value = value.split('(')[0].trim();
  }
  // Remove units like V, A, W, etc.
  value = value.replace(/[a-zA-Z]/g, '').trim();
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}


// Helper function to parse integer values or return null if parsing fails
function parseIntOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

// Infer phase type from grid connection information
function inferPhaseType(gridConnectionType: string | undefined): string | null {
  if (!gridConnectionType) return null;
  
  const lowerCase = gridConnectionType.toLowerCase();
  if (lowerCase.includes('3-phase') || lowerCase.includes('three') || lowerCase.includes('3p')) {
    return 'Three-phase';
  } else if (lowerCase.includes('1-phase') || lowerCase.includes('single') || lowerCase.includes('1p')) {
    return 'Single-phase';
  }
  return null;
}

// Infer phase type from model number for GoodWe inverters
function inferPhaseTypeFromModel(model: string | undefined): string | null {
  if (!model) return null;
  
  // GoodWe typically uses:
  // - DT, ET, BT, etc. series for three-phase inverters
  // - DNS, GW, etc. series for single-phase inverters
  const model = model.toUpperCase();
  
  if (model.includes('DT') || model.includes('ET') || model.includes('BT') || 
      model.includes('SMT') || model.includes('MT') || model.includes('HT') || 
      model.includes('3P') || model.includes('3PH')) {
    return 'Three-phase';
  } else if (model.includes('DNS') || model.includes('GW') || model.includes('NS') || 
             model.includes('XS') || model.includes('MS') || model.includes('ES') || 
             model.includes('1P') || model.includes('1PH')) {
    return 'Single-phase';
  }
  
  return null;
}

// Growatt parser implementation
class GrowattParser extends InverterParser {
  constructor() {
    super('Growatt');
  }

  parseData(data: string): Inverter[] {
    const rows = data.split('\n').filter(row => row.trim() !== '');
    const inverters: Inverter[] = [];
  
    // First row contains headers
    const headers = rows[0].split(',').map(h => h.trim());
  
    // Process data rows
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].split(',').map(cell => cell.trim());
      const inverterData: { [key: string]: string } = {};
  
      // Create key-value pairs from headers and cells
      headers.forEach((header, index) => {
        inverterData[header] = cells[index];
      });
  
      // Parse MPPT voltage range
      const mpptRangeString = inverterData['MPP voltage range'] || '';
      const mpptRangeParts = mpptRangeString.split('-');
      const mpptVoltageRangeMin = mpptRangeParts.length > 0 ? parseFloat(mpptRangeParts[0]) : null;
      const mpptVoltageRangeMax = mpptRangeParts.length > 1 ? parseFloat(mpptRangeParts[1]) : null;
  
      inverters.push({
        id: undefined, // Will be set by the database
        maker: 'Growatt',
        model: inverterData['Inverter Model'],
        description: `Growatt ${inverterData['Inverter Model']}`,
        
        // AC Output Parameters
        phaseType: inferPhaseType(inverterData['AC grid connection type']),
        outputVoltage: parseFloatOrNull(inverterData['Nominal AC voltage(range)']),
        nominalFrequency: parseFloatOrNull(inverterData['AC grid frequency(range)']),
        maxOutputCurrent: parseFloatOrNull(inverterData['Max. output curent']),
        nominalOutputPower: parseFloatOrNull(inverterData['AC nominal power']),
        maxOutputPower: parseFloatOrNull(inverterData['AC nominal power']), // Same as nominal in Growatt specs
        maxApparentPower: parseFloatOrNull(inverterData['Max. AC apparent power']),
        powerFactor: parseFloatOrNull(inverterData['Adjustable power factor']),
        totalHarmonicDistortion: parseFloatOrNull(inverterData['THDI']),
        acGridConnectionType: inverterData['AC grid connection type'],
        
        // DC Input Parameters
        maxDcVoltage: parseFloatOrNull(inverterData['Max. DC voltage']),
        startVoltage: parseFloatOrNull(inverterData['Start voltage']),
        nominalDcVoltage: parseFloatOrNull(inverterData['Nominal voltage']),
        mpptVoltageRangeMin,
        mpptVoltageRangeMax,
        numberOfMpptTrackers: parseIntOrNull(inverterData['No. of MPP trackers']),
        stringsPerMppt: parseIntOrNull(inverterData['No. of PV stings per MPP tracker']),
        maxInputCurrentPerMppt: parseFloatOrNull(inverterData['Max. input curent per MPP tracker']),
        maxShortCircuitCurrent: parseFloatOrNull(inverterData['Max. short-circuit curent per MPP tracker']),
        maxRecommendedPvPower: parseFloatOrNull(inverterData['Max. recommended PV power']),
        
        // Efficiency
        maxEfficiency: parseFloatOrNull(inverterData['Max.efficiency']),
        europeanEfficiency: parseFloatOrNull(inverterData['European efficiency']),
        mpptEfficiency: parseFloatOrNull(inverterData['MPPT efficiency']),
        
        // Fields that are not in the Growatt data
        dimensions: null,
        weight: null,
        ipRating: null,
        operatingTempRange: null,
        coolingMethod: null,
        noiseLevel: null,
        communicationInterfaces: null,
        displayType: null,
        protectionFeatures: null,
        certifications: null,
        warrantyYears: null
      });
    }
  
    return inverters;
  }

}

// GoodWe parser implementation
class GoodWeParser extends InverterParser {
  constructor() {
    super("Growatt");
  }
  parseData(data: string): Inverter[] {
    const rows = data.split("\n").filter((row) => row.trim() !== "");
    const inverters: Inverter[] = [];

    // First row contains headers
    const headers = rows[0].split(",").map((h) => h.trim());

    // Process data rows
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].split(",").map((cell) => cell.trim());
      const inverterData: { [key: string]: string } = {};

      // Create key-value pairs from headers and cells
      headers.forEach((header, index) => {
        inverterData[header] = cells[index];
      });

      // Parse MPPT voltage range
      const mpptRangeString =
        inverterData["MPPT Operating Voltage Range"] || "";
      const mpptRangeParts = mpptRangeString.split("-");
      const mpptVoltageRangeMin =
        mpptRangeParts.length > 0 ? parseFloat(mpptRangeParts[0]) : null;
      const mpptVoltageRangeMax =
        mpptRangeParts.length > 1 ? parseFloat(mpptRangeParts[1]) : null;

      inverters.push({
        id: undefined, // Will be set by the database
        maker: "GoodWe",
        model: inverterData["Inverter Model"],
        description: `GoodWe ${inverterData["Inverter Model"]} inverter`,

        // AC Output Parameters
        phaseType: inferPhaseTypeFromModel(inverterData["Inverter Model"]),
        outputVoltage: parseFloatOrNull(inverterData["Nominal Output Voltage"]),
        nominalFrequency: parseFloatOrNull(
          inverterData["Nominal AC Grid Frequency"]
        ),
        maxOutputCurrent: parseFloatOrNull(inverterData["Max. Output Current"]),
        nominalOutputPower: parseFloatOrNull(
          inverterData["Nominal Output Power"]
        ),
        maxOutputPower: parseFloatOrNull(inverterData["Max. AC Active Power"]),
        maxApparentPower: parseFloatOrNull(
          inverterData["Max. AC Apparent Power"]
        ),
        powerFactor: parseFloatOrNull(inverterData["Power Factor"]),
        totalHarmonicDistortion: parseFloatOrNull(
          inverterData["Max. Total Harmonic Distortion"]
        ),
        acGridConnectionType: null, // Not directly provided in GoodWe data

        // DC Input Parameters
        maxDcVoltage: parseFloatOrNull(inverterData["Max. Input Voltage"]),
        startVoltage: parseFloatOrNull(inverterData["Start-up Voltage"]),
        nominalDcVoltage: parseFloatOrNull(
          inverterData["Nominal Input Voltage"]
        ),
        mpptVoltageRangeMin,
        mpptVoltageRangeMax,
        numberOfMpptTrackers: parseIntOrNull(
          inverterData["Number of MPP Trackers"]
        ),
        stringsPerMppt: parseIntOrNull(
          inverterData["Number of Strings per MPPT"]
        ),
        maxInputCurrentPerMppt: parseFloatOrNull(
          inverterData["Max. Input Current per MPPT"]
        ),
        maxShortCircuitCurrent: parseFloatOrNull(
          inverterData["Max. Short Circuit Current per MPPT"]
        ),
        maxRecommendedPvPower: null, // Not directly provided in GoodWe data

        // Efficiency
        maxEfficiency: parseFloatOrNull(inverterData["Max. Efficiency"]),
        europeanEfficiency: parseFloatOrNull(
          inverterData["European Efficiency"]
        ),
        mpptEfficiency: null, // Not provided in GoodWe data

        // Fields that are not in the GoodWe data
        dimensions: null,
        weight: null,
        ipRating: null,
        operatingTempRange: null,
        coolingMethod: null,
        noiseLevel: null,
        communicationInterfaces: null,
        displayType: null,
        protectionFeatures: null,
        certifications: null,
        warrantyYears: null,
      });
    }

    return inverters;
  }
}


// Register parsers
ParserRegistry.register('Growatt', GrowattParser);
ParserRegistry.register('GoodWe', GoodWeParser);


async function main() {
const filePaths = [
  // path.resolve(__dirname, '../data/CanadianSolar.txt'),
  // path.resolve(__dirname, '../data/JinkoSolar.txt'),
  path.resolve(__dirname, '../data/Growatt_Inverter.csv'),
];

  const outputPath = path.join(__dirname, '../prisma/seeds/Inverters.csv');
  console.log(`writing to CSV: ${outputPath}`);

  await processFiles(filePaths, outputPath);

  console.log(`Seed data written to ${outputPath}`);
}

main().catch(console.error);
