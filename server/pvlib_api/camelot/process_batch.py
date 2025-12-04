#!/usr/bin/env python3
"""
Batch processing script for PV panel datasheets
"""

import json
import sys
from pathlib import Path
from camelot_processor import CamelotDatasheetProcessor
from models import ProcessingConfig

def load_batch_config(config_file: str):
    """Load batch processing configuration"""

    with open(config_file, 'r') as f:
        config = json.load(f)

    return config

def main():
    if len(sys.argv) < 2:
        print("Usage: python process_batch.py <config_file>")
        sys.exit(1)

    config_file = sys.argv[1]
    batch_config = load_batch_config(config_file)

    print("=" * 80)
    print("BATCH PROCESSING - PV PANEL DATASHEET EXTRACTION")
    print("=" * 80)
    print(f"\nProcessing {len(batch_config['datasheets'])} datasheets...")

    # Create processing config
    pdf_files = batch_config['datasheets']
    output_dir = Path(batch_config.get('output_directory', './batch_results'))

    proc_config = ProcessingConfig(
        pdf_files=pdf_files,
        skip_validation=batch_config['extraction_options']['skip_validation'],
        output_dir=output_dir,
        output_formats=batch_config['extraction_options']['output_formats']
    )

    # Process batch
    processor = CamelotDatasheetProcessor(proc_config)
    summary = processor.process_batch()

    # Save results
    saved_files = processor.save_results(output_dir)

    # Print summary
    print("\n" + "=" * 80)
    print("BATCH PROCESSING SUMMARY")
    print("=" * 80)
    print(f"Total files: {summary['total_files']}")
    print(f"Successful: {summary['successful_extractions']}")
    print(f"Failed: {summary['failed_extractions']}")
    print(f"Success rate: {summary['success_rate']}%")
    print(f"\nManufacturers found: {summary['manufacturers_found']}")

    print("\n" + "=" * 80)
    print("RESULTS SAVED TO:")
    print("=" * 80)
    for fmt, file_path in saved_files.items():
        print(f"{fmt.upper()}: {file_path}")

    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
