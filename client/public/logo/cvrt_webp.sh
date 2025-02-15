#!/bin/bash

# Check if directory is provided as argument
if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory_path>"
    exit 1
fi

directory="$1"

# Check if directory exists
if [ ! -d "$directory" ]; then
    echo "Error: Directory '$directory' does not exist"
    exit 1
fi

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "Error: cwebp is not installed. Please install it first."
    echo "On Ubuntu/Debian: sudo apt-get install webp"
    echo "On CentOS/RHEL: sudo yum install libwebp-tools"
    echo "On macOS: brew install webp"
    exit 1
fi

# Counter for converted files
converted=0

# Find all PNG files and convert them
find "$directory" -type f -name "*.png" | while read -r png_file; do
    # Get the filename without extension
    filename="${png_file%.*}"
    
    # Convert PNG to WebP
    if cwebp -q 80 "$png_file" -o "${filename}.webp"; then
        echo "Converted: $png_file -> ${filename}.webp"
        ((converted++))
    else
        echo "Failed to convert: $png_file"
    fi
done

echo "Conversion complete. Converted $converted files."
