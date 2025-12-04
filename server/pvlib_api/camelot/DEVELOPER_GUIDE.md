# Developer Guide

## Overview

This guide provides information for developers who want to understand, modify, or extend the PV Panel Datasheet Extraction utility.

## Development Setup

### Prerequisites
```bash
# Python 3.8+
python --version

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\\Scripts\\activate   # Windows

# Install dependencies
pip install -r requirements.txt
```

### Project Structure
```
camelot/
├── camelot_cli.py              # CLI entry point
├── camelot_extractor.py        # PDF extraction layer
├── camelot_processor.py        # Batch processing layer
├── simplified_parser.py        # Data parsing layer
├── models.py                   # Data models
├── debug_tables.py            # Debug utilities
├── run_batch.sh               # Batch processing script
├── process_batch.py           # Python batch processor
├── batch_config.json          # Configuration template
├── EXTRACTION_IMPROVEMENTS.md  # Technical improvements
├── README.md                  # Main documentation
├── ARCHITECTURE.md            # System architecture
├── API_REFERENCE.md           # API documentation
├── TROUBLESHOOTING.md         # Troubleshooting guide
└── DEVELOPER_GUIDE.md         # This file
```

## Development Workflow

### 1. Testing a New Datasheet

```bash
# Debug table structure
python debug_tables.py /path/to/new_datasheet.pdf

# Extract with specific manufacturer
python camelot_cli.py \
    --output ./test_results \
    file /path/to/new_datasheet.pdf \
    --manufacturer "NEW_MFR"

# Check results
cat test_results/camelot_extracted_data_*.json
```

### 2. Adding Support for New Manufacturer

#### Step 1: Analyze Datasheet Structure

```bash
python debug_tables.py datasheet.pdf
```

**Identify:**
- Table format (transposed, alternating row, unique)
- Model naming convention
- Parameter names (Voc, Isc, etc.)
- Dimension format
- Special characteristics

#### Step 2: Add Model Extraction Pattern

Edit `simplified_parser.py`:

```python
def _extract_model(self, text: str) -> str:
    # ... existing patterns ...

    # Add new manufacturer
    if 'NEW_MANUFACTURER' in text.upper():
        # Pattern for this manufacturer's model names
        match = re.search(r'(MODEL[_-]?PATTERN\\s*[A-Z0-9]+)', text)
        if match:
            return match.group(1).strip()

    # Generic fallback
    lines = text.split('\\n')
    for line in lines[:15]:
        match = re.search(r'([A-Z]{2,}[-_]?[A-Z0-9]{3,})', line)
        if match:
            model = match.group(1).strip()
            # Filter out common non-model strings
            if not any(word in model.upper() for word in [
                'WARRANTY', 'EFFICIENCY', 'TEMPERATURE', 'MODULE'
            ]):
                return model

    return "Unknown Model"
```

#### Step 3: Add Table Format Support

If the datasheet uses a unique table format:

```python
def _parse_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
    specs = {
        'max_power': None,
        'efficiency': None,
        'voc': None,
        'isc': None,
        'vmp': None,
        'imp': None
    }

    # Check for new format
    table_text = ' '.join(df.astype(str).values.flatten()).upper()

    if 'NEW_FORMAT_KEYWORD' in table_text:
        logger.info("Detected NEW_FORMAT table")
        return self._parse_new_format_electrical_table(df)

    # Try existing formats
    transposed_specs = self._parse_transposed_electrical_table(df)
    if transposed_specs['max_power']:
        return transposed_specs

    # ... rest of parsing logic ...
```

#### Step 4: Implement New Format Parser

