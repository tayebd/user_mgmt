# Architecture Documentation

## System Overview

The PV Panel Datasheet Extraction utility follows a layered architecture designed for flexibility, maintainability, and extensibility. The system processes PDF datasheets through multiple stages to extract structured solar panel specifications.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLI Interface                           │
│                    (camelot_cli.py)                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              CamelotDatasheetProcessor                      │
│                    (orchestration layer)                    │
│  • Batch processing management                              │
│  • File validation                                          │
│  • Result aggregation                                       │
│  • Output generation                                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                CamelotExtractor                             │
│                    (extraction layer)                       │
│  • PDF parsing with Camelot                                 │
│  • Table deduplication                                      │
│  • Text fallback extraction                                 │
│  • Multiple extraction strategies                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                SimplifiedParser                             │
│                    (parsing layer)                          │
│  • Transposed table parsing                                 │
│  • Alternating row format parsing                           │
│  • Manufacturer-specific patterns                           │
│  • Data validation & normalization                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Models                                  │
│                     (data layer)                            │
│  • Pydantic data models                                     │
│  • Validation & serialization                               │
│  • Type definitions                                         │
└─────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. CLI Interface (`camelot_cli.py`)

**Responsibilities:**
- Parse command-line arguments
- Initialize configuration
- Start processing workflow
- Display results to user

**Key Components:**
- ArgumentParser for CLI options
- Main entry point (`main()`)
- Output formatting

**Design Pattern:** Facade - Simplifies interface to complex subsystem

### 2. Orchestration Layer (`camelot_processor.py`)

**Responsibilities:**
- Coordinate multi-file batch processing
- Manage processing lifecycle
- Aggregate results from multiple extractions
- Generate summaries and reports
- Handle errors and validation

**Key Class:** `CamelotDatasheetProcessor`

**Methods:**
- `process_batch()` - Main orchestration logic
- `process_single_pdf()` - Single file processing
- `save_results()` - Output generation (JSON, CSV, Summary)
- `generate_summary()` - Create processing statistics

**Design Pattern:** Observer - Tracks processing state with progress bars

### 3. Extraction Layer (`camelot_extractor.py`)

**Responsibilities:**
- Extract structured tables from PDFs using Camelot
- Handle multiple extraction strategies (lattice, stream)
- Deduplicate similar tables
- Fallback text extraction with pdfplumber
- Return structured table data

**Key Class:** `CamelotExtractor`

**Methods:**
- `extract_all()` - Main extraction coordination
- `_deduplicate_tables()` - Remove duplicate tables
- `_extract_text_fallback()` - Text extraction backup
- `get_electrical_specs_table()` - Find main specs table

**Design Strategy:**
- Try lattice extraction first (for bordered tables)
- Fallback to stream extraction (for borderless tables)
- Combine and deduplicate results

### 4. Parsing Layer (`simplified_parser.py`)

**Responsibilities:**
- Parse extracted tables into structured data
- Handle multiple table formats (transposed, alternating rows)
- Extract manufacturer-specific information
- Normalize and validate data
- Generate confidence scores

**Key Class:** `SimplifiedParser`

**Methods:**
- `parse()` - Main parsing coordination
- `_parse_transposed_electrical_table()` - Transposed format handler
- `_parse_electrical_table()` - Standard format handler
- `_extract_model()` - Model name extraction
- `_extract_dimensions()` - Dimension parsing
- `_extract_weight()` - Weight extraction

**Parsing Strategies:**

#### A. Transposed Table Format (Q CELLS)
```python
# Table structure:
# Row 1: POWER CLASS | 380 | 385 | 390 | 395 | 400 | 405
# Row 2: Isc [A]     |     |     |     |     |     | 8.28
# Row 3: Voc [V]     |     |     |     |     |     | 46.45

# Algorithm:
1. Detect "ELECTRICAL CHARACTERISTICS" keyword
2. Find row with multiple power class values (row 1)
3. Select max power class (405W)
4. Find column index for max power
5. Search for parameter names in leftmost column
6. Extract value from corresponding row, max power column
```

#### B. Alternating Row Format (Hyperion)
```python
# Table structure:
# Row 1: "Maximum Power at STC (Pmax/W)"
# Row 2: 415    410    405    400    395
# Row 3: "Optimum Operating Voltage (Vmp/V)"
# Row 4: 31.61  31.45  31.21  31.01  30.84

# Algorithm:
1. Detect table with power class values
2. Find power class row (contains multiple numeric values)
3. Locate column for max power (415W)
4. Iterate through rows in pairs (label row + value row)
5. Combine text from both rows to identify parameter
6. Extract value from value row, max power column
```

### 5. Data Layer (`models.py`)

**Responsibilities:**
- Define data structures using Pydantic
- Validate data integrity
- Serialize/deserialize data
- Provide type safety

**Key Models:**

#### PVPanelData
```python
class PVPanelData(BaseModel):
    maker: str
    model: str
    maxPower: Optional[float] = None
    openCircuitVoltage: Optional[float] = None
    shortCircuitCurrent: Optional[float] = None
    voltageAtPmax: Optional[float] = None
    currentAtPmax: Optional[float] = None
    efficiency: Optional[float] = None
    weight: Optional[float] = None
    longSide: Optional[float] = None
    shortSide: Optional[float] = None
    # ... more fields
```

#### ExtractionResult
```python
class ExtractionResult(BaseModel):
    panel_data: PVPanelData
    confidence_scores: Dict[str, float]
    extraction_method: str
    warnings: List[str] = []
    errors: List[str] = []
    processing_time_ms: float
    source_file: Optional[str] = None
```

#### ProcessingConfig
```python
class ProcessingConfig(BaseModel):
    pdf_files: List[Dict[str, Any]]
    skip_validation: bool = False
    db_connection_string: Optional[str] = None
    output_dir: Path
    output_formats: List[str] = ["json"]
```

