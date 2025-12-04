# Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common issues with the PV Panel Datasheet Extraction utility.

## Quick Diagnosis

### Enable Debug Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Debug Table Structure
```bash
python debug_tables.py /path/to/problematic/datasheet.pdf
```

### Check Processing Summary
```bash
cat results/camelot_processing_summary_*.json
```

## Common Issues

---

## Issue 1: Missing Electrical Parameters

### Symptoms
```json
{
  "panel_data": {
    "maxPower": 405.0,
    "openCircuitVoltage": null,
    "shortCircuitCurrent": null,
    "voltageAtPmax": null,
    "currentAtPmax": null
  }
}
```

### Possible Causes

#### Cause A: Unsupported Table Format

**Diagnosis:**
```bash
python debug_tables.py datasheet.pdf
```

Check if table contains "ELECTRICAL CHARACTERISTICS" but parameters show as null.

**Solution:**
1. Identify the table format (transposed, alternating row, or unique)
2. Add format detection in `simplified_parser.py`
3. Implement `_parse_<format>_table()` method

**Example Fix for New Format:**
```python
def _parse_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
    # Check for new format identifier
    table_text = ' '.join(df.astype(str).values.flatten()).upper()

    if 'NEW_FORMAT_KEYWORD' in table_text:
        # Custom parsing logic for new format
        return self._parse_new_format_table(df)

    # Fall back to existing parsers
    return self._parse_transposed_electrical_table(df)
```

---

#### Cause B: Incorrect Column Detection

**Diagnosis:**
Check logs for:
```
WARNING - Could not find column for 405.0W power class
```

**Solution:**
The parser can't locate the column containing the max power value.

**Debug Steps:**
1. Check if power class values are in expected rows (0-2)
2. Verify power range (300-500W)
3. Ensure unique column identification

**Fix:**
```python
# In _parse_transposed_electrical_table()
for row_idx in range(min(5, len(df))):  # Check first 5 rows
    row_values = df.iloc[row_idx].astype(str).tolist()
    row_powers = [self._extract_number(str(val)) for val in row_values
                  if self._extract_number(str(val))]
    if len(row_powers) >= 3:  # Found power class row
        # ... use this row
```

---

#### Cause C: Parameter Name Mismatch

**Diagnosis:**
Logs show:
```
INFO - Found power classes: [380.0, 385.0, 390.0, 395.0, 400.0, 405.0]
```

But no parameter extractions logged.

**Solution:**
Check if parameter names in table match expected patterns.

**Add New Pattern:**
```python
# In _parse_transposed_electrical_table()
elif any(keyword in combined_text for keyword in [
    'SHORT CIRCUIT CURRENT', 'ISC', 'PARAMETER_NAME_HERE'
]):
    if 5 <= value_at_max_power <= 15:
        specs['isc'] = value_at_max_power
        logger.info(f"Found Isc: {value_at_max_power}A from transposed table")
```

---

## Issue 2: Incorrect Model Name

### Symptoms
```json
{
  "panel_data": {
    "model": "Unknown Model"
  }
}
```

### Possible Causes

#### Cause A: Manufacturer Not Supported

**Diagnosis:**
Check if manufacturer name appears in text:
```bash
python debug_tables.py datasheet.pdf | grep -i "manufacturer"
```

**Solution:**
Add manufacturer-specific pattern in `_extract_model()`:

```python
def _extract_model(self, text: str) -> str:
    if 'NEW_MANUFACTURER' in text.upper():
        match = re.search(r'(MODEL_PATTERN\\s+[A-Z0-9]+)', text)
        if match:
            return match.group(1).strip()
```

**Example for Generic Manufacturer:**
```python
if 'GENERIC' in text.upper():
    # Look for pattern like "MODEL-XYZ123"
    match = re.search(r'([A-Z]{2,}-\\w{3,})', text)
    if match:
        return match.group(1).strip()
```

---

#### Cause B: Model Name in Different Location

**Diagnosis:**
Model name might be in page header, footer, or different section.

**Solution:**
Search broader text content or add location-specific extraction:

```python
def _extract_model(self, text: str) -> str:
    lines = text.split('\\n')

    # Check more lines
    for line in lines[:30]:  # Was checking first 10
        # Check for model patterns
        match = re.search(r'(MODEL[_-]?\\w+)', line, re.IGNORECASE)
        if match:
            return match.group(1).strip()

    # Try alternative patterns
    patterns = [
        r'(P/N\\s*:\\s*\\w+)',
        r'(CATALOG\\s*:\\s*\\w+)',
        r'(ITEM\\s*:\\s*\\w+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()

    return "Unknown Model"
```

---

## Issue 3: Wrong Power Rating

### Symptoms
Extracting 313.9W (NMOT) instead of 415W (STC), or vice versa.

### Possible Causes

#### Cause A: Wrong Table Selection

**Diagnosis:**
Check if multiple electrical specification tables exist.

**Solution:**
Prefer STC over NMOT tables:

```python
def _parse_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
    table_text = ' '.join(df.astype(str).values.flatten()).upper()

    # Check conditions
    if 'NMOT' in table_text or 'NORMAL OPERATING CONDITIONS' in table_text:
        logger.info("Found NMOT table, looking for STC instead")
        # Skip NMOT table, return empty to try next table
        return {'max_power': None}

    if 'STC' in table_text or 'STANDARD TEST CONDITIONS' in table_text:
        logger.info("Found STC table, using this one")
        return self._parse_transposed_electrical_table(df)
```

---

#### Cause B: Selecting Wrong Power Class

**Diagnosis:**
Log shows:
```
Found power classes: [380.0, 385.0, 390.0, 395.0, 400.0, 405.0]
Found power classes: [313.9, 310.2, 306.4, 302.5]  # NMOT values
```

**Solution:**
Filter out NMOT power values (typically 70-80% of STC):

```python
# In _parse_transposed_electrical_table()
power_classes = []
for val in row_values:
    power = self._extract_number(str(val))
    if power and 300 <= power <= 500:
        # Filter out NMOT values (typically much lower)
        # STC values should be close to each other
        if power < 350:  # Likely NMOT, skip
            continue
        power_classes.append(power)
```

---

## Issue 4: Dimension Extraction Failure

### Symptoms
```json
{
  "panel_data": {
    "longSide": null,
    "shortSide": null
  }
}
```

### Possible Causes

#### Cause A: Different Dimension Format

**Diagnosis:**
Check what formats are used in datasheet:
```bash
python debug_tables.py datasheet.pdf | grep -i "dimension\|mm\|inch"
```

**Solution:**
Add new regex patterns in `_extract_dimensions()`:

```python
def _extract_dimensions(self, text: str) -> Dict[str, Optional[float]]:
    # Existing patterns
    patterns = [
        r'(\\d{4})\\s*[×x]\\s*(\\d{4})\\s*mm',           # 2015 mm × 1000 mm
        r'(\\d{2}\\.\\d{2})\\s*in\\s*[×x]\\s*(\\d{2}\\.\\d{2})\\s*in',  # 79.3 in × 39.4 in
        r'(\\d{3,4})\\s*mm\\s*[×x]\\s*(\\d{3,4})\\s*mm', # 1722 × 1134 mm
        # Add new pattern here
        r'L\\s*:\\s*(\\d{4})\\s*mm.*?W\\s*:\\s*(\\d{4})\\s*mm', # L: 2015mm W: 1000mm
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            long_side = float(match.group(1)) / 1000  # Convert to meters
            short_side = float(match.group(2)) / 1000
            return {'long_side': long_side, 'short_side': short_side}

    return {'long_side': None, 'short_side': None}
```

---

#### Cause B: Units Not in mm

**Diagnosis:**
Dimensions might be in cm, m, or inches.

**Solution:**
```python
def _extract_dimensions(self, text: str) -> Dict[str, Optional[float]]:
    # Check for cm
    match = re.search(r'(\\d{4})\\s*cm\\s*[×x]\\s*(\\d{4})\\s*cm', text)
    if match:
        long_side = float(match.group(1)) / 100  # cm to m
        short_side = float(match.group(2)) / 100
        return {'long_side': long_side, 'short_side': short_side}

    # Check for meters
    match = re.search(r'(\\d\\.\\d{2,})\\s*m\\s*[×x]\\s*(\\d\\.\\d{2,})\\s*m', text)
    if match:
        long_side = float(match.group(1))
        short_side = float(match.group(2))
        return {'long_side': long_side, 'short_side': short_side}
```

---

## Issue 5: Low Confidence Scores

