#!/usr/bin/env python3
"""
Debug script to extract and display raw text from PDF
"""

import sys
from pathlib import Path
from pdf_extractor import PDFTextExtractor

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 debug_pdf.py <pdf_file_path>")
        sys.exit(1)

    pdf_path = Path(sys.argv[1])

    if not pdf_path.exists():
        print(f"Error: File {pdf_path} not found")
        sys.exit(1)

    print("=" * 80)
    print(f"EXTRACTING TEXT FROM: {pdf_path}")
    print("=" * 80)

    extractor = PDFTextExtractor(pdf_path)
    result = extractor.extract_all()

    if not result['success']:
        print(f"\nERROR: {result['error']}")
        sys.exit(1)

    print(f"\nExtraction Summary:")
    print(f"- Pages: {result['metadata']['page_count']}")
    print(f"- Tables: {len(result['tables'])}")
    print(f"- Text length: {len(result['text'])} characters")

    print("\n" + "=" * 80)
    print("EXTRACTED TEXT:")
    print("=" * 80)
    print(result['text'])

    if result['tables']:
        print("\n" + "=" * 80)
        print(f"TABLES FOUND ({len(result['tables'])}):")
        print("=" * 80)
        for i, table_info in enumerate(result['tables'], 1):
            print(f"\n--- TABLE {i} (Page {table_info['page']}) ---")
            for row in table_info['data']:
                print("\t".join([str(cell) if cell else "" for cell in row]))

if __name__ == "__main__":
    main()