```python
def _parse_new_format_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
    """
    Parse NEW_FORMAT electrical specifications.

    Expected format:
    - Row 1: Header row
    - Row 2: Power class values
    - Row 3+: Parameter name, value pairs
    """

    specs = {
        'max_power': None,
        'efficiency': None,
        'voc': None,
        'isc': None,
        'vmp': None,
        'imp': None
    }

    # Find power class row
    power_class_row = None
    for row_idx in range(min(3, len(df))):
        row_values = df.iloc[row_idx].astype(str).tolist()
        power_count = sum(1 for val in row_values
                          if self._extract_number(str(val)))
        if power_count >= 3:
            power_class_row = row_idx
            break

    if not power_class_row:
        logger.warning("Could not find power class row")
        return specs

    # Extract power classes
    power_classes = []
    row_values = df.iloc[power_class_row].astype(str).tolist()
    for val in row_values:
        power = self._extract_number(str(val))
        if power and 300 <= power <= 500:
            power_classes.append(power)

    if not power_classes:
        return specs

    max_power = max(power_classes)
    specs['max_power'] = max_power

    # Find column for max power
    max_power_col_idx = None
    for col_idx, val in enumerate(row_values):
        if self._extract_number(str(val)) == max_power:
            max_power_col_idx = col_idx
            break

    # Parse parameters
    for row_idx in range(len(df)):
        row_text = ' '.join(df.iloc[row_idx].astype(str)).upper()

        # Check for parameters (customize keywords for manufacturer)
        if 'PARAMETER_NAME' in row_text:
            # Get value from next row or same row
            if row_idx + 1 < len(df):
                value_row = df.iloc[row_idx + 1]
                if max_power_col_idx < len(value_row):
                    value = self._extract_number(str(value_row[max_power_col_idx]))
                    # Validate and assign
                    if 30 <= value <= 60:  # Example range for Voc
                        specs['voc'] = value

    return specs
```

#### Step 5: Add Dimension Extraction (if needed)

```python
def _extract_dimensions(self, text: str) -> Dict[str, Optional[float]]:
    dimensions = {'long_side': None, 'short_side': None}

    # Add pattern for new manufacturer
    patterns = [
        # Existing patterns...
        r'(\\d{4})\\s*mm\\s*[×x]\\s*(\\d{4})\\s*mm',           # Standard format
        r'L\\s*:\\s*(\\d{4})\\s*mm.*?W\\s*:\\s*(\\d{4})\\s*mm', # NEW_MFR format
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            long_side = float(match.group(1)) / 1000
            short_side = float(match.group(2)) / 1000
            dimensions['long_side'] = long_side
            dimensions['short_side'] = short_side
            break

    return dimensions
```

#### Step 6: Test and Validate

```bash
python camelot_cli.py \
    --output ./test \
    file /path/to/datasheet.pdf \
    --manufacturer "NEW_MFR"

# Verify extraction
cat test/camelot_extracted_data_*.json | jq '.[0].panel_data'
```

#### Step 7: Update Documentation

1. Update `README.md` with manufacturer in supported list
2. Add example in README.md
3. Update `API_REFERENCE.md` if new methods added
4. Add troubleshooting entry in `TROUBLESHOOTING.md`

---

## Code Style Guidelines

### Python Style

- Follow PEP 8
- Use type hints
- Maximum line length: 88 characters (Black formatter)
- Use f-strings for formatting

### Example:
```python
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

def parse_parameter(
    self,
    df: DataFrame,
    parameter_name: str,
    expected_range: tuple[float, float]
) -> Optional[float]:
    """Extract parameter value from table."""
    # Implementation
    pass
```

### Docstrings

Use Google-style docstrings:

```python
def extract_power(self, df: DataFrame) -> Optional[float]:
    """
    Extract maximum power from electrical characteristics table.

    Args:
        df: Pandas DataFrame containing the table

    Returns:
        Maximum power in watts, or None if not found

    Raises:
        ValueError: If power value is outside expected range
    """
    pass
```

### Logging

- Use appropriate log levels:
  - `DEBUG`: Detailed parsing steps
  - `INFO`: Normal processing milestones
  - `WARNING`: Recoverable issues
  - `ERROR`: Extraction failures

- Include context in log messages:
```python
logger.info(f"Found power classes: {power_classes}, using max: {max_power}W")
logger.warning(f"Could not find column for {max_power}W power class")
```

---

## Testing

### Unit Tests

Create test files for new functionality:

```python
# test_new_manufacturer.py
import pytest
from simplified_parser import SimplifiedParser

def test_new_manufacturer_model_extraction():
    """Test model extraction for NEW_MFR"""
    parser = SimplifiedParser("NEW_MFR")
    text = "PRODUCT MODEL-XYZ123 DATASHEET"
    model = parser._extract_model(text)
    assert model == "MODEL-XYZ123"

def test_new_format_table_parsing():
    """Test parsing of NEW_FORMAT tables"""
    # Create mock DataFrame
    # Test parsing logic
    pass
```

Run tests:
```bash
pytest test_new_manufacturer.py -v
```

### Integration Tests

Test with real datasheets:

```python
# integration_test.py
from camelot_processor import CamelotDatasheetProcessor
from models import ProcessingConfig
from pathlib import Path

def test_batch_processing():
    """Test batch processing with real datasheets"""
    config = ProcessingConfig(
        pdf_files=[
            {'file_path': 'test_datasheets/mfr1.pdf', 'manufacturer': 'MFR1'},
            {'file_path': 'test_datasheets/mfr2.pdf', 'manufacturer': 'MFR2'},
        ],
        output_dir=Path('./test_output')
    )

    processor = CamelotDatasheetProcessor(config)
    summary = processor.process_batch()

    assert summary['successful_extractions'] >= 1
    assert summary['failed_extractions'] >= 0
```

### Manual Testing Checklist

- [ ] Test with supported datasheets
- [ ] Test with edge cases (corrupted, password protected)
- [ ] Test batch processing
- [ ] Check output formats (JSON, CSV, Summary)
- [ ] Verify confidence scores
- [ ] Check logging output
- [ ] Test error handling

---

## Adding New Features

### Feature: Support for Temperature Coefficients

#### 1. Update Model

```python
# models.py
class PVPanelData(BaseModel):
    # ... existing fields ...
    tempCoeffPmax: Optional[float] = None
    tempCoeffIsc: Optional[float] = None
    tempCoeffVoc: Optional[float] = None
```

#### 2. Add Extraction Logic

```python
# simplified_parser.py
def _parse_transposed_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
    specs = {
        'max_power': None,
        'efficiency': None,
        'voc': None,
        'isc': None,
        'vmp': None,
        'imp': None,
        # Add new fields
        'temp_coeff_pmax': None,
        'temp_coeff_isc': None,
        'temp_coeff_voc': None,
    }

    # ... existing parsing logic ...

    # Add temperature coefficient extraction
    for row_idx in range(len(df)):
        row_text = ' '.join(df.iloc[row_idx].astype(str)).upper()

        # Temperature coefficient patterns
        if 'TEMPERATURE COEFFICIENT' in row_text and 'PMAX' in row_text:
            value = self._extract_number(str(df.iloc[row_idx, max_power_col_idx]))
            if value and -1 <= value <= 0:
                specs['temp_coeff_pmax'] = value

    return specs
```

#### 3. Update Output

```python
# camelot_processor.py
def save_results(self, output_dir: Path) -> Dict[str, Path]:
    # ... existing code ...

    # Temperature coefficients already included in panel_data.dict()
```

### Feature: Enhanced Dimension Extraction

#### 1. Add Support for Multiple Units

```python
def _extract_dimensions(self, text: str) -> Dict[str, Optional[float]]:
    """Extract panel dimensions with unit detection."""

    # Try mm (millimeters)
    match = re.search(r'(\\d{4})\\s*mm\\s*[×x]\\s*(\\d{4})\\s*mm', text)
    if match:
        return {
            'long_side': float(match.group(1)) / 1000,
            'short_side': float(match.group(2)) / 1000
        }

    # Try cm (centimeters)
    match = re.search(r'(\\d{3,4})\\s*cm\\s*[×x]\\s*(\\d{3,4})\\s*cm', text)
    if match:
        return {
            'long_side': float(match.group(1)) / 100,
            'short_side': float(match.group(2)) / 100
        }

    # Try inches
    match = re.search(r'(\\d{2}\\.\\d{1,2})\\s*in\\s*[×x]\\s*(\\d{2}\\.\\d{1,2})\\s*in', text)
    if match:
        return {
            'long_side': float(match.group(1)) * 0.0254,
            'short_side': float(match.group(2)) * 0.0254
        }

    return {'long_side': None, 'short_side': None}
```

#### 2. Add Comprehensive Patterns

```python
def _extract_dimensions(self, text: str) -> Dict[str, Optional[float]]:
    """Extract panel dimensions with multiple format support."""

    patterns = [
        # Standard formats
        (r'(\\d{4})\\s*mm\\s*[×x]\\s*(\\d{4})\\s*mm', 1000, 1000),
        (r'(\\d{2}\\.\\d{2})\\s*in\\s*[×x]\\s*(\\d{2}\\.\\d{2})\\s*in', 0.0254, 0.0254),

        # New manufacturer formats
        (r'L\\s*:\\s*(\\d{4})\\s*mm.*?W\\s*:\\s*(\\d{4})\\s*mm', 1000, 1000),
        (r'Length\\s*:\\s*(\\d{4})\\s*mm.*?Width\\s*:\\s*(\\d{4})\\s*mm', 1000, 1000),
    ]

    for pattern, long_mult, short_mult in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            long_side = float(match.group(1)) / long_mult
            short_side = float(match.group(2)) / short_mult
            return {'long_side': long_side, 'short_side': short_side}

    return {'long_side': None, 'short_side': None}
```

