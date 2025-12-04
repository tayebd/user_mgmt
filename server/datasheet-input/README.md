# Datasheet Input Configuration

This directory contains the input configuration for the PDF datasheet processing utility.

## Structure

```
datasheet-input/
├── README.md                          # This file
├── input-config.json                  # Main configuration file
├── PDFs/                              # Place your PDF datasheets here
│   ├── Q_CELLS_Q.PEAK_DUO_L-G5.2_395.pdf
│   ├── manufacturer1_panel_model.pdf
│   └── ...
└── processing-logs/                   # Generated during processing
    ├── 2025-11-03_processing.log
    └── extracted_data_2025-11-03.json
```

## Usage

1. Place your PDF datasheets in the `PDFs/` folder
2. Edit `input-config.json` to specify which files to process
3. Run the datasheet processor from the `/server/pvlib_api/` directory:

```bash
python datasheet_cli.py --config ../datasheet-input/input-config.json
```

## Input Configuration Format

See `input-config.json` for the configuration schema.