### Symptoms
```json
{
  "confidence_scores": {
    "maxPower": 0.5,  # Should be > 0.9
    "efficiency": 0.3  # Should be > 0.9
  }
}
```

### Possible Causes

#### Cause A: Missing or Incomplete Data

**Diagnosis:**
Check `warnings` and `errors` fields in result:
```json
{
  "warnings": ["Manufacturer could not be identified"],
  "errors": ["Model could not be identified"]
}
```

**Solution:**
Address underlying extraction issues (see Issues 1-4)

---

#### Cause B: Validation Failures

**Diagnosis:**
Values outside expected ranges trigger warnings:
```json
{
  "warnings": ["Power value 600W outside expected range 300-500W"]
}
```

**Solution:**
If value is actually correct, adjust validation ranges in parser:

```python
# In _extract_number() validation
if value and 300 <= value <= 600:  # Extended upper limit
    specs['max_power'] = value
```

---

## Issue 6: File Processing Failures

### Symptoms
```
ERROR - File not found: datasheet.pdf
ERROR - Failed to process datasheet.pdf: <error message>
```

### Possible Causes

#### Cause A: File Not Found

**Diagnosis:**
```bash
ls -la /path/to/datasheet.pdf
```

**Solution:**
- Check file path is correct
- Check file permissions
- Check file exists

---

#### Cause B: Corrupted PDF

**Diagnosis:**
```
ERROR - Camelot extraction failed: <pdfminer error>
```

**Solution:**
1. Try opening PDF in viewer
2. Try pdfplumber extraction separately:
```python
import pdfplumber
with pdfplumber.open('datasheet.pdf') as pdf:
    print(f"Pages: {len(pdf.pages)}")
```

3. If PDF is corrupted, use OCR or manual extraction

---

#### Cause C: Password Protected PDF

**Diagnosis:**
```
ERROR - Camelot extraction failed: Empty PDF
```

**Solution:**
PDFs with security restrictions cannot be processed. Need unencrypted version.

---

## Issue 7: Memory Issues

### Symptoms
```
MemoryError: Unable to allocate array
```

### Possible Causes

#### Cause A: Large PDF with Many Pages

**Diagnosis:**
```python
import pdfplumber
with pdfplumber.open('datasheet.pdf') as pdf:
    print(f"Pages: {len(pdf.pages)}")
    for page_num, page in enumerate(pdf.pages[:5]):  # First 5 pages
        print(f"Page {page_num}: {len(page.extract_words())} words")
```

**Solution:**
Process only relevant pages:
```python
# In camelot_extractor.py
tables = camelot.read_pdf(
    str(self.pdf_path),
    pages='1,2',  # Only first 2 pages
    flavor='lattice',
    suppress_stdout=True
)
```

---

#### Cause B: Tables Too Large

**Diagnosis:**
Check table dimensions:
```python
# In debug output
Table 1 - Shape: 1000 rows x 50 columns
```

**Solution:**
Limit table size or skip large tables:
```python
# In simplified_parser.py
def _parse_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
    if len(df) > 100:  # Skip very large tables
        logger.warning("Table too large, skipping")
        return specs
```

---

## Issue 8: Slow Processing

### Symptoms
- Processing time > 30 seconds per PDF
- Batch processing very slow

### Possible Causes

#### Cause A: Too Many Tables

**Diagnosis:**
```bash
python debug_tables.py datasheet.pdf | grep "TABLE.*Shape"
```

**Solution:**
Skip irrelevant tables:
```python
def _parse_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
    # Skip tables that are clearly not specs
    if len(df) > 50 or len(df.columns) > 20:
        # Likely mechanical drawings, skip
        return specs

    # Check for electrical content
    table_text = ' '.join(df.astype(str).values.flatten()).upper()
    if not any(keyword in table_text for keyword in [
        'POWER', 'VOLTAGE', 'CURRENT', 'EFFICIENCY'
    ]):
        return specs
```

---

#### Cause B: Inefficient Deduplication

**Diagnosis:**
Check deduplication logs:
```
Deduplicated 50 tables to 30 unique tables
```

**Solution:**
Improve deduplication thresholds:
```python
def _deduplicate_tables(self, tables: List) -> List:
    unique = [tables[0]]
    for table in tables[1:]:
        is_duplicate = False
        # Skip comparison if tables are very different size
        if abs(table.df.shape[0] - unique_table.df.shape[0]) > 10:
            continue
        # ... rest of logic
```

