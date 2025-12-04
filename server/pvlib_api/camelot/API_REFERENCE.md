# API Reference

## Overview

This document provides detailed API documentation for all public classes and methods in the PV Panel Datasheet Extraction utility.

## Core Classes

---

## CamelotDatasheetProcessor

Main orchestration class for batch processing of PV panel datasheets.

### Constructor

```python
def __init__(self, config: ProcessingConfig)
```

**Parameters:**
- `config` (ProcessingConfig): Configuration object with processing settings

**Raises:**
- `ValidationError`: If config validation fails

---

### Methods

#### process_batch()

```python
def process_batch(self) -> Dict[str, Any]
```

Orchestrates batch processing of all PDFs in the configuration.

**Returns:**
- `Dict[str, Any]`: Processing summary with statistics

**Summary Fields:**
```python
{
    'timestamp': str,              # ISO format timestamp
    'total_files': int,            # Total files processed
    'successful_extractions': int, # Successfully processed count
    'failed_extractions': int,     # Failed processing count
    'success_rate': float,         # Success percentage
    'average_processing_time_ms': float,  # Average time per file
    'manufacturers_found': Dict[str, int],  # Manufacturer statistics
    'errors': List[Dict[str, Any]],        # Error details
    'results_count': int,          # Number of results
    'extraction_method': str       # Method used
}
```

**Example:**
```python
processor = CamelotDatasheetProcessor(config)
summary = processor.process_batch()
print(f"Success rate: {summary['success_rate']}%")
```

---

#### process_single_pdf()

```python
def process_single_pdf(self, pdf_config: Dict[str, Any]) -> Optional[ExtractionResult]
```

Process a single PDF datasheet.

**Parameters:**
- `pdf_config` (Dict[str, Any]): Configuration with file path and manufacturer

**Required Fields in pdf_config:**
- `file_path` (str): Path to PDF file
- `manufacturer` (str): Manufacturer name

**Returns:**
- `Optional[ExtractionResult]`: Extraction result or None if failed

**Raises:**
- `FileNotFoundError`: If PDF file doesn't exist
- `Exception`: For other processing errors

**Example:**
```python
result = processor.process_single_pdf({
    'file_path': 'datasheet.pdf',
    'manufacturer': 'Q CELLS'
})
if result:
    print(f"Extracted: {result.panel_data.maxPower}W")
```

---

#### save_results()

```python
def save_results(self, output_dir: Path) -> Dict[str, Path]
```

Save all extraction results to files.

**Parameters:**
- `output_dir` (Path): Output directory path

**Returns:**
- `Dict[str, Path]`: Dictionary mapping format to file path

**Output Formats:**
- `json`: Detailed extraction results
- `csv`: Tabular format for spreadsheet
- `summary`: Processing statistics

**Example:**
```python
saved = processor.save_results(Path('./results'))
print(f"JSON: {saved['json']}")
print(f"CSV: {saved['csv']}")
```

---

#### generate_summary()

```python
def generate_summary(self, successful: int, failed: int) -> Dict[str, Any]
```

Generate processing summary statistics.

**Parameters:**
- `successful` (int): Number of successful extractions
- `failed` (int): Number of failed extractions

**Returns:**
- `Dict[str, Any]`: Summary dictionary

---

## CamelotExtractor

Handles PDF table extraction using Camelot library.

### Constructor

```python
def __init__(self, pdf_path: Path)
```

**Parameters:**
- `pdf_path` (Path): Path to PDF file

---

### Methods

#### extract_all()

```python
def extract_all(self) -> Dict[str, Any]
```

Extract all tables from PDF using Camelot.

**Returns:**
```python
{
    'success': bool,                    # Extraction success status
    'tables': List[Dict[str, Any]],     # Extracted tables
    'text': str,                        # Fallback text content
    'table_count': int,                 # Number of tables found
    'method': str,                      # Extraction method
    'error': Optional[str]              # Error message if failed
}
```

**Table Structure:**
```python
{
    'table_number': int,        # Sequential table number
    'shape': Tuple[int, int],   # (rows, columns)
    'data': DataFrame,          # Pandas DataFrame
    'accuracy': float,          # Extraction accuracy score
    'whitespace': float         # Whitespace ratio
}
```