---

## Performance Optimization

### 1. Skip Irrelevant Tables

```python
def parse(self, tables: List[Dict[str, Any]], text: str) -> PVPanelData:
    """Parse with early table filtering."""

    # Filter tables before processing
    relevant_tables = []
    for table_info in tables:
        df = table_info['data']

        # Skip very large tables (likely mechanical drawings)
        if len(df) > 100 or len(df.columns) > 20:
            logger.debug(f"Skipping large table: {df.shape}")
            continue

        # Check for electrical content
        table_text = ' '.join(df.astype(str).values.flatten()).upper()
        if any(keyword in table_text for keyword in [
            'POWER', 'VOLTAGE', 'CURRENT', 'MPP', 'EFFICIENCY'
        ]):
            relevant_tables.append(table_info)

    # Process only relevant tables
    for table_info in relevant_tables:
        # ... parsing logic ...
```

### 2. Cache Extracted Data

```python
from functools import lru_cache

class SimplifiedParser:
    def __init__(self, manufacturer: str):
        self.manufacturer = manufacturer
        self._dimension_pattern_cache = None

    @property
    def dimension_patterns(self):
        """Cache dimension extraction patterns."""
        if self._dimension_pattern_cache is None:
            self._dimension_pattern_cache = [
                # Compile patterns once
                re.compile(r'(\\d{4})\\s*mm\\s*[×x]\\s*(\\d{4})\\s*mm'),
                # ... more patterns
            ]
        return self._dimension_pattern_cache
```

### 3. Parallel Processing

```python
# In camelot_processor.py
import concurrent.futures

def process_batch_parallel(self, max_workers: int = 4) -> Dict[str, Any]:
    """Process PDFs in parallel."""

    results = []
    errors = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_config = {
            executor.submit(self.process_single_pdf, pdf_config): pdf_config
            for pdf_config in self.config.pdf_files
        }

        for future in concurrent.futures.as_completed(future_to_config):
            result = future.result()
            if result:
                results.append(result)
            else:
                pdf_config = future_to_config[future]
                errors.append({
                    'file': pdf_config['file_path'],
                    'error': 'Processing failed'
                })

    # Aggregate results
    self.results = results
    self.errors = errors

    return self.generate_summary(len(results), len(errors))
```

---

## Debugging Tips

### 1. Visualize Table Structure

```python
# Quick debugging
def debug_table(df: DataFrame, table_num: int):
    print(f"\\n=== TABLE {table_num} ===")
    print(f"Shape: {df.shape}")
    print("\\nFirst 5 rows:")
    print(df.head().to_string())
    print("\\nColumn types:")
    print(df.dtypes)
```

### 2. Check Pattern Matching

```python
def test_patterns():
    """Test regex patterns on sample text."""
    test_text = "Sample datasheet text with POWER 405W"

    patterns = [
        (r'POWER\\s*(\\d+)', 'Power extraction'),
        (r'(\\d{3,4})\\s*mm', 'Dimension extraction'),
    ]

    for pattern, description in patterns:
        match = re.search(pattern, test_text, re.IGNORECASE)
        if match:
            print(f"{description}: {match.group()}")
```

### 3. Validate Extracted Data

```python
def validate_extraction(panel_data: PVPanelData):
    """Validate extracted data against expected ranges."""

    errors = []

    if panel_data.maxPower:
        if not (300 <= panel_data.maxPower <= 500):
            errors.append(f"Power {panel_data.maxPower} outside expected range")

    if panel_data.openCircuitVoltage:
        if not (30 <= panel_data.openCircuitVoltage <= 60):
            errors.append(f"Voc {panel_data.openCircuitVoltage} outside expected range")

    return errors
```

---

## Configuration Management

### Using Configuration Files