## Data Flow

```
Input PDF
    │
    ▼
Camelot Extraction
    ├─ Lattice extraction (bordered tables)
    ├─ Stream extraction (borderless tables)
    └─ Text fallback (pdfplumber)
    │
    ▼
Table Deduplication
    ├─ Compare dimensions
    ├─ Compare content similarity
    └─ Remove duplicates
    │
    ▼
Table Parsing
    ├─ Detect table format
    ├─ Extract power classes
    ├─ Find max power column
    └─ Parse parameters
    │
    ▼
Data Validation
    ├─ Range validation
    ├─ Required field checks
    └─ Confidence scoring
    │
    ▼
Result Serialization
    ├─ JSON format
    ├─ CSV format
    └─ Summary report
```

## Design Patterns Used

### 1. Strategy Pattern
- Multiple table extraction strategies (lattice, stream, text)
- Multiple parsing strategies (transposed, alternating row, standard)

### 2. Factory Pattern
- Parser creation based on manufacturer
- Table format detection

### 3. Observer Pattern
- Progress bar updates during batch processing
- Logging of extraction steps

### 4. Template Method
- Common extraction workflow in base extractor
- Customization in derived parsers

### 5. Facade Pattern
- CLI provides simple interface to complex system
- Processor coordinates multiple subsystems

## Error Handling

### Error Levels

1. **Extraction Errors** - PDF cannot be read
   - Caught in `CamelotExtractor.extract_all()`
   - Logged with full traceback
   - Added to errors list

2. **Parsing Errors** - Table structure unexpected
   - Caught in `SimplifiedParser.parse()`
   - Field set to None with warning
   - Processing continues with fallback methods

3. **Validation Errors** - Data out of expected range
   - Caught in validation layer
   - Added to warnings list
   - Confidence score reduced

4. **File Errors** - File not found or unreadable
   - Caught in `process_batch()`
   - File skipped, counted as failed
   - Error logged

### Recovery Strategies

1. **Multiple Extraction Methods**
   - If lattice fails, try stream
   - If both fail, extract text
   - Continue with best available data

2. **Graceful Degradation**
   - Missing optional fields set to None
   - Processing continues
   - Warnings track issues

3. **Fallback Parsing**
   - If transposed parser fails, try standard parser
   - If table parsing fails, try text extraction
   - Worst case: extract from text with regex

## Extensibility

### Adding New Manufacturer Support

1. **Detection**
   - Add manufacturer name to parsing logic
   - Create specific model extraction pattern

2. **Table Format Support**
   - Detect format in `_parse_electrical_table()`
   - Add format-specific parser method
   - Return same data structure

3. **Custom Patterns**
   - Add dimension extraction regex
   - Add warranty extraction pattern
   - Add certification detection

### Adding New Table Formats

1. **Detection**
   - Add keyword pattern in table detection
   - Create format identifier

2. **Parser Implementation**
   - Create `_parse_<format>_table()` method
   - Extract power classes
   - Extract parameters
   - Return standard data structure

3. **Testing**
   - Test with sample datasheets
   - Verify output format
   - Add to documentation

## Performance Considerations

### Optimization Strategies

1. **Table Deduplication**
   - Prevents redundant processing
   - Reduces parsing overhead
   - Improves accuracy

2. **Lazy Evaluation**
   - Parse tables only when needed
   - Stop after finding electrical specs
   - Skip irrelevant tables

3. **Caching**
   - Cache extracted tables
   - Reuse for multiple parse attempts
   - Reduce file I/O

4. **Parallel Processing** (Future)
   - Process multiple PDFs in parallel
   - Use multiprocessing.Pool
   - Maintain thread safety

### Memory Management

- DataFrames created and destroyed per table
- No long-term memory accumulation
- Garbage collection after processing
- Large PDFs: Consider streaming

## Testing Strategy

### Unit Tests
- Test each parser method independently
- Mock table DataFrames
- Verify extracted values
- Test edge cases

### Integration Tests
- Test complete extraction workflow
- Use real datasheets
- Verify output format
- Check accuracy

### Performance Tests
- Measure processing time
- Test memory usage
- Batch processing throughput
- Large file handling

## Security Considerations

- No user input executed as code
- File paths validated before access
- No eval() or exec() usage
- Safe PDF processing (read-only)
- No network access required

## Future Enhancements

### Planned Improvements

1. **Machine Learning Integration**
   - Train models on extracted data
   - Auto-detect table formats
   - Improve accuracy

2. **Multi-language Support**
   - Parse non-English datasheets
   - Support multiple parameter naming conventions
   - Localized unit formats

3. **Image Extraction**
   - Extract data from images in PDFs
   - OCR integration
   - Chart interpretation

4. **Database Integration**
   - Direct database insertion
   - Schema validation
   - Conflict resolution

5. **Web Interface**
   - Upload PDFs via browser
   - View extraction results
   - Download in multiple formats

### Technical Debt

1. **Hard-coded Patterns**
   - Move to configuration files
   - Support runtime additions
   - Better maintainability

2. **Logging**
   - Structured logging (JSON)
   - Log levels standardization
   - Performance metrics

3. **Configuration**
   - Centralized config management
   - Environment variables
   - Per-manufacturer settings

4. **Error Handling**
   - Custom exception types
   - Better error context
   - Recovery suggestions

## References

- **Camelot Documentation**: https://camelot-py.readthedocs.io/
- **Pydantic Models**: https://docs.pydantic.dev/
- **Pandas DataFrame**: https://pandas.pydata.org/docs/
- **pdfplumber**: https://github.com/jsvine/pdfplumber

---

**Last Updated**: 2025-11-03
**Version**: 1.0