**Example:**
```python
extractor = CamelotExtractor(Path('datasheet.pdf'))
result = extractor.extract_all()
if result['success']:
    print(f"Found {result['table_count']} tables")
    for table in result['tables']:
        print(f"Table {table['table_number']}: {table['shape']}")
```

---

#### _deduplicate_tables()

```python
def _deduplicate_tables(self, tables: List) -> List
```

Remove duplicate tables based on content similarity.

**Parameters:**
- `tables` (List): List of Camelot table objects

**Returns:**
- `List`: Deduplicated table list

**Algorithm:**
1. Compare table dimensions
2. Sample first 3 rows for similarity
3. Keep only unique tables

---

#### _extract_text_fallback()

```python
def _extract_text_fallback(self) -> str
```

Fallback text extraction using pdfplumber.

**Returns:**
- `str`: Extracted text content

**Note:** Used when table extraction fails or as supplementary data

---

#### get_electrical_specs_table()

```python
def get_electrical_specs_table(self) -> Optional[Dict[str, Any]]
```

Find the main electrical specifications table.

**Returns:**
- `Optional[Dict[str, Any]]`: Electrical specs table or None

**Detection:** Searches for keywords:
- 'POWER CLASS'
- 'ELECTRICAL CHARACTERISTICS'
- 'MPP'
- 'VOC'
- 'ISC'

---

## SimplifiedParser

Parses extracted tables into structured PV panel data.

### Constructor

```python
def __init__(self, manufacturer: str)
```

**Parameters:**
- `manufacturer` (str): Manufacturer name

---

### Methods

#### parse()

```python
def parse(self, tables: List[Dict[str, Any]], text: str) -> PVPanelData
```

Parse panel data from extracted tables.

**Parameters:**
- `tables` (List[Dict[str, Any]]): List of table dictionaries
- `text` (str): Fallback text content

**Returns:**
- `PVPanelData`: Structured panel data

**Example:**
```python
parser = SimplifiedParser('Q CELLS')
panel_data = parser.parse(tables, text_content)
print(f"Model: {panel_data.model}")
print(f"Power: {panel_data.maxPower}W")
```

---

#### _parse_transposed_electrical_table()

```python
def _parse_transposed_electrical_table(self, df: DataFrame) -> Dict[str, Any]
```

Parse transposed electrical characteristics table (Q CELLS format).

**Parameters:**
- `df` (DataFrame): Pandas DataFrame with transposed table

**Returns:**
```python
{
    'max_power': Optional[float],       # Maximum power (W)
    'efficiency': Optional[float],      # Efficiency (%)
    'voc': Optional[float],             # Open circuit voltage (V)
    'isc': Optional[float],             # Short circuit current (A)
    'vmp': Optional[float],             # Voltage at MPP (V)
    'imp': Optional[float]              # Current at MPP (A)
}
```

**Table Format:**
```
| POWER CLASS | 380 | 385 | 390 | 395 | 400 | 405 |
|-------------|-----|-----|-----|-----|-----|-----|
| Isc [A]     | ... | ... | ... | ... | ... | 8.28|
| Voc [V]     | ... | ... | ... | ... | ... |46.45|
```

**Algorithm:**
1. Detect "ELECTRICAL CHARACTERISTICS" keyword
2. Find power class row (multiple numeric values)
3. Get max power value (405W)
4. Locate column index for max power
5. Search for parameter names
6. Extract values from correct column

---

#### _parse_electrical_table()

```python
def _parse_electrical_table(self, df: DataFrame) -> Dict[str, Any]
```

Parse standard electrical characteristics table.

**Parameters:**
- `df` (DataFrame): Pandas DataFrame

**Returns:** Dict as above

**Note:** Tries transposed parser first, falls back to standard parsing

---

#### _find_column_values()

```python
def _find_column_values(self, df: DataFrame, keywords: List[str]) -> List[str]
```

Find values in columns matching keywords.

**Parameters:**
- `df` (DataFrame): DataFrame to search
- `keywords` (List[str]): Keywords to look for

**Returns:**
- `List[str]`: List of matching values

