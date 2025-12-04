"""
Simplified PDF Table Extractor using Camelot

Extracts structured table data from PV panel datasheets using Camelot library.
Much simpler and more reliable than regex-based text parsing.
"""

import camelot
import logging
from pathlib import Path
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)


class CamelotExtractor:
    """Extract tables from PDFs using Camelot"""

    def __init__(self, pdf_path: Path):
        self.pdf_path = pdf_path

    def extract_all(self) -> Dict[str, Any]:
        """
        Extract all tables from PDF using Camelot

        Returns:
            Dictionary with extraction results
        """

        logger.info(f"Extracting tables from {self.pdf_path.name} using Camelot")

        try:
            # Try lattice extraction first (for tables with clear borders)
            tables_lattice = camelot.read_pdf(
                str(self.pdf_path),
                pages='all',
                flavor='lattice',
                suppress_stdout=True
            )

            # Try stream extraction as fallback (for tables without borders)
            tables_stream = camelot.read_pdf(
                str(self.pdf_path),
                pages='all',
                flavor='stream',
                suppress_stdout=True
            )

            # Combine and deduplicate tables
            all_tables = list(tables_lattice) + list(tables_stream)

            # Remove duplicate tables based on similarity
            unique_tables = self._deduplicate_tables(all_tables)

            # Convert tables to DataFrames and extract key info
            extracted_tables = []
            for i, table in enumerate(unique_tables):
                df = table.df
                table_info = {
                    'table_number': i + 1,
                    'shape': df.shape,
                    'data': df,
                    'accuracy': table.accuracy if hasattr(table, 'accuracy') else 0,
                    'whitespace': table.whitespace if hasattr(table, 'whitespace') else 0
                }
                extracted_tables.append(table_info)

                # Log table content for debugging
                logger.info(f"Table {i+1} ({df.shape[0]}x{df.shape[1]}): {df.iloc[0].tolist()[:5]}")

            # Extract text content (using pdfplumber as fallback)
            text_content = self._extract_text_fallback()

            result = {
                'success': True,
                'tables': extracted_tables,
                'text': text_content,
                'table_count': len(extracted_tables),
                'method': 'camelot'
            }

            logger.info(f"Extraction complete: {len(extracted_tables)} tables found")
            return result

        except Exception as e:
            logger.error(f"Camelot extraction failed: {e}", exc_info=True)
            return {
                'success': False,
                'error': str(e),
                'tables': [],
                'text': '',
                'table_count': 0,
                'method': 'camelot'
            }

    def _deduplicate_tables(self, tables: List) -> List:
        """Remove duplicate tables based on content similarity"""

        if not tables:
            return []

        unique = [tables[0]]

        for table in tables[1:]:
            is_duplicate = False
            table_df = table.df

            for unique_table in unique:
                unique_df = unique_table.df

                # Check if tables have similar dimensions and content
                if (table_df.shape == unique_df.shape and
                    len(table_df) > 0 and len(unique_df) > 0):
                    # Compare first few rows
                    sample_size = min(3, len(table_df))
                    similarity = sum(
                        1 for i in range(sample_size)
                        if table_df.iloc[i].tolist() == unique_df.iloc[i].tolist()
                    )
                    if similarity >= sample_size:
                        is_duplicate = True
                        break

            if not is_duplicate:
                unique.append(table)

        logger.info(f"Deduplicated {len(tables)} tables to {len(unique)} unique tables")
        return unique

    def _extract_text_fallback(self) -> str:
        """Fallback text extraction using pdfplumber"""
        try:
            import pdfplumber

            text = ''
            with pdfplumber.open(self.pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + '\n\n'

            return text
        except Exception as e:
            logger.warning(f"Text fallback extraction failed: {e}")
            return ''

    def get_electrical_specs_table(self) -> Optional[Dict[str, Any]]:
        """
        Find and return the main electrical specifications table

        Returns:
            Dictionary with electrical specs or None
        """

        tables = self.extract_all()

        if not tables['success']:
            return None

        for table_info in tables['tables']:
            df = table_info['data']

            # Look for electrical specifications indicators
            table_text = ' '.join(df.astype(str).values.flatten()).upper()

            if any(keyword in table_text for keyword in [
                'POWER CLASS', 'ELECTRICAL CHARACTERISTICS', 'MPP', 'VOC', 'ISC'
            ]):
                logger.info(f"Found electrical specs table: {df.shape}")
                return table_info

        logger.warning("No electrical specifications table found")
        return None
