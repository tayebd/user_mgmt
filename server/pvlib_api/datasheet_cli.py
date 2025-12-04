#!/usr/bin/env python3
"""
Command-Line Interface for Solar Panel Datasheet Processor

Usage:
    python datasheet_cli.py --config ../datasheet-input/input-config.json
    python datasheet_cli.py --file /path/to/datasheet.pdf --manufacturer "Q CELLS"
    python datasheet_cli.py --dir /path/to/pdfs/ --output ./results --export-csv
"""

import argparse
import sys
import json
from pathlib import Path
from typing import Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('datasheet_processor.log')
    ]
)

logger = logging.getLogger(__name__)


def load_config_from_file(config_path: Path) -> dict:
    """Load configuration from JSON file"""
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        logger.info(f"Loaded configuration from {config_path}")
        return config
    except Exception as e:
        logger.error(f"Failed to load config from {config_path}: {e}")
        sys.exit(1)


def process_single_pdf(args) -> None:
    """Process a single PDF file"""
    from datasheet_processor import DatasheetProcessor, ProcessingConfig
    from pdf_extractor import PDFTextExtractor
    from panel_parser import ParserFactory
    from models import PVPanelData, ExtractionResult

    pdf_path = Path(args.file)
    if not pdf_path.exists():
        logger.error(f"File not found: {pdf_path}")
        sys.exit(1)

    logger.info(f"Processing single PDF: {pdf_path.name}")

    # Create PDF config
    pdf_config = {
        'file_path': str(pdf_path),
        'manufacturer': args.manufacturer,
        'model_hint': args.model_hint,
        'priority': 'high',
        'notes': 'Single file processing'
    }

    # Create config
    config = ProcessingConfig(
        db_connection_string=args.db_url or "postgresql://...",
        pdf_files=[pdf_config],
        manufacturer_override=args.manufacturer,
        confidence_threshold=args.confidence_threshold,
        skip_validation=args.skip_validation,
        export_format='json',
        output_dir=Path(args.output) if args.output else Path('./results'),
        enabled_manufacturers=[]
    )

    # Create processor
    processor = DatasheetProcessor(config)

    # Process
    result = processor.process_single_pdf(pdf_config)

    if result:
        print("\n" + "="*80)
        print("EXTRACTION RESULT")
        print("="*80)
        print(f"Manufacturer: {result.panel_data.maker}")
        print(f"Model: {result.panel_data.model}")
        print(f"Max Power: {result.panel_data.maxPower} W")
        print(f"Efficiency: {result.panel_data.efficiency} %")
        print(f"Voc: {result.panel_data.openCircuitVoltage} V")
        print(f"Isc: {result.panel_data.shortCircuitCurrent} A")
        print(f"Vmp: {result.panel_data.voltageAtPmax} V")
        print(f"Imp: {result.panel_data.currentAtPmax} A")
        print(f"Temperature Coefficient (Pmax): {result.panel_data.tempCoeffPmax} %/K")
        print(f"Dimensions: {result.panel_data.shortSide} m x {result.panel_data.longSide} m")
        print(f"Weight: {result.panel_data.weight} kg")
        print(f"Product Warranty: {result.panel_data.productWarranty}")
        print(f"Performance Warranty: {result.panel_data.performanceWarranty}")
        print(f"Certification: {result.panel_data.certification}")

        if result.warnings:
            print(f"\nWarnings: {len(result.warnings)}")
            for warning in result.warnings:
                print(f"  - {warning}")

        if result.errors:
            print(f"\nErrors: {len(result.errors)}")
            for error in result.errors:
                print(f"  - {error}")

        print("="*80)

        # Save result
        if args.output:
            output_dir = Path(args.output)
            output_dir.mkdir(parents=True, exist_ok=True)
            processor.save_results(output_dir)
            print(f"\nResults saved to {output_dir}")
    else:
        logger.error("Failed to extract data from PDF")
        sys.exit(1)