**Example:**
```python
values = parser._find_column_values(df, ['VOC', 'VOLTAGE'])
```

---

#### _extract_number()

```python
def _extract_number(self, value_str: str) -> Optional[float]
```

Extract numeric value from string.

**Parameters:**
- `value_str` (str): String containing number

**Returns:**
- `Optional[float]`: Extracted number or None

**Example:**
```python
parser._extract_number("405.0W")  # Returns 405.0
parser._extract_number("abc")     # Returns None
```

---

#### _extract_model()

```python
def _extract_model(self, text: str) -> str
```

Extract model name from text.

**Parameters:**
- `text` (str): Text content to parse

**Returns:**
- `str`: Model name or "Unknown Model"

**Supported Patterns:**
- Q CELLS: `Q.PEAK\s+[A-Z0-9\s.-]+`
- Hyperion: `HY-[A-Z0-9]+-[A-Z0-9/]+`
- Generic: `[A-Z]{2,}-?[A-Z0-9]{3,}`

---

#### _extract_dimensions()

```python
def _extract_dimensions(self, text: str) -> Dict[str, Optional[float]]
```

Extract panel dimensions.

**Parameters:**
- `text` (str): Text content

**Returns:**
```python
{
    'long_side': Optional[float],   # Length in meters
    'short_side': Optional[float]   # Width in meters
}
```

**Pattern:** Matches format like "2015 mm × 1000 mm"

---

#### _extract_weight()

```python
def _extract_weight(self, text: str) -> Optional[float]
```

Extract panel weight.

**Parameters:**
- `text` (str): Text content

**Returns:**
- `Optional[float]`: Weight in kg or None

---

#### _extract_warranties()

```python
def _extract_warranties(self, text: str) -> Dict[str, Optional[str]]
```

Extract warranty information.

**Parameters:**
- `text` (str): Text content

**Returns:**
```python
{
    'product': Optional[str],       # Product warranty
    'performance': Optional[str]    # Performance warranty
}
```

---

#### _extract_certification()

```python
def _extract_certification(self, text: str) -> Optional[str]
```

Extract certification information.

**Parameters:**
- `text` (str): Text content

**Returns:**
- `Optional[str]` Certification or None

**Pattern:** Matches "IEC 61215", "IEC 61730", etc.

---

## Data Models (models.py)

---

### PVPanelData

Structured PV panel specification data.

**Fields:**

```python
maker: str                                     # Manufacturer name
model: str                                     # Model name/identifier
description: str                               # Full description
maxPower: Optional[float] = None              # Maximum power (W)
openCircuitVoltage: Optional[float] = None    # Voc (V)
shortCircuitCurrent: Optional[float] = None   # Isc (A)
voltageAtPmax: Optional[float] = None         # Vmp (V)
currentAtPmax: Optional[float] = None         # Imp (A)
maxSeriesFuseRating: Optional[float] = None   # Max fuse rating (A)
tempCoeffPmax: Optional[float] = None         # Temperature coefficient Pmax
tempCoeffIsc: Optional[float] = None          # Temperature coefficient Isc
tempCoeffVoc: Optional[float] = None          # Temperature coefficient Voc
tempCoeffIpmax: Optional[float] = None        # Temperature coefficient Imp
tempCoeffVpmax: Optional[float] = None        # Temperature coefficient Vmp
moduleType: Optional[str] = None              # Module type
shortSide: Optional[float] = None             # Width (m)
longSide: Optional[float] = None              # Length (m)
weight: Optional[float] = None                # Weight (kg)
efficiency: Optional[float] = None            # Efficiency (%)
performanceWarranty: Optional[str] = None     # Performance warranty
productWarranty: Optional[str] = None         # Product warranty
certification: Optional[str] = None           # Certifications
```

**Example:**
```python
panel = PVPanelData(
    maker="Q CELLS",
    model="Q.PEAK DUO L-G5.2",
    maxPower=405.0,
    efficiency=20.1
)
```

**Conversion:**
```python
# To dictionary
panel_dict = panel.dict()

# To JSON
panel_json = panel.json()
```

---

### ExtractionResult

Result of a single datasheet extraction.

**Fields:**

