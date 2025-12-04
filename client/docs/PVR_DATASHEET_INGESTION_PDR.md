# Product Design Document: Solar PV Panel Datasheet Ingestion Utility

**Version:** 1.0
**Date:** 2025-11-03
**Status:** Draft
**Author:** System Architecture Team

---

## 1. Executive Summary

### 1.1 Purpose
This document outlines the design for a utility system that automatically scrapes, extracts, and transforms manufacturer datasheets for solar PV panels from PDF format into structured database records. The system will handle diverse datasheet formats from multiple manufacturers and extract technical specifications for integration with the existing solar PV project management platform.

### 1.2 Scope
- **In Scope:**
  - PDF datasheet parsing and text extraction
  - AI-powered technical parameter identification and extraction
  - Data validation and normalization
  - Database integration with existing PVPanel model
  - Batch processing capabilities
  - Error handling and reporting
  - Web-based interface for manual review and correction

- **Out of Scope:**
  - Processing non-PDF formats (Word, Excel, etc.)
  - OCR for scanned/poor quality PDFs
  - Historical backfill of existing database records
  - Integration with external datasheet repositories

### 1.3 Benefits
- **Efficiency:** Automate manual data entry of PV panel specifications
- **Accuracy:** Reduce human error in parameter transcription
- **Scalability:** Process large volumes of datasheets rapidly
- **Consistency:** Standardize data format across all manufacturers
- **Extensibility:** Support for new parameters and manufacturers over time
- **Cost Reduction:** Minimize manual labor for equipment database maintenance

---

## 2. Problem Statement

### 2.1 Current Challenges
1. **Manual Data Entry:** PV panel specifications are manually entered by users, leading to:
   - Time-consuming data entry processes
   - Inconsistent data quality and formatting
   - High likelihood of transcription errors
   - Difficulty maintaining up-to-date equipment database

2. **Format Variability:** Manufacturer datasheets vary significantly in:
   - Layout and structure
   - Terminology and parameter naming
   - Unit conventions (W, kW, %)
   - Specification presentation order
   - Image vs. text-based data

3. **Data Validation:** Lack of automated validation results in:
   - Invalid or inconsistent values entering the system
   - Difficulty identifying missing or anomalous parameters
   - Lack of audit trail for data sources

### 2.2 Target Users
- **Primary Users:** System administrators, database maintainers
- **Secondary Users:** Solar project designers, equipment procurement teams
- **Beneficiaries:** End users of the solar PV platform accessing equipment data

---

## 3. Requirements

### 3.1 Functional Requirements

#### FR-1: PDF Processing
- The system shall accept PDF datasheets as input
- The system shall extract text content from PDFs using multiple extraction methods (pdfplumber, PyPDF2, Tesseract if needed)
- The system shall identify and extract data from tables, text blocks, and diagrams
- The system shall handle multi-page datasheets

#### FR-2: Data Extraction
- The system shall use AI/NLP techniques to identify technical parameters:
  - Core parameters: maxPower, efficiency, openCircuitVoltage, shortCircuitCurrent, voltageAtPmax, currentAtPmax
  - Thermal coefficients: tempCoeffPmax, tempCoeffIsc, tempCoeffVoc, tempCoeffIpmax, tempCoeffVpmax
  - Physical specifications: shortSide, longSide, weight
  - Warranty information: performanceWarranty, productWarranty
  - Certifications: certification
  - Metadata: maker, model
  - Additional: moduleType, maxSeriesFuseRating

#### FR-3: Data Transformation
- The system shall normalize extracted values to database schema units
- The system shall handle unit conversions (W ↔ kW, mm ↔ m, °C temperature references)
- The system shall clean and standardize text values (manufacturer names, model numbers)

#### FR-4: Validation
- The system shall validate extracted values against expected ranges for each parameter
- The system shall detect and flag anomalous values for review
- The system shall verify mandatory fields are populated

#### FR-5: Database Integration
- The system shall insert validated data into the existing PVPanel model
- The system shall check for existing records (maker + model uniqueness)
- The system shall support both create and update operations
- The system shall maintain audit trail of data source and extraction date

#### FR-6: Batch Processing
- The system shall support processing multiple PDFs in batch mode
- The system shall provide progress tracking and status reporting
- The system shall allow concurrent processing with rate limiting

#### FR-7: Manual Review Interface
- The system shall provide a web interface for reviewing extracted data
- The system shall allow manual correction of extracted parameters
- The system shall support approval/rejection workflow

### 3.2 Non-Functional Requirements

#### NFR-1: Performance
- Process single datasheet: < 30 seconds
- Batch processing: 100 datasheets/hour minimum
- Database write operations: < 2 seconds per record

#### NFR-2: Accuracy
- Parameter extraction accuracy: > 90% for core parameters
- False positive rate: < 5%
- Manual review required: < 20% of records

#### NFR-3: Scalability
- Support up to 10,000 datasheets in queue
- Horizontal scaling for processing workers
- Efficient storage for temporary files and extracted data

#### NFR-4: Reliability
- 99% uptime for processing service
- Automatic retry for transient failures
- Comprehensive error logging and alerting