def process_directory(args) -> None:
    """Process all PDFs in a directory"""
    from datasheet_processor import DatasheetProcessor, ProcessingConfig

    pdf_dir = Path(args.dir)
    if not pdf_dir.exists() or not pdf_dir.is_dir():
        logger.error(f"Directory not found: {pdf_dir}")
        sys.exit(1)

    # Find all PDF files
    pdf_files = list(pdf_dir.glob('*.pdf'))
    if not pdf_files:
        logger.error(f"No PDF files found in {pdf_dir}")
        sys.exit(1)

    logger.info(f"Found {len(pdf_files)} PDF files in {pdf_dir}")

    # Create PDF configs
    pdf_configs = []
    for pdf_file in pdf_files:
        pdf_configs.append({
            'file_path': str(pdf_file),
            'manufacturer': args.manufacturer,
            'model_hint': None,
            'priority': 'normal',
            'notes': f'Directory: {pdf_dir}'
        })

    # Create config
    config = ProcessingConfig(
        db_connection_string=args.db_url or "postgresql://...",
        pdf_files=pdf_configs,
        manufacturer_override=args.manufacturer,
        confidence_threshold=args.confidence_threshold,
        skip_validation=args.skip_validation,
        export_format=args.export_format,
        output_dir=Path(args.output) if args.output else Path('./results'),
        enabled_manufacturers=[]
    )

    # Create processor and process
    processor = DatasheetProcessor(config)
    summary = processor.process_batch()

    # Print summary
    print("\n" + "="*80)
    print("PROCESSING SUMMARY")
    print("="*80)
    print(f"Total files: {summary['total_files']}")
    print(f"Successful: {summary['successful_extractions']}")
    print(f"Failed: {summary['failed_extractions']}")
    print(f"Success rate: {summary['success_rate']}%")
    print(f"Average processing time: {summary['average_processing_time_ms']:.2f} ms")

    if summary['manufacturers_found']:
        print(f"\nManufacturers found:")
        for manufacturer, count in summary['manufacturers_found'].items():
            print(f"  - {manufacturer}: {count}")

    if summary['errors']:
        print(f"\nErrors: {len(summary['errors'])}")
        for error in summary['errors']:
            print(f"  - {error['file']}: {error['error']}")

    print("="*80)

    # Save results
    if args.output:
        saved_files = processor.save_results(Path(args.output))
        print(f"\nResults saved to {args.output}")
        for file_type, file_path in saved_files.items():
            print(f"  {file_type}: {file_path}")


def process_from_config(args) -> None:
    """Process from configuration file"""
    from datasheet_processor import process_from_config

    config_path = Path(args.config)
    if not config_path.exists():
        logger.error(f"Config file not found: {config_path}")
        sys.exit(1)

    logger.info(f"Processing from configuration: {config_path}")

    try:
        summary = process_from_config(config_path)

        # Print summary
        print("\n" + "="*80)
        print("PROCESSING SUMMARY")
        print("="*80)
        print(f"Total files: {summary['total_files']}")
        print(f"Successful: {summary['successful_extractions']}")
        print(f"Failed: {summary['failed_extractions']}")
        print(f"Success rate: {summary['success_rate']}%")
        print(f"Average processing time: {summary['average_processing_time_ms']:.2f} ms")

        if summary.get('output_files'):
            print(f"\nOutput files:")
            for file_type, file_path in summary['output_files'].items():
                print(f"  {file_type}: {file_path}")

        if summary.get('database_save'):
            db_save = summary['database_save']
            print(f"\nDatabase save: {db_save['success']}")
            if db_save['success']:
                print(f"  Inserted: {db_save['inserted_count']} records")
            else:
                print(f"  Error: {db_save.get('error', 'Unknown error')}")

        print("="*80)

    except Exception as e:
        logger.error(f"Processing failed: {e}", exc_info=True)
        sys.exit(1)


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Solar PV Panel Datasheet Processor',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process single PDF
  python datasheet_cli.py --file /path/to/datasheet.pdf --manufacturer "Q CELLS"

  # Process all PDFs in directory
  python datasheet_cli.py --dir /path/to/pdfs/ --output ./results

  # Process from configuration file
  python datasheet_cli.py --config ../datasheet-input/input-config.json

  # Process with database integration
  python datasheet_cli.py --config ../datasheet-input/input-config.json --db-url postgresql://user:pass@localhost/db
        """
    )

    # Global options
    parser.add_argument('--db-url', type=str,
                        help='PostgreSQL database connection URL')
    parser.add_argument('--confidence-threshold', type=float, default=0.7,
                        help='Minimum confidence score for extraction (0.0-1.0)')
    parser.add_argument('--skip-validation', action='store_true',
                        help='Skip validation checks')
    parser.add_argument('--output', type=str,
                        help='Output directory for results')

    # Subparsers for different modes
    subparsers = parser.add_subparsers(dest='mode', help='Processing mode')

    # Single file mode
    file_parser = subparsers.add_parser('file', help='Process single PDF file')
    file_parser.add_argument('file', type=str, help='Path to PDF file')
    file_parser.add_argument('--manufacturer', type=str,
                             help='Manufacturer name (optional, auto-detected if not provided)')
    file_parser.add_argument('--model-hint', type=str,
                             help='Model hint for better extraction (optional)')

    # Directory mode
    dir_parser = subparsers.add_parser('dir', help='Process all PDFs in directory')
    dir_parser.add_argument('dir', type=str, help='Directory containing PDF files')
    dir_parser.add_argument('--manufacturer', type=str,
                            help='Manufacturer name for all files (optional)')
    dir_parser.add_argument('--export-format', type=str, choices=['json', 'csv', 'both'],
                            default='both', help='Export format')

    # Config file mode
    config_parser = subparsers.add_parser('config', help='Process from configuration file')
    config_parser.add_argument('config', type=str, help='Path to configuration JSON file')

    # Parse arguments
    args = parser.parse_args()

    if not args.mode:
        parser.print_help()
        sys.exit(1)

    # Execute appropriate mode
    try:
        if args.mode == 'file':
            process_single_pdf(args)
        elif args.mode == 'dir':
            process_directory(args)
        elif args.mode == 'config':
            process_from_config(args)
    except KeyboardInterrupt:
        logger.info("Processing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
