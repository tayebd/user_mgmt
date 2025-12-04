"""
Simplified Datasheet Processing using Camelot

Much simpler architecture - relies on table extraction instead of complex regex.
"""

import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from tqdm import tqdm

from camelot_extractor import CamelotExtractor
from simplified_parser import SimplifiedParser
from models import PVPanelData, ExtractionResult, ProcessingConfig

logger = logging.getLogger(__name__)


class CamelotDatasheetProcessor:
    """Simplified datasheet processor using Camelot"""

    def __init__(self, config: ProcessingConfig):
        self.config = config
        self.results: List[ExtractionResult] = []
        self.errors: List[Dict[str, Any]] = []

    def process_single_pdf(self, pdf_config: Dict[str, Any]) -> Optional[ExtractionResult]:
        """Process a single PDF file using Camelot"""

        pdf_path = Path(pdf_config['file_path'])
        manufacturer = pdf_config.get('manufacturer', 'Unknown Manufacturer')

        logger.info(f"Processing: {pdf_path.name}")

        try:
            # Extract tables using Camelot
            extractor = CamelotExtractor(pdf_path)
            extraction_data = extractor.extract_all()

            if not extraction_data['success']:
                error_msg = extraction_data.get('error', 'Unknown error')
                logger.error(f"Failed to extract from {pdf_path.name}: {error_msg}")
                self.errors.append({
                    'file': pdf_path.name,
                    'error': f"Extraction failed: {error_msg}"
                })
                return None

            tables = extraction_data['tables']
            text = extraction_data['text']

            logger.info(f"Found {len(tables)} tables using Camelot")

            # Parse using simplified parser
            start_time = time.time()
            parser = SimplifiedParser(manufacturer)
            panel_data = parser.parse(tables, text)
            processing_time = (time.time() - start_time) * 1000

            # Validate data
            warnings = []
            errors = []

            if not self.config.skip_validation:
                # Check required fields
                if not panel_data.maker or panel_data.maker == "Unknown Manufacturer":
                    errors.append("Manufacturer could not be identified")
                if not panel_data.model or panel_data.model == "Unknown Model":
                    errors.append("Model could not be identified")

            # Calculate confidence scores
            confidence_scores = {}
            if panel_data.maxPower:
                confidence_scores['maxPower'] = 0.95
            if panel_data.efficiency:
                confidence_scores['efficiency'] = 0.9
            if panel_data.openCircuitVoltage:
                confidence_scores['openCircuitVoltage'] = 0.9
            if panel_data.shortCircuitCurrent:
                confidence_scores['shortCircuitCurrent'] = 0.9

            # Create extraction result
            result = ExtractionResult(
                panel_data=panel_data,
                confidence_scores=confidence_scores,
                extraction_method="camelot_table_extraction",
                warnings=warnings,
                errors=errors,
                processing_time_ms=processing_time,
                source_file=pdf_path
            )

            logger.info(
                f"Processed {pdf_path.name}: "
                f"{panel_data.maker} {panel_data.model}, "
                f"Power: {panel_data.maxPower}W, "
                f"Efficiency: {panel_data.efficiency}%"
            )

            return result

        except Exception as e:
            logger.error(f"Failed to process {pdf_path.name}: {e}", exc_info=True)
            self.errors.append({
                'file': pdf_path.name,
                'error': str(e)
            })
            return None

    def process_batch(self) -> Dict[str, Any]:
        """Process all PDFs in batch"""

        logger.info(f"Starting batch processing of {len(self.config.pdf_files)} files with Camelot")

        total_files = len(self.config.pdf_files)
        successful_extractions = 0
        failed_extractions = 0

        # Create progress bar
        with tqdm(total=total_files, desc="Processing PDFs") as pbar:
            for pdf_config in self.config.pdf_files:
                # Check if file exists
                pdf_path = Path(pdf_config['file_path'])
                if not pdf_path.exists():
                    error_msg = f"File not found: {pdf_path}"
                    logger.warning(error_msg)
                    self.errors.append({
                        'file': pdf_config['file_path'],
                        'error': error_msg
                    })
                    pbar.set_postfix({
                        'Status': f'File not found: {pdf_path.name}',
                        'Success': successful_extractions,
                        'Failed': failed_extractions + 1
                    })
                    pbar.update(1)
                    failed_extractions += 1
                    continue

                # Process PDF
                result = self.process_single_pdf(pdf_config)

                if result:
                    self.results.append(result)
                    successful_extractions += 1
                    pbar.set_postfix({
                        'Status': f'✓ {result.panel_data.model}',
                        'Success': successful_extractions,
                        'Failed': failed_extractions
                    })
                else:
                    failed_extractions += 1
                    pbar.set_postfix({
                        'Status': '✗ Failed',
                        'Success': successful_extractions,
                        'Failed': failed_extractions
                    })

                pbar.update(1)

        # Generate summary
        summary = self.generate_summary(successful_extractions, failed_extractions)

        logger.info(f"Batch processing complete: {successful_extractions} successful, {failed_extractions} failed")

        return summary

    def generate_summary(self, successful: int, failed: int) -> Dict[str, Any]:
        """Generate processing summary"""

        total_processed = successful + failed
        success_rate = (successful / total_processed * 100) if total_processed > 0 else 0

        # Average processing time
        avg_processing_time = 0
        if self.results:
            total_time = sum(r.processing_time_ms for r in self.results if r.processing_time_ms)
            avg_processing_time = total_time / len(self.results)

        # Manufacturers found
        manufacturers = {}
        for result in self.results:
            maker = result.panel_data.maker
            manufacturers[maker] = manufacturers.get(maker, 0) + 1

        summary = {
            'timestamp': datetime.now().isoformat(),
            'total_files': total_processed,
            'successful_extractions': successful,
            'failed_extractions': failed,
            'success_rate': round(success_rate, 2),
            'average_processing_time_ms': round(avg_processing_time, 2),
            'manufacturers_found': manufacturers,
            'errors': self.errors,
            'results_count': len(self.results),
            'extraction_method': 'camelot_table_extraction'
        }

        return summary

    def save_results(self, output_dir: Path) -> Dict[str, Path]:
        """Save extraction results to files"""

        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        saved_files = {}

        # Save detailed results as JSON
        json_file = output_dir / f'camelot_extracted_data_{timestamp}.json'
        results_data = []

        for result in self.results:
            result_dict = {
                'panel_data': result.panel_data.dict(),
                'confidence_scores': result.confidence_scores,
                'warnings': result.warnings,
                'errors': result.errors,
                'processing_time_ms': result.processing_time_ms,
                'source_file': str(result.source_file) if result.source_file else None
            }
            results_data.append(result_dict)

        with open(json_file, 'w') as f:
            json.dump(results_data, f, indent=2, default=str)
        saved_files['json'] = json_file

        # Save summary
        summary = self.generate_summary(len(self.results), len(self.errors))
        summary_file = output_dir / f'camelot_processing_summary_{timestamp}.json'
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2, default=str)
        saved_files['summary'] = summary_file

        # Save CSV
        csv_file = output_dir / f'camelot_extracted_data_{timestamp}.csv'
        import csv

        with open(csv_file, 'w', newline='') as f:
            if self.results:
                fieldnames = list(self.results[0].panel_data.dict().keys())
                writer = csv.DictWriter(f, fieldnames=fieldnames)

                writer.writeheader()
                for result in self.results:
                    writer.writerow(result.panel_data.dict())
        saved_files['csv'] = csv_file

        logger.info(f"Results saved to {output_dir}")
        return saved_files

    def get_results(self) -> List[ExtractionResult]:
        """Get all extraction results"""
        return self.results

    def get_errors(self) -> List[Dict[str, Any]]:
        """Get all errors"""
        return self.errors