#### NFR-5: Security
- Input validation and sanitization
- Secure file upload handling
- Audit logging for all operations
- No execution of embedded scripts in PDFs

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Interface                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Web Dashboard  │  │   File Upload   │  │   Review UI  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  - Request routing                                           │
│  - Authentication & Authorization                            │
│  - Rate limiting                                             │
│  - Request validation                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Processing Orchestrator                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ File Manager │  │ Queue Mgmt   │  │   Worker Scheduler │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Worker Nodes (Scalable)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  PDF Text Extraction Module                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐  │ │
│  │  │ pdfplumber   │ │   PyPDF2     │ │   Tesseract     │  │ │
│  │  └──────────────┘ └──────────────┘ └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  AI/NLP Extraction Engine                               │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐  │ │
│  │  │ Pattern Match│ │ Entity Recog │ │ Table Parsing   │  │ │
│  │  └──────────────┘ └──────────────┘ └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Validation & Transformation                            │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌─────────────────┐  │ │
│  │  │ Range Check  │ │ Unit Convert │ │ Normalize       │  │ │
│  │  └──────────────┘ └──────────────┘ └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database & Storage                          │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  PostgreSQL      │  │   Redis      │  │  File Storage  │ │
│  │  (Panel Data)    │  │  (Queue/Cache│  │  (PDF Archive) │ │
│  └──────────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Component Details

#### 4.2.1 Client Interface
**Technology:** React + TypeScript (align with existing client)

**Components:**
- **Upload Dashboard:** Drag-and-drop interface for batch PDF uploads
- **Processing Monitor:** Real-time status of extraction jobs
- **Review Interface:** Side-by-side view of PDF and extracted data with edit capabilities
- **Reports Dashboard:** Extraction statistics, accuracy metrics, error reports

#### 4.2.2 API Gateway
**Technology:** Express.js (align with existing server)

**Endpoints:**
```
POST   /api/datasheets/upload          # Upload PDFs
GET    /api/datasheets                 # List processing jobs
GET    /api/datasheets/:id             # Get job status
GET    /api/datasheets/:id/review      # Get extracted data for review
PUT    /api/datasheets/:id/review      # Submit manual corrections
POST   /api/datasheets/:id/approve     # Approve and save to database
GET    /api/datasheets/reports/metrics # Get extraction metrics
```

#### 4.2.3 Processing Orchestrator
**Technology:** Node.js + Bull Queue (Redis-backed job queue)

**Responsibilities:**
- Coordinate PDF file uploads and storage
- Manage job queues and worker distribution
- Track processing status and progress
- Handle retry logic and failure recovery
- Generate processing reports

#### 4.2.4 Worker Nodes
**Technology:** Python workers (for AI/NLP libraries)

**Extraction Pipeline:**

```
Step 1: Text Extraction
{
  "input": "PDF file path",
  "output": {
    "full_text": "Complete extracted text",
    "pages": ["Page 1 text", "Page 2 text", ...],
    "tables": ["Table 1 data", "Table 2 data", ...],
    "metadata": {"page_count", "has_images", "text_density"}
  }
}

Step 2: AI Parameter Extraction
{
  "input": "Extracted text and tables",
  "output": {
    "parameters": {
      "maker": "Q CELLS",
      "model": "Q.PEAK DUO L-G5.2 395",
      "maxPower": 395,
      "efficiency": 19.9,
      "openCircuitVoltage": 48.9,
      "shortCircuitCurrent": 10.21,
      "voltageAtPmax": 39.98,
      "currentAtPmax": 9.89,
      "tempCoeffPmax": -0.37,
      ...
    },
    "confidence_scores": {
      "maxPower": 0.95,
      "efficiency": 0.92,
      ...
    },
    "extraction_notes": ["Parameter found in table on page 2"]
  }
}

Step 3: Validation & Transformation
{
  "input": "Extracted parameters",
  "output": {
    "validated_parameters": { ... },
    "validation_results": {
      "valid": true,
      "warnings": [],
      "errors": [],
      "missing_required": []
    }
  }
}
```

---

## 5. Data Extraction Strategy

### 5.1 Multi-Method Extraction Approach

#### Method 1: Pattern Matching (Rule-Based)
- **Purpose:** Extract parameters with consistent formatting
- **Approach:** Regular expressions for known patterns
- **Examples:**
  - Power: `(\d+(?:\.\d+)?)\s*W\b` → `maxPower`
  - Voltage: `Voc\s*[=:]\s*(\d+(?:\.\d+)?)\s*V` → `openCircuitVoltage`
  - Temperature coefficient: `γ\s*\(Pmax\)\s*[=:]\s*(-?\d+(?:\.\d+)?)\s*%/K` → `tempCoeffPmax`

**Advantages:**
- Fast and deterministic
- High accuracy for well-structured datasheets
- Low computational overhead

**Limitations:**
- Fragile to format changes
- Requires maintenance for new patterns

#### Method 2: Entity Recognition (AI/NLP)
- **Purpose:** Extract parameters from natural language text
- **Approach:** Named Entity Recognition (NER) models
- **Technology:** spaCy with custom training data
- **Implementation:**
  - Train NER model on labeled datasheet text
  - Identify entities: `Power`, `Voltage`, `Current`, `Efficiency`, etc.
  - Extract associated values using dependency parsing

**Training Data Requirements:**
- Minimum 500 labeled datasheets
- Diverse manufacturers and formats
- Annotations for all target parameters

**Advantages:**
- Robust to format variations
- Can handle unexpected layouts
- Improves with more training data

#### Method 3: Table Parsing
- **Purpose:** Extract technical specification tables
- **Approach:** Structured table detection and parsing
- **Technology:** pdfplumber + custom heuristics
- **Process:**
  1. Detect table regions using layout analysis
  2. Extract table structure (headers, rows, columns)
  3. Map columns to parameter names using fuzzy matching
  4. Parse cell values with unit recognition

**Advantages:**
- High accuracy for tabular data
- Maintains parameter relationships
- Reduces false positives

#### Method 4: Multi-Method Fusion
- **Purpose:** Combine results from all methods for highest accuracy
- **Approach:** Confidence-weighted voting system
- **Algorithm:**
  1. Run all extraction methods in parallel
  2. For each parameter, collect candidate values
  3. Calculate confidence scores for each candidate
  4. Select candidate with highest confidence score
  5. Flag conflicts for manual review

### 5.2 Parameter Mapping Strategy

#### Primary Identification Patterns

| Parameter | Patterns | Fallback Patterns |
|-----------|----------|-------------------|
| **maxPower** | `Pmax`, `Rated Power`, `Maximum Power` | `\b(\d{3,4})\s*W\b` (largest W value) |
| **efficiency** | `Module Efficiency`, `Efficiency` | `η\s*[=:]\s*(\d+\.?\d*)\s*%` |
| **openCircuitVoltage** | `Voc`, `Open Circuit Voltage` | `Uoc\s*[=:]\s*(\d+\.?\d*)\s*V` |
| **shortCircuitCurrent** | `Isc`, `Short Circuit Current` | `Isc\s*[=:]\s*(\d+\.?\d*)\s*A` |
| **voltageAtPmax** | `Vmp`, `Maximum Power Voltage` | `Umpp\s*[=:]\s*(\d+\.?\d*)\s*V` |
| **currentAtPmax** | `Imp`, `Maximum Power Current` | `Impp\s*[=:]\s*(\d+\.?\d*)\s*A` |
| **tempCoeffPmax** | `γ(Pmax)`, `Temp Coeff of Pmax` | `-?\d+\.?\d*\s*%/K` (near Pmax) |
| **maker** | Header/footer manufacturer name | Brand logo detection |
| **model** | Model number (near manufacturer) | Part number patterns |

#### Unit Normalization Rules

```
Power: kW → W (multiply by 1000)
Efficiency: % → decimal (divide by 100)
Voltage: Already in V (no conversion)
Current: Already in A (no conversion)
Temperature: Already in %/K (no conversion)
Dimensions: mm → m (divide by 1000)
Weight: kg (already correct)
```

### 5.3 Validation Rules

#### Range Validation
```typescript
const parameterRanges = {
  maxPower: { min: 100, max: 700, unit: 'W' },
  efficiency: { min: 10, max: 25, unit: '%' },
  openCircuitVoltage: { min: 10, max: 100, unit: 'V' },
  shortCircuitCurrent: { min: 1, max: 20, unit: 'A' },
  voltageAtPmax: { min: 10, max: 90, unit: 'V' },
  currentAtPmax: { min: 1, max: 18, unit: 'A' },
  tempCoeffPmax: { min: -1, max: 0, unit: '%/K' },
  weight: { min: 10, max: 40, unit: 'kg' },
  shortSide: { min: 0.5, max: 2.5, unit: 'm' },
  longSide: { min: 1.0, max: 4.0, unit: 'm' }
};
```

#### Cross-Parameter Validation
- `maxPower ≈ voltageAtPmax × currentAtPmax` (within 5% tolerance)
- `efficiency ≤ 25%` (theoretical limit for silicon cells)
- `openCircuitVoltage > voltageAtPmax` (must be true)
- `shortCircuitCurrent > currentAtPmax` (must be true)
- `shortSide < longSide` (physical constraint)

#### Warning Conditions
- Efficiency > 23% (suspiciously high, may be n-type)
- Power > 600W (newer high-power modules)
- Missing thermal coefficients
- Inconsistent parameter relationships

---

## 6. Technical Implementation

### 6.1 Technology Stack

#### Backend Services
- **API Server:** Express.js + TypeScript (existing stack)
- **Job Queue:** Bull Queue (Redis-based)
- **Database:** PostgreSQL (existing stack)
- **Cache:** Redis (existing stack)
- **File Storage:** Local filesystem or S3-compatible storage
- **Monitoring:** Winston logging + Prometheus metrics

#### Worker Services
- **Runtime:** Python 3.11+
- **PDF Processing:** pdfplumber, PyPDF2, pymupdf
- **AI/NLP:** spaCy, scikit-learn, transformers
- **Data Processing:** pandas, numpy
- **Communication:** gRPC or REST API

#### Client Application
- **Framework:** React + TypeScript + Next.js 15 (existing stack)
- **UI Components:** Tailwind CSS + shadcn/ui (existing stack)
- **State Management:** Zustand (existing stack)
- **File Upload:** react-dropzone
- **Table Display:** Existing DataTable component

### 6.2 Database Schema

#### New Tables

```sql
-- Datasheet ingestion tracking
CREATE TABLE datasheet_ingestion (
  id SERIAL PRIMARY KEY,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  manufacturer VARCHAR(100),
  file_hash VARCHAR(64) UNIQUE,
  upload_date TIMESTAMP DEFAULT NOW(),
  processing_status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, review_required
  extracted_data JSONB,
  validation_results JSONB,
  confidence_score FLOAT,
  review_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, needs_review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Extraction metrics for analytics
CREATE TABLE extraction_metrics (
  id SERIAL PRIMARY KEY,
  ingestion_id INT REFERENCES datasheet_ingestion(id),
  parameter_name VARCHAR(50),
  extracted_value TEXT,
  confidence_score FLOAT,
  extraction_method VARCHAR(50), -- pattern_matching, entity_recognition, table_parsing
  is_valid BOOLEAN,
  validation_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Manufacturer-specific extraction patterns
CREATE TABLE manufacturer_patterns (
  id SERIAL PRIMARY KEY,
  manufacturer VARCHAR(100),
  parameter_name VARCHAR(50),
  regex_pattern TEXT,
  priority INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Processing queue (uses Bull Queue backend)
-- Managed by Redis, not stored in PostgreSQL
```

#### Modifications to Existing PVPanel Table
```sql
ALTER TABLE pv_panel
ADD COLUMN datasheet_source VARCHAR(500),
ADD COLUMN datasheet_hash VARCHAR(64),
ADD COLUMN extraction_date TIMESTAMP,
ADD COLUMN extraction_confidence FLOAT,
ADD COLUMN last_validated_at TIMESTAMP;

-- Add index for duplicate detection
CREATE UNIQUE INDEX idx_pv_panel_maker_model_hash
  ON pv_panel (maker, model)
  WHERE datasheet_hash IS NULL; -- Allow updates from datasheet
```

### 6.3 API Specifications

#### Upload Endpoint
```typescript
POST /api/datasheets/upload
Content-Type: multipart/form-data

Request:
{
  files: File[] // Multiple PDF files
  priority?: 'low' | 'normal' | 'high'
  skip_validation?: boolean
}

Response:
{
  success: true,
  ingestion_ids: [1, 2, 3],
  message: "3 files queued for processing"
}
```

#### Get Job Status
```typescript
GET /api/datasheets/:id

Response:
{
  id: 1,
  original_filename: "Q_CELLS_Q.PEAK_DUO_L-G5.2_395.pdf",
  manufacturer: "Q CELLS",
  processing_status: "completed",
  extracted_data: {
    maker: "Q CELLS",
    model: "Q.PEAK DUO L-G5.2 395",
    maxPower: 395,
    efficiency: 19.9,
    ...
  },
  validation_results: {
    valid: true,
    warnings: ["efficiency > 19% for P-type"],
    errors: []
  },
  confidence_score: 0.94,
  review_status: "needs_review"
}
```

#### Submit Review
```typescript
PUT /api/datasheets/:id/review

Request:
{
  corrected_data: {
    maker: "Q CELLS",
    model: "Q.PEAK DUO L-G5.2 395",
    maxPower: 395,
    // ... any corrected values
  },
  review_notes: "Verified against manufacturer website"
}

Response:
{
  success: true,
  message: "Review submitted successfully",
  next_action: "approve" // or "reprocess"
}
```

### 6.4 Worker Implementation

#### Python Worker Structure
```
worker/
├── extractors/
│   ├── __init__.py
│   ├── base_extractor.py
│   ├── pattern_extractor.py      # Regex-based
│   ├── entity_extractor.py       # NER-based
│   └── table_extractor.py        # Table parsing
├── processors/
│   ├── text_processor.py         # Text cleaning
│   ├── unit_converter.py         # Unit normalization
│   └── parameter_mapper.py       # Map to database fields
├── validators/
│   ├── range_validator.py        # Range checking
│   ├── cross_validator.py        # Cross-parameter validation
│   └── manufacturer_validator.py # Manufacturer-specific rules
├── models/
│   ├── ner_model/               # spaCy NER model
│   └── manufacturer_patterns.json # Pattern database
└── worker.py                    # Main worker loop
```

#### Main Processing Loop
```python
def process_datasheet(file_path: str, ingestion_id: int) -> dict:
    """Main processing pipeline"""

    # Step 1: Extract text and tables
    extraction_result = extract_text_and_tables(file_path)

    # Step 2: Run all extraction methods in parallel
    results = {}
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            'pattern': executor.submit(pattern_extractor.extract, extraction_result),
            'entity': executor.submit(entity_extractor.extract, extraction_result),
            'table': executor.submit(table_extractor.extract, extraction_result)
        }
        results = {k: f.result() for k, f in futures.items()}

    # Step 3: Fuse results
    fused_result = fuse_extraction_results(results)

    # Step 4: Validate
    validation_result = validate_parameters(fused_result.parameters)

    # Step 5: Calculate confidence score
    confidence = calculate_confidence_score(fused_result, validation_result)

    # Step 6: Save to database
    save_extraction_results(ingestion_id, fused_result, validation_result, confidence)

    return {
        'parameters': fused_result.parameters,
        'validation': validation_result,
        'confidence': confidence
    }
```

---

## 7. Error Handling & Validation

### 7.1 Error Categories

#### Extraction Errors
- **E-001: PDF unreadable**
  - Cause: Corrupted PDF or protected file
  - Handling: Mark as failed, request re-upload
  - Recovery: None

- **E-002: No text extracted**
  - Cause: Image-based PDF without OCR layer
  - Handling: Flag for manual entry
  - Recovery: Optional OCR processing (Tesseract)

- **E-003: Unrecognized manufacturer**
  - Cause: Manufacturer not in pattern database
  - Handling: Use generic extraction, flag for review
  - Recovery: Add patterns after manual review

#### Validation Errors
- **V-001: Parameter out of range**
  - Cause: Extraction error or actual invalid value
  - Handling: Flag with warning, proceed if other params valid
  - Recovery: Manual review

- **V-002: Missing required parameter**
  - Cause: Not present in datasheet
  - Handling: Set to NULL, flag for manual entry
  - Recovery: None

- **V-003: Parameter conflict**
  - Cause: Pmax ≠ Vmp × Imp
  - Handling: Flag as error, reject unless within 10% tolerance
  - Recovery: Manual review required

### 7.2 Retry Logic

#### Retry Strategy
```
- Transient errors (network, file access): 3 retries, exponential backoff
- Extraction errors: 1 retry with alternative method
- Validation errors: No retry, manual review required
- System errors (out of memory): 0 retries, alert admin
```

#### Backoff Schedule
```
Retry 1: immediate
Retry 2: wait 5 seconds
Retry 3: wait 30 seconds
Final: mark as failed and notify
```

### 7.3 Alerting & Monitoring

#### Metrics to Track
- Extraction success rate (target: >90%)
- Average processing time (target: <30s per PDF)
- Parameter extraction accuracy (by method)
- Queue size and processing lag
- Error rate by manufacturer
- Manual review rate (target: <20%)

#### Alert Conditions
- Extraction success rate < 80% over 1 hour
- Queue size > 1000 pending jobs
- Processing time > 60s for single job
- Error rate > 10% for specific manufacturer
- Manual review rate > 30% over 1 day

---

## 8. Extensibility & Future Enhancements

### 8.1 Adding New Parameters

#### Process for Adding Parameter
1. **Update Database Schema**
   ```sql
   ALTER TABLE pv_panel ADD COLUMN new_parameter FLOAT;
   ```

2. **Update TypeScript Interfaces**
   ```typescript
   interface PVPanel {
     // ... existing fields
     newParameter?: number;
   }
   ```

3. **Add Extraction Patterns**
   ```json
   {
     "parameter_name": "newParameter",
     "patterns": [
       "New Parameter\\s*[=:]\\s*(\\d+\\.?\\d*)"
     ],
     "unit": "unit_type",
     "range": { "min": 0, "max": 100 }
   }
   ```

4. **Update Validation Rules**
   ```python
   parameter_ranges['new_parameter'] = {'min': 0, 'max': 100, 'unit': 'unit'}
   ```

5. **Add Training Data** (for NER method)
   - Label 50+ datasheets with new parameter
   - Retrain NER model

6. **Update Tests**
   - Unit tests for extraction
   - Integration tests for pipeline
   - Validation tests

#### Timeline
- Database schema update: 1 day
- Extraction pattern addition: 1 day
- Validation rules: 1 day
- Testing: 2 days
- **Total: ~5 days per new parameter**

### 8.2 Supporting New Manufacturers

#### Manufacturer Onboarding Process
1. **Collect 20+ datasheets** from manufacturer
2. **Analyze common patterns** and format variations
3. **Create manufacturer-specific patterns**
   ```json
   {
     "manufacturer": "New Manufacturer",
     "patterns": [
       {
         "parameter": "maxPower",
         "regex": "Power Rating\\s*[=:]\\s*(\\d+)\\s*W",
         "priority": 1
       }
     ]
   }
   ```
4. **Test extraction** on 10+ datasheets
5. **Achieve >90% accuracy** before production
6. **Add to active manufacturer list**

### 8.3 Integration with External Sources

#### Potential Integrations
- **Manufacturer APIs:** Direct integration for automatic updates
- **IEC Database:** IEC 61215 certification database lookup
- **ENERGY STAR:** Query for certified modules
- **Photovoltaic Module Database (PVMD):** Secondary validation source
- **Manufacturer Websites:** Scrape datasheet catalogs

#### Implementation Approach
- Add data source adapter pattern
- Implement pluggable data providers
- Maintain provenance tracking
- Implement data source confidence weighting

### 8.4 Quality Improvements

#### Advanced AI Models
- **Transformer-based models** (BERT, RoBERTa) for better text understanding
- **Multi-modal models** to extract from diagrams and charts
- **Few-shot learning** to quickly adapt to new manufacturers
- **Active learning** to improve model with manual corrections

#### Crowdsourcing Validation
- Allow community to suggest corrections
- Implement reputation system for contributors
- Vote on parameter values for borderline cases
- Gamification to encourage participation

---

## 9. Testing Strategy

### 9.1 Test Pyramid

#### Unit Tests (70%)
- Individual extractor methods
- Validation logic
- Unit conversion functions
- Pattern matching accuracy
- **Target: 90% code coverage**

#### Integration Tests (20%)
- Full extraction pipeline
- Database read/write operations
- Queue processing
- API endpoint integration
- **Target: 50+ test cases**

#### End-to-End Tests (10%)
- Complete upload-to-database workflow
- Batch processing scenarios
- Manual review interface
- Error handling paths
- **Target: 20+ E2E scenarios**

### 9.2 Test Data

#### Test Dataset
- **100+ datasheets** from 20+ manufacturers
- **Diverse formats:** Single/multi-page, table/text-heavy, modern/vintage
- **Edge cases:** Poor quality, missing parameters, unusual units
- **Ground truth:** Manually verified parameter values
- **Version control:** Git-LFS for PDF storage

#### Synthetic Test Cases
- Generate PDFs with known parameters for edge case testing
- Parameter combination stress testing
- Boundary value testing (min/max ranges)
- Malformed input testing

### 9.3 Acceptance Criteria

#### Functional Acceptance Criteria
- [ ] Successfully process 95% of standard datasheets
- [ ] Extract core parameters (Pmax, Voc, Isc, Vmp, Imp, Efficiency) with >90% accuracy
- [ ] Handle batch upload of 100+ PDFs without errors
- [ ] Complete processing within SLA (< 30s per PDF average)
- [ ] Validate 100% of extracted parameters against range checks
- [ ] Support manual review interface for <20% of records

#### Non-Functional Acceptance Criteria
- [ ] API response time < 500ms for status checks
- [ ] Worker scalability to 10 concurrent processes
- [ ] 99% uptime for processing services
- [ ] Zero data loss in normal operations
- [ ] Complete audit trail for all operations

---

## 10. Deployment & Operations

### 10.1 Deployment Architecture

#### Development Environment
```
- API Server: localhost:5000
- Worker: Python process on developer machine
- Database: Local PostgreSQL
- Queue: Local Redis
- File Storage: Local filesystem
```

#### Staging Environment
```
- API Server: Kubernetes pod
- Workers: 3x Kubernetes pods
- Database: Managed PostgreSQL (AWS RDS)
- Queue: Managed Redis (AWS ElastiCache)
- File Storage: S3 bucket
- Monitoring: Prometheus + Grafana
```

#### Production Environment
```
- API Server: 3x Kubernetes pods (auto-scaling)
- Workers: 10x Kubernetes pods (auto-scaling based on queue size)
- Database: High-availability PostgreSQL cluster
- Queue: Redis Cluster for reliability
- File Storage: S3 with lifecycle policies
- CDN: CloudFront for file delivery
- Monitoring: Full observability stack
- Alerting: PagerDuty integration
```

### 10.2 Infrastructure Requirements

#### Minimum Resources
**API Server:**
- 2 CPU cores
- 4GB RAM
- 20GB disk

**Worker Node:**
- 4 CPU cores
- 8GB RAM
- 50GB disk (for PDF cache)

**Full Production:**
- 10+ workers for 1000+ PDFs/day
- PostgreSQL: 8 CPU, 32GB RAM, SSD storage
- Redis: 4 CPU, 16GB RAM
- S3: Auto-scaling storage

### 10.3 Operational Procedures

#### Monitoring Dashboard
- Queue size and processing rate
- Extraction accuracy metrics
- Error rate by manufacturer
- Processing time trends
- Manual review queue size

#### Maintenance Tasks
- **Daily:** Review error logs, process manual review queue
- **Weekly:** Analyze extraction metrics, update patterns
- **Monthly:** Review and clean old processing artifacts
- **Quarterly:** Retrain NER model with new data

#### Backup & Recovery
- **Database:** Daily automated backups, 30-day retention
- **File Storage:** S3 versioning enabled
- **Configuration:** Git version control, config in repo
- **Disaster Recovery:** RTO: 4 hours, RPO: 1 hour

---

## 11. Security Considerations

### 11.1 Data Security
- **File Upload Validation:** Virus scanning, file type checking, size limits
- **Secure Storage:** Encrypted at rest (AES-256)
- **Access Control:** Role-based access to manual review interface
- **Audit Logging:** All data access and modifications logged
- **Data Retention:** PDF archives retained for 2 years, extracted data indefinitely

### 11.2 System Security
- **Input Sanitization:** Prevent PDF-based attacks
- **API Authentication:** JWT tokens (existing system)
- **Rate Limiting:** Prevent abuse of upload endpoint
- **Network Security:** VPC isolation in cloud deployment
- **Secrets Management:** Use HashiCorp Vault or cloud KMS

### 11.3 Privacy
- **Manufacturer Data:** Public datasheets, no privacy concerns
- **Processing Logs:** No sensitive data in logs
- **User Data:** Review interface access logged for accountability

---

## 12. Timeline & Milestones

### 12.1 Development Phases

#### Phase 1: Foundation (Weeks 1-3)
- Set up basic architecture (API server, queue, worker)
- Implement PDF text extraction (pdfplumber)
- Create pattern-based extraction for 10 core parameters
- Build basic validation framework
- **Deliverable:** Single datasheet processing pipeline

#### Phase 2: AI Enhancement (Weeks 4-6)
- Implement NER-based extraction
- Create training dataset (200 labeled datasheets)
- Implement table parsing module
- Add multi-method fusion logic
- **Deliverable:** >85% extraction accuracy

#### Phase 3: Web Interface (Weeks 7-8)
- Build upload dashboard
- Implement manual review interface
- Create processing monitor
- Add batch processing capabilities
- **Deliverable:** Full web application

#### Phase 4: Validation & Testing (Weeks 9-10)
- Comprehensive testing with 100+ datasheets
- Performance optimization
- Add error handling and edge cases
- Document extraction patterns for 20 manufacturers
- **Deliverable:** Production-ready system

#### Phase 5: Production Deployment (Week 11)
- Set up staging environment
- Deploy to production
- Monitor and optimize
- Train operations team
- **Deliverable:** Live system

### 12.2 Critical Milestones

| Milestone | Target Date | Success Criteria |
|-----------|-------------|------------------|
| M1: Basic Pipeline | Week 3 | Process 1 PDF end-to-end |
| M2: Multi-Extractor | Week 6 | >85% accuracy on test set |
| M3: Web Interface | Week 8 | Functional review UI |
| M4: Testing Complete | Week 10 | 95% tests passing |
| M5: Production Deploy | Week 11 | Live system operational |

---

## 13. Budget & Resources

### 13.1 Development Resources

#### Team Composition
- **1 Technical Lead** (Full-time, 11 weeks)
- **1 Backend Developer** (Node.js/TypeScript, 8 weeks)
- **1 ML Engineer** (Python/NLP, 8 weeks)
- **1 Frontend Developer** (React/TypeScript, 6 weeks)
- **1 QA Engineer** (Part-time, 6 weeks)
- **1 Data Annotator** (Part-time, 6 weeks)

#### External Resources
- **Training Data:** Purchase/access to 500+ labeled datasheets
- **Compute:** GPU training for NER model (2 weeks on cloud)
- **Tooling:** PDF processing libraries (mostly open source)

### 13.2 Operational Costs (Annual)

#### Infrastructure
- **Cloud Hosting (AWS/GCP):** $15,000-$30,000/year
  - Compute: $10,000
  - Storage: $3,000
  - Database: $7,000
  - Queue/Cache: $2,000
  - Monitoring: $1,000

- **Development Tools:** $5,000/year
  - IDE licenses
  - Testing frameworks
  - Monitoring tools

#### Maintenance
- **1 FTE Engineer:** $120,000/year
  - Pattern updates
  - Model retraining
  - Bug fixes
  - New manufacturer support

### 13.3 ROI Calculation

#### Current Manual Entry Cost
- **Time per datasheet:** 15 minutes
- **Cost per datasheet:** $15 (at $60/hour)
- **1000 datasheets/year:** $15,000 labor cost

#### Automated System Cost
- **Development:** ~$200,000 one-time
- **Operations:** ~$145,000/year
- **Break-even:** ~14 months
- **5-year savings:** ~$400,000

---

## 14. Risks & Mitigation

### 14.1 Technical Risks

#### Risk T-1: Extraction Accuracy Below Target
- **Probability:** Medium
- **Impact:** High
- **Mitigation:**
  - Use ensemble of multiple extraction methods
  - Extensive training data for AI models
  - Manual review queue for edge cases
  - Continuous improvement based on feedback

#### Risk T-2: Performance Issues at Scale
- **Probability:** Low
- **Impact:** Medium
- **Mitigation:**
  - Horizontal scaling of workers
  - Asynchronous processing
  - Caching of frequently accessed patterns
  - Load testing before production

#### Risk T-3: New Manufacturer Formats
- **Probability:** High
- **Impact:** Medium
- **Mitigation:**
  - Manufacturer onboarding process documented
  - Pattern database extensible
  - Manual review for unsupported manufacturers
  - Community contributions encouraged

### 14.2 Operational Risks

#### Risk O-1: Queue Backlog
- **Probability:** Medium
- **Impact:** High
- **Mitigation:**
  - Auto-scaling workers based on queue size
  - Priority queue for urgent items
  - SLA monitoring and alerting
  - Burst capacity planning

#### Risk O-2: Data Quality Issues
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:**
  - Multi-level validation
  - Anomaly detection
  - Manual review process
  - Data quality monitoring dashboard

### 14.3 Business Risks

#### Risk B-1: Low User Adoption
- **Probability:** Low
- **Impact:** High
- **Mitigation:**
  - Intuitive web interface
  - Comprehensive documentation
  - Training for users
  - Gradual rollout with early adopters

#### Risk B-2: Changing Requirements
- **Probability:** High
- **Impact:** Medium
- **Mitigation:**
  - Extensible architecture
  - Modular design
  - API-first approach
  - Regular stakeholder feedback

---

## 15. Success Metrics & KPIs

### 15.1 Extraction Quality Metrics

#### Parameter Accuracy
```
Target: >90% for core parameters (Pmax, Voc, Isc, Vmp, Imp, Efficiency)
Measurement: Compare extracted vs. manual ground truth
Threshold: Accept system if >90% on test set of 100+ datasheets
```

#### Extraction Rate
```
Target: Successfully extract from >95% of PDFs
Measurement: % of PDFs where text extraction succeeds
Threshold: Fail if <90% for 2 consecutive weeks
```

#### Confidence Score Accuracy
```
Target: High confidence (>0.9) correlates with actual accuracy (>95%)
Measurement: Compare confidence scores with extraction accuracy
Threshold: Calibrate model if correlation <0.7
```

### 15.2 Operational Metrics

#### Processing Performance
```
Target: <30 seconds average processing time per PDF
Measurement: Time from upload to extraction complete
Threshold: Optimize if >45s for 1 week
```

#### Queue Health
```
Target: Queue size <100 items during normal operation
Measurement: Number of pending jobs in Redis queue
Threshold: Scale workers if >500 items for 1 hour
```

#### Manual Review Rate
```
Target: <20% of records require manual review
Measurement: % of extractions flagged for review
Threshold: Investigate if >30% for 1 week
```

### 15.3 Business Metrics

#### Adoption Rate
```
Target: 80% of equipment entries via datasheet ingestion within 6 months
Measurement: % of new PVPanel records created via system vs. manual entry
Threshold: User training if <50% after 3 months
```

#### Time Savings
```
Target: 90% reduction in data entry time
Measurement: Time to create PVPanel record (target: <2 minutes)
Threshold: Process improvement if >5 minutes average
```

#### Cost Savings
```
Target: ROI positive within 18 months
Measurement: Labor cost reduction vs. system operating cost
Threshold: Re-evaluate if not positive after 24 months
```

---

## 16. Conclusion & Recommendations

### 16.1 Summary
The solar PV panel datasheet ingestion utility represents a significant opportunity to automate and improve the quality of equipment data management. By combining multiple extraction techniques (pattern matching, AI/NLP, table parsing) with comprehensive validation and a user-friendly review interface, the system can achieve >90% extraction accuracy while maintaining full data integrity.

### 16.2 Key Recommendations

1. **Start with Pattern Matching**
   - Implement rule-based extraction first for fastest ROI
   - Cover 70-80% of datasheets with straightforward patterns
   - Use AI methods as enhancement, not replacement

2. **Invest in Training Data**
   - Quality labeled datasheets are critical for AI accuracy
   - Allocate budget for data annotation (~$20,000)
   - Continuous improvement with active learning

3. **Prioritize Manual Review Interface**
   - Human-in-the-loop ensures data quality
   - Makes system production-ready from day one
   - Provides feedback for continuous improvement

4. **Design for Extensibility**
   - New parameters will emerge (bifaciality, temperature coefficients, etc.)
   - New manufacturers need regular onboarding
   - Architecture should support rapid iteration

5. **Monitor and Iterate**
   - Track metrics from day one
   - Use data to guide improvements
   - Regular pattern updates based on new datasheet formats

### 16.3 Next Steps

1. **Stakeholder Approval** (Week 0)
   - Review PDR with product and engineering leadership
   - Confirm budget and resource allocation
   - Approve development timeline

2. **Team Assembly** (Week 0)
   - Hire/assign ML Engineer and Backend Developer
   - Begin recruiting Data Annotator
   - Set up development environment

3. **Pilot Dataset Collection** (Week 0-1)
   - Collect 100+ representative datasheets
   - Organize by manufacturer and format type
   - Begin manual verification for ground truth

4. **Architecture Detailed Design** (Week 1)
   - Finalize technology choices
   - Design database schema
   - Create API specifications
   - Plan CI/CD pipeline

5. **Begin Phase 1 Development** (Week 1)
   - Set up basic pipeline
   - Implement text extraction
   - Start pattern-based extraction

The investment in this system will pay for itself within 18 months through reduced manual data entry costs and improved data quality, while positioning the platform for future scalability and expansion into additional equipment types (inverters, mounting systems, etc.).

---

## 17. Appendices

### Appendix A: Sample Datasheet Analysis

Based on the Q CELLS Q.PEAK DUO L-G5.2 395 datasheet, the following parameters can be extracted:

**Direct Table Extraction:**
- Manufacturer: Q CELLS (header)
- Model: Q.PEAK DUO L-G5.2 395 (prominently displayed)
- Power: 395W (multiple locations)
- Efficiency: 19.9% (clear labeling)
- Voc: 48.9V (in electrical characteristics table)
- Isc: 10.21A (in electrical characteristics table)
- Vmp: 39.98V (in electrical characteristics table)
- Imp: 9.89A (in electrical characteristics table)

**Temperature Coefficients (in text):**
- γ (Pmax): -0.37%/K
- γ (Voc): -0.31%/K
- γ (Isc): +0.05%/K

**Physical Dimensions (in specifications table):**
- Length: 2130 mm
- Width: 1040 mm
- Weight: 22.5 kg

**Warranty Information (in text):**
- Product warranty: 12 years
- Performance warranty: 25 years (≥ 85% of rated power)

**Certification:**
- IEC 61215 / IEC 61730

This demonstrates that a well-structured datasheet can provide all required parameters through a combination of table parsing and pattern matching.

### Appendix B: Pattern Library Examples

```json
{
  "manufacturer_patterns": [
    {
      "manufacturer": "Q CELLS",
      "parameter_patterns": {
        "maxPower": [
          "Q\\.PEAK\\s+.*?\\s+(\\d{3,4})\\s*W",
          "Rated\\s+Power\\s*[=:E]\\s*(\\d{3,4})\\s*W",
          "Pmax\\s*[=:E]\\s*(\\d{3,4})\\s*W"
        ],
        "efficiency": [
          "Module\\s+Efficiency\\s*[=:E]\\s*(\\d{2}\\.\\d)%",
          "η\\s*[=:E]\\s*(\\d{2}\\.\\d)%"
        ],
        "openCircuitVoltage": [
          "Voc\\s*[=:E]\\s*(\\d{2}\\.\\d)\\s*V",
          "Open.?Circuit\\s+Voltage\\s*[=:E]\\s*(\\d{2}\\.\\d)\\s*V"
        ]
      }
    }
  ]
}
```

### Appendix C: Validation Rule Examples

```python
def validate_pv_panel(params: dict) -> ValidationResult:
    """Comprehensive validation for PV panel parameters"""

    errors = []
    warnings = []

    # Range validation
    if params.get('maxPower'):
        if not (100 <= params['maxPower'] <= 700):
            errors.append(f"maxPower {params['maxPower']}W outside valid range")

    # Cross-parameter validation
    if all(params.get(k) for k in ['maxPower', 'voltageAtPmax', 'currentAtPmax']):
        calculated_power = params['voltageAtPmax'] * params['currentAtPmax']
        if abs(calculated_power - params['maxPower']) / params['maxPower'] > 0.1:
            warnings.append(
                f"Pmax ({params['maxPower']}W) doesn't match Vmp×Imp "
                f"({calculated_power:.1f}W) within 10%"
            )

    # Physical constraints
    if all(params.get(k) for k in ['shortSide', 'longSide']):
        if params['shortSide'] >= params['longSide']:
            errors.append("shortSide must be less than longSide")

    return ValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings
    )
```

### Appendix D: NER Training Data Format

```json
[
  {
    "text": "Q.PEAK DUO L-G5.2 395W Module Efficiency 19.9%",
    "entities": [
      {"label": "POWER", "start": 20, "end": 23, "value": "395"},
      {"label": "EFFICIENCY", "start": 38, "end": 43, "value": "19.9"}
    ]
  },
  {
    "text": "Electrical Characteristics: Voc = 48.9V, Isc = 10.21A",
    "entities": [
      {"label": "VOLTAGE_OC", "start": 33, "end": 38, "value": "48.9"},
      {"label": "CURRENT_SC", "start": 43, "end": 48, "value": "10.21"}
    ]
  }
]
```

### Appendix E: API Response Examples

#### Successful Extraction Response
```json
{
  "success": true,
  "data": {
    "ingestion_id": 123,
    "filename": "Q_CELLS_Q.PEAK_DUO_L-G5.2_395.pdf",
    "status": "completed",
    "extracted_data": {
      "maker": "Q CELLS",
      "model": "Q.PEAK DUO L-G5.2 395",
      "maxPower": 395,
      "efficiency": 19.9,
      "openCircuitVoltage": 48.9,
      "shortCircuitCurrent": 10.21,
      "voltageAtPmax": 39.98,
      "currentAtPmax": 9.89,
      "tempCoeffPmax": -0.37,
      "shortSide": 1.04,
      "longSide": 2.13,
      "weight": 22.5,
      "productWarranty": "12 years",
      "performanceWarranty": "25 years",
      "certification": "IEC 61215 / IEC 61730"
    },
    "validation": {
      "valid": true,
      "warnings": [],
      "errors": [],
      "confidence_score": 0.94
    },
    "extraction_metadata": {
      "extraction_methods": {
        "pattern_matching": 0.85,
        "table_parsing": 0.98,
        "entity_recognition": 0.91
      },
      "processing_time_ms": 12450,
      "pages_processed": 3
    },
    "review_required": false,
    "message": "Extraction completed successfully"
  }
}
```

#### Partial Extraction Response (Requires Review)
```json
{
  "success": true,
  "data": {
    "ingestion_id": 124,
    "filename": "Generic_Panel_Unknown.pdf",
    "status": "completed",
    "extracted_data": {
      "maker": "Unknown Manufacturer",
      "model": "GP-400-72",
      "maxPower": 400,
      "efficiency": null,
      "openCircuitVoltage": 49.2,
      "shortCircuitCurrent": 10.5,
      "voltageAtPmax": null,
      "currentAtPmax": null,
      "tempCoeffPmax": null
    },
    "validation": {
      "valid": false,
      "warnings": ["Missing efficiency", "Missing thermal coefficients"],
      "errors": ["Unable to identify manufacturer from text"],
      "confidence_score": 0.62
    },
    "extraction_metadata": {
      "extraction_methods": {
        "pattern_matching": 0.45,
        "table_parsing": 0.78,
        "entity_recognition": 0.38
      },
      "processing_time_ms": 8920,
      "pages_processed": 2,
      "notes": ["Low text quality, possible OCR needed"]
    },
    "review_required": true,
    "message": "Extraction completed with warnings - manual review recommended"
  }
}
```

---

**Document Control:**
- Version: 1.0
- Last Updated: 2025-11-03
- Next Review: 2025-12-03
- Approval Status: Pending