```python
# config.py
class Config:
    """Application configuration."""

    # Extraction settings
    MAX_TABLE_SIZE = 100
    MIN_POWER_VALUE = 300
    MAX_POWER_VALUE = 500

    # Performance settings
    MAX_WORKERS = 4
    TIMEOUT_SECONDS = 30

    # Supported manufacturers
    MANUFACTURER_PATTERNS = {
        'Q CELLS': r'Q\\.PEAK\\s+[A-Z0-9\\s.-]+',
        'HYPERION': r'HY-[A-Z0-9]+-[A-Z0-9/]+',
        # Add new manufacturers here
    }
```

### Environment Variables

```python
# Use environment variables for settings
import os

MAX_WORKERS = int(os.getenv('EXTRACTOR_MAX_WORKERS', '4'))
DEBUG_MODE = os.getenv('EXTRACTOR_DEBUG', 'false').lower() == 'true'
```

---

## Contributing Guidelines

### 1. Before Submitting Changes

- [ ] Code follows style guidelines
- [ ] Type hints added
- [ ] Docstrings updated
- [ ] Tests added/updated
- [ ] Tested with real datasheets
- [ ] Documentation updated
- [ ] Changelog updated

### 2. Commit Message Format

```
feat: Add support for NEW_MFR datasheets
fix: Fix dimension extraction for Q CELLS
docs: Update troubleshooting guide
test: Add unit tests for transposed table parser
refactor: Simplify table deduplication logic
```

### 3. Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes with tests
4. Run test suite: `pytest`
5. Submit pull request with:
   - Description of changes
   - Testing results
   - Sample datasheet for verification

---

## Best Practices

### 1. Defensive Programming

```python
def parse_parameter(self, value: str, expected_range: tuple) -> Optional[float]:
    """Parse parameter with validation."""
    try:
        num = self._extract_number(value)
        if num is None:
            return None

        # Validate range
        min_val, max_val = expected_range
        if not (min_val <= num <= max_val):
            logger.warning(f"Value {num} outside range {expected_range}")
            return None

        return num

    except (ValueError, TypeError, IndexError) as e:
        logger.error(f"Error parsing parameter: {e}")
        return None
```

### 2. Fail Gracefully

```python
def parse(self, tables: List[Dict[str, Any]], text: str) -> PVPanelData:
    """Parse with fallback mechanisms."""

    # Try table parsing
    for table_info in tables:
        try:
            df = table_info['data']
            specs = self._parse_electrical_table(df)
            if specs['max_power']:
                # Successfully extracted from table
                break
        except Exception as e:
            logger.warning(f"Failed to parse table: {e}")
            continue

    # Fallback to text parsing
    if not specs['max_power']:
        specs = self._extract_from_text_fallback(text)

    # Build panel data
    panel_data = PVPanelData(
        # ... with fallbacks ...
    )

    return panel_data
```

### 3. Clear Separation of Concerns

```python
# Good: Each class has clear responsibility
class CamelotExtractor:      # PDF → Tables
class SimplifiedParser:      # Tables → Structured Data
class Processor:             # Orchestration
class Models:                # Data validation

# Avoid: Monolithic class with mixed responsibilities
```

---

## Resources

### Documentation
- [README.md](README.md) - Main documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [API_REFERENCE.md](API_REFERENCE.md) - API documentation
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problem solving

### External Resources
- [Camelot Documentation](https://camelot-py.readthedocs.io/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Python re Module](https://docs.python.org/3/library/re.html)

### Tools
- [Black Code Formatter](https://black.readthedocs.io/)
- [pytest Testing Framework](https://pytest.org/)
- [mypy Type Checker](https://mypy.readthedocs.io/)

---

## Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   pip list --outdated
   pip install --upgrade package_name
   ```

2. **Review Logs**
   - Check for common error patterns
   - Identify new manufacturers
   - Monitor performance

3. **Test with New Datasheets**
   - Collect edge cases
   - Improve patterns
   - Update documentation

4. **Code Quality**
   ```bash
   black *.py              # Format code
   mypy *.py               # Type checking
   pytest                  # Run tests
   ```

### Version History

Document changes in CHANGELOG.md:

```markdown
# Changelog

## [1.0] - 2025-11-03

### Added
- Support for Q CELLS datasheets
- Support for Hyperion datasheets
- Transposed table parser
- Alternating row format parser
- Batch processing capabilities
- Debug utilities

### Changed
- Improved dimension extraction
- Enhanced model name parsing

### Fixed
- Electrical parameter extraction for NMOT tables
- Column detection for transposed tables
```

---

**Last Updated**: 2025-11-03
**Version**: 1.0
**Maintainer**: PV System Development Team
