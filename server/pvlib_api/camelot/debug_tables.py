#!/usr/bin/env python3
"""
Debug script to visualize table structures extracted from PDF
"""

import sys
from pathlib import Path
from camelot_extractor import CamelotExtractor
import pandas as pd

def debug_tables(pdf_path: str):
    """Debug table extraction from a PDF"""

    print("=" * 80)
    print(f"DEBUGGING TABLE EXTRACTION: {pdf_path}")
    print("=" * 80)

    extractor = CamelotExtractor(Path(pdf_path))
    result = extractor.extract_all()

    if not result['success']:
        print(f"\n❌ Extraction failed: {result.get('error')}")
        return

    print(f"\n✓ Extraction successful!")
    print(f"Found {result['table_count']} tables\n")

    # Print each table in detail
    for i, table_info in enumerate(result['tables'], 1):
        df = table_info['data']
        print(f"\n{'='*80}")
        print(f"TABLE {i} - Shape: {df.shape[0]} rows x {df.shape[1]} columns")
        print(f"{'='*80}")

        # Print as a nice table
        print("\nDataFrame contents:")
        print(df.to_string(max_rows=50, max_cols=20))

        # Search for electrical specs keywords
        table_text = ' '.join(df.astype(str).values.flatten()).upper()

        keywords_found = []
        for keyword in ['POWER', 'VOLTAGE', 'CURRENT', 'VOC', 'ISC', 'VMP', 'IMP', 'MPP', 'EFFICIENCY']:
            if keyword in table_text:
                keywords_found.append(keyword)

        if keywords_found:
            print(f"\n✓ Found keywords: {', '.join(keywords_found)}")
        else:
            print("\n⚠ No electrical specification keywords found")

    # Print text content sample
    print(f"\n{'='*80}")
    print("TEXT CONTENT SAMPLE (first 2000 chars):")
    print(f"{'='*80}")
    print(result['text'][:2000])
    print("\n...")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_tables.py <pdf_file_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    debug_tables(pdf_path)
