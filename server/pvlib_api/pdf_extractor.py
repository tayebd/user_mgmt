"""
PDF Text Extraction Module for Solar Panel Datasheets

This module uses pdfplumber to extract text and table data from PDF datasheets.
"""

import pdfplumber
import logging
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)


class PDFTextExtractor:
    """Extract text and tables from PDF datasheets using pdfplumber"""

    def __init__(self, pdf_path: Path):
        """Initialize extractor with PDF file path"""
        self.pdf_path = pdf_path
        self.text_content = ""
        self.tables = []
        self.metadata = {}

    def extract_all(self) -> Dict[str, Any]:
        """Extract both text and tables from PDF"""
        logger.info(f"Extracting content from {self.pdf_path.name}")

        try:
            # Handle pdfplumber compatibility issues with certain PDFs
            pdf = None
            try:
                pdf = pdfplumber.open(self.pdf_path)
            except AttributeError as e:
                if 'LTCurve' in str(e) and 'original_path' in str(e):
                    logger.warning(f"PDF compatibility issue with pdfplumber for {self.pdf_path.name}. Retrying...")
                    # Retry once - sometimes this is a transient issue
                    import time
                    time.sleep(0.1)
                    pdf = pdfplumber.open(self.pdf_path)
                else:
                    raise
            except Exception as e:
                logger.error(f"Failed to open PDF {self.pdf_path.name}: {e}")
                return {
                    'text': "",
                    'tables': [],
                    'metadata': {},
                    'success': False,
                    'error': str(e)
                }

            if not pdf:
                raise Exception("Failed to open PDF")

            with pdf:
                self.metadata = {
                    'page_count': len(pdf.pages),
                    'file_size': self.pdf_path.stat().st_size,
                    'pdf_info': pdf.metadata
                }

                # Extract text from all pages
                all_text = []
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        all_text.append(f"--- PAGE {page_num} ---\n{page_text}")

                self.text_content = "\n\n".join(all_text)

                # Extract tables from all pages
                self.tables = []
                for page_num, page in enumerate(pdf.pages, 1):
                    page_tables = page.extract_tables()
                    for table_num, table in enumerate(page_tables, 1):
                        if table:
                            self.tables.append({
                                'page': page_num,
                                'table_number': table_num,
                                'data': table
                            })

                logger.info(
                    f"Extraction complete: {len(pdf.pages)} pages, "
                    f"{len(self.tables)} tables, "
                    f"{len(self.text_content)} characters of text"
                )

                return {
                    'text': self.text_content,
                    'tables': self.tables,
                    'metadata': self.metadata,
                    'success': True
                }

        except Exception as e:
            logger.error(f"Failed to extract from {self.pdf_path}: {e}")
            return {
                'text': "",
                'tables': [],
                'metadata': {},
                'success': False,
                'error': str(e)
            }

    def get_text(self) -> str:
        """Get extracted text content"""
        if not self.text_content:
            self.extract_all()
        return self.text_content

    def get_tables(self) -> List[Dict[str, Any]]:
        """Get extracted tables"""
        if not self.tables:
            self.extract_all()
        return self.tables

    def get_metadata(self) -> Dict[str, Any]:
        """Get PDF metadata"""
        if not self.metadata:
            self.extract_all()
        return self.metadata

    def extract_tables_as_dict(self) -> List[Dict[str, str]]:
        """Extract tables and convert to list of dictionaries"""
        tables_dict = []

        for table_info in self.get_tables():
            table_data = table_info['data']

            if not table_data or len(table_data) < 2:
                continue

            # Assume first row is headers
            headers = [str(cell).strip() if cell else "" for cell in table_data[0]]

            # Convert rows to dictionaries
            for row in table_data[1:]:
                if not row or all(not cell for cell in row):
                    continue

                row_dict = {}
                for i, header in enumerate(headers):
                    if i < len(row):
                        row_dict[header] = str(row[i]).strip() if row[i] else ""

                if any(row_dict.values()):  # Only add non-empty rows
                    tables_dict.append(row_dict)

        return tables_dict

    def search_text(self, pattern: str) -> List[str]:
        """Search for pattern in extracted text"""
        import re

        matches = re.findall(pattern, self.get_text(), re.IGNORECASE)
        return matches

    def get_page_text(self, page_number: int) -> Optional[str]:
        """Get text from specific page"""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                if 1 <= page_number <= len(pdf.pages):
                    page = pdf.pages[page_number - 1]
                    return page.extract_text()
        except Exception as e:
            logger.error(f"Failed to extract page {page_number}: {e}")

        return None