---

## Performance Tuning

### Batch Processing Optimization

```python
# In camelot_processor.py
import concurrent.futures

def process_batch_parallel(self) -> Dict[str, Any]:
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(self.process_single_pdf, pdf_config): pdf_config
            for pdf_config in self.config.pdf_files
        }

        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            # Process results
```

---

### Memory Optimization

```python
# Process tables one at a time, don't keep all in memory
for table_info in tables:
    df = table_info['data']
    # Process immediately
    specs = self._parse_electrical_table(df)
    # Don't store df after processing
```

---

## Getting Help

### Information to Collect

When reporting issues, provide:

1. **Command used:**
   ```bash
   python camelot_cli.py --output ./results file datasheet.pdf --manufacturer "X"
   ```

2. **Debug output:**
   ```bash
   python debug_tables.py datasheet.pdf > debug_output.txt
   ```

3. **Processing summary:**
   ```bash
   cat results/camelot_processing_summary_*.json
   ```

4. **First 50 lines of debug log:**
   ```bash
   python camelot_cli.py ... 2>&1 | head -50
   ```

5. **PDF info:**
   ```bash
   pdfinfo datasheet.pdf
   ```

### Self-Help Steps

1. ✅ Enable debug logging
2. ✅ Run debug_tables.py
3. ✅ Check processing summary
4. ✅ Review logs for warnings/errors
5. ✅ Identify table format
6. ✅ Check if manufacturer is supported
7. ✅ Compare with working datasheet
8. ✅ Create minimal test case

### Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| Missing parameters | Check table format with debug_tables.py |
| Unknown model | Add manufacturer pattern in _extract_model() |
| Wrong power rating | Filter NMOT, prefer STC |
| Missing dimensions | Add regex pattern for dimension format |
| Low confidence | Address underlying extraction warnings |
| File not found | Verify file path and permissions |
| Slow processing | Skip irrelevant tables, parallel processing |
| Memory error | Limit pages, process tables individually |

---

## Example: Adding Support for New Manufacturer

### Step-by-Step Example

1. **Debug the datasheet:**
   ```bash
   python debug_tables.py new_manufacturer_datasheet.pdf
   ```

2. **Identify unique characteristics:**
   - Table format (transposed/alternating/unique)
   - Model name pattern
   - Dimension format
   - Parameter naming conventions

3. **Add model extraction:**
   ```python
   # In simplified_parser.py _extract_model()
   if 'NEW_MFR' in text.upper():
       match = re.search(r'(NEW[_-]?\\w{3,})', text)
       if match:
           return match.group(1).strip()
   ```

4. **Add table format support:**
   ```python
   # In _parse_electrical_table()
   if 'NEW_FORMAT_IDENTIFIER' in table_text:
       return self._parse_new_format_table(df)
   ```

5. **Implement new format parser:**
   ```python
   def _parse_new_format_table(self, df: DataFrame) -> Dict[str, Any]:
       # Custom parsing logic
       specs = {...}
       return specs
   ```

6. **Test:**
   ```bash
   python camelot_cli.py --output ./test file new_manufacturer_datasheet.pdf --manufacturer "NEW_MFR"
   ```

7. **Verify output:**
   ```bash
   cat test/camelot_extracted_data_*.json
   ```

8. **Document:**
   Add to README.md and this troubleshooting guide

---

## FAQ

**Q: Can I process password-protected PDFs?**
A: No, the utility cannot process encrypted PDFs. Use an unencrypted version.

**Q: Does it work with scanned PDFs?**
A: Only if the PDF contains actual text (not images). For scanned documents, use OCR first.

**Q: What's the maximum file size supported?**
A: No hard limit, but files >100MB may cause memory issues. Process large files page by page.

**Q: Can I add custom validation rules?**
A: Yes, modify the validation logic in parser methods. Add checks in `_parse_*()` methods.

**Q: How accurate is the extraction?**
A: >95% accuracy for supported manufacturers and table formats. Unknown formats may have lower accuracy.

**Q: Can I use this for inverters or other equipment?**
A: The utility is designed for PV panels. Extending to other equipment would require new parsers and models.

---

**Last Updated**: 2025-11-03
**Version**: 1.0
