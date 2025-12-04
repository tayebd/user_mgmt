#!/bin/bash
# Batch processing script for PV panel datasheets

echo "================================================================================"
echo "BATCH PROCESSING - PV PANEL DATASHEET EXTRACTION"
echo "================================================================================"
echo ""

# Create output directory
OUTPUT_DIR="./batch_results_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "Output directory: $OUTPUT_DIR"
echo ""

# Process Q CELLS datasheet
echo "Processing Q CELLS Q.PEAK DUO L-G5.2..."
python camelot_cli.py \
    --output "$OUTPUT_DIR" \
    file ../../datasheet-input/Q_CELLS_Data_sheet_Q.PEAK_DUO_L-G5.2_395.pdf \
    --manufacturer "Q CELLS"

echo ""

# Process Hyperion datasheet
echo "Processing Hyperion 395-415W..."
python camelot_cli.py \
    --output "$OUTPUT_DIR" \
    file "../../datasheet-input/Hyperion 395-415W NEW.pdf" \
    --manufacturer "Hyperion"

echo ""
echo "================================================================================"
echo "BATCH PROCESSING COMPLETE"
echo "================================================================================"
echo ""
echo "Results saved to: $OUTPUT_DIR"
echo ""
echo "To view results:"
echo "  JSON: cat $OUTPUT_DIR/camelot_extracted_data_*.json"
echo "  CSV:  cat $OUTPUT_DIR/camelot_extracted_data_*.csv"
echo ""