```python
panel_data: PVPanelData                              # Extracted panel data
confidence_scores: Dict[str, float]                 # Confidence scores per field
extraction_method: str                               # Extraction method used
warnings: List[str] = []                            # Warning messages
errors: List[str] = []                              # Error messages
processing_time_ms: float                          # Processing time
source_file: Optional[str] = None                   # Source PDF path
```

**Example:**
```python
result = ExtractionResult(
    panel_data=panel,
    confidence_scores={'maxPower': 0.95},
    extraction_method='camelot_table_extraction',
    processing_time_ms=4.46,
    source_file='datasheet.pdf'
)
```

---

### ProcessingConfig

Configuration for batch processing.

**Fields:**

```python
pdf_files: List[Dict[str, Any]]                    # List of PDF configurations
skip_validation: bool = False                      # Skip data validation
db_connection_string: Optional[str] = None        # Database connection
output_dir: Path                                   # Output directory
output_formats: List[str] = ["json"]              # Output formats
```

**Example:**
```python
config = ProcessingConfig(
    pdf_files=[
        {'file_path': 'datasheet1.pdf', 'manufacturer': 'Q CELLS'}
    ],
    output_dir=Path('./results'),
    output_formats=['json', 'csv']
)
```

---

## CLI Interface (camelot_cli.py)

---

### Main Function

```python
def main()
```

CLI entry point.

**Usage:**
```bash
python camelot_cli.py --output DIR file PDF_PATH --manufacturer NAME
```

**Options:**
- `--output`: Output directory (required)
- `file`: Process single file mode
- `--manufacturer`: Manufacturer name (required)
- `--help`: Show help message

**Example:**
```bash
python camelot_cli.py \
    --output ./results \
    file datasheet.pdf \
    --manufacturer "Q CELLS"
```

---

## Batch Processing (process_batch.py)

---

### Main Function

```python
def main()
```

Batch processing script entry point.

**Usage:**
```bash
python process_batch.py CONFIG_FILE
```

**Parameters:**
- `CONFIG_FILE`: Path to JSON configuration file

**Example:**
```bash
python process_batch.py batch_config.json
```

---

## Debug Tools (debug_tables.py)

---

### debug_tables()

```python
def debug_tables(pdf_path: str)
```

Visualize table structures in PDF.

**Parameters:**
- `pdf_path` (str): Path to PDF file

**Output:**
- Table dimensions and content
- Electrical specification keywords found
- Text content sample

**Usage:**
```bash
python debug_tables.py datasheet.pdf
```

---

## Utility Functions

---

### Logging

The system uses Python's logging module with named loggers:

```python
logger = logging.getLogger(__name__)
```

**Log Levels:**
- `INFO`: Normal processing steps
- `WARNING`: Recoverable issues
- `ERROR`: Extraction failures

**Example:**
```python
import logging
logging.basicConfig(level=logging.INFO)
```

---

## Exceptions

### Custom Exceptions

While the system primarily uses standard Python exceptions:

- `ValidationError` (pydantic): Configuration validation failures
- `FileNotFoundError`: Missing PDF files
- `KeyError`: Missing required configuration fields

---

## Error Handling Patterns

### Try-Except Blocks

```python
try:
    result = extractor.extract_all()
    if not result['success']:
        logger.error(f"Extraction failed: {result['error']}")
        return None
except Exception as e:
    logger.error(f"Unexpected error: {e}", exc_info=True)
    return None
```

### Graceful Degradation

```python
if specs['max_power']:
    max_power = specs['max_power']
else:
    logger.warning("Power not found, using fallback")
    max_power = self._extract_from_text(text, [r'POWER.*?(\d+)'])
```

---

## Constants

### Expected Value Ranges

```python
POWER_RANGE = (300, 500)        # Watts
VOC_RANGE = (30, 60)            # Volts
ISC_RANGE = (5, 15)             # Amperes
VMP_RANGE = (20, 50)            # Volts
IMP_RANGE = (5, 15)             # Amperes
EFFICIENCY_RANGE = (15, 25)     # Percent
WEIGHT_RANGE = (15, 30)         # Kilograms
```

---

**Last Updated**: 2025-11-03
**Version**: 1.0
