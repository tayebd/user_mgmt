#!/usr/bin/env python3
"""
Simple CLI for Camelot-based datasheet extraction

Usage:
    python camelot_cli.py --output ./results file path/to/datasheet.pdf --manufacturer "Q CELLS"
    python camelot_cli.py --output ./results batch path/to/config.json
"""

import sys
import argparse
import logging
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from models import ProcessingConfig
from camelot_processor import CamelotDatasheetProcessor


def main():
    """Main entry point"""

    parser = argparse.ArgumentParser(
        description='Extract PV panel data from datasheets using Camelot'
    )

    parser.add_argument(
        '--output',
        type=str,
        default='./output',
        help='Output directory for results'
    )

    parser.add_argument(
        '--manufacturer',
        type=str,
        help='Manufacturer name (for single file mode)'
    )

    parser.add_argument(
        'mode',
        choices=['file', 'batch'],
        help='Processing mode: file (single) or batch (config file)'
    )

    parser.add_argument(
        'path',
        type=str,
        help='File path (file mode) or config path (batch mode)'
    )

    args = parser.parse_args()

    # Setup output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Configure processing
    config = ProcessingConfig(
        db_connection_string="",
        pdf_files=[],
        output_dir=output_dir,
        skip_validation=True,
        export_format='both'
    )

    # Setup PDF files based on mode
    if args.mode == 'file':
        pdf_path = Path(args.path)
        if not pdf_path.exists():
            logger.error(f"File not found: {pdf_path}")
            sys.exit(1)

        config.pdf_files = [{
            'file_path': str(pdf_path),
            'manufacturer': args.manufacturer or 'Unknown'
        }]
    else:  # batch mode
        config_path = Path(args.path)
        if not config_path.exists():
            logger.error(f"Config file not found: {config_path}")
            sys.exit(1)

        # Load batch config
        with open(config_path, 'r') as f:
            config_data = json.load(f)

        config.pdf_files = config_data.get('pdf_files', [])
        if not config.pdf_files:
            logger.error("No PDF files configured")
            sys.exit(1)

    # Create processor
    processor = CamelotDatasheetProcessor(config)

    # Process files
    logger.info(f"Starting Camelot extraction in {args.mode} mode")
    summary = processor.process_batch()

    # Save results
    saved_files = processor.save_results(output_dir)

    # Print summary
    print("\n" + "="*80)
    print("CAMELOT EXTRACTION SUMMARY")
    print("="*80)
    print(f"Total files: {summary['total_files']}")
    print(f"Successful: {summary['successful_extractions']}")
    print(f"Failed: {summary['failed_extractions']}")
    print(f"Success rate: {summary['success_rate']}%")
    print(f"Average processing time: {summary['average_processing_time_ms']:.2f}ms")
    print(f"\nResults saved to: {output_dir}")
    print(f"  - JSON: {saved_files.get('json')}")
    print(f"  - CSV: {saved_files.get('csv')}")
    print(f"  - Summary: {saved_files.get('summary')}")
    print("="*80)

    # Print first result for verification
    if processor.get_results():
        result = processor.get_results()[0]
        panel = result.panel_data
        print("\nFIRST EXTRACTION RESULT:")
        print(f"  Manufacturer: {panel.maker}")
        print(f"  Model: {panel.model}")
        print(f"  Max Power: {panel.maxPower}W")
        print(f"  Efficiency: {panel.efficiency}%")
        print(f"  Voc: {panel.openCircuitVoltage}V")
        print(f"  Isc: {panel.shortCircuitCurrent}A")
        print(f"  Vmp: {panel.voltageAtPmax}V")
        print(f"  Imp: {panel.currentAtPmax}A")
        print(f"  Dimensions: {panel.longSide}m x {panel.shortSide}m")
        print(f"  Weight: {panel.weight}kg")

    # Print errors if any
    if processor.get_errors():
        print(f"\nERRORS ({len(processor.get_errors())}):")
        for error in processor.get_errors()[:5]:
            print(f"  - {error['file']}: {error['error']}")

    logger.info("Camelot extraction complete")


if __name__ == '__main__':
    import json  # Import here to avoid issues if not needed
    main()
