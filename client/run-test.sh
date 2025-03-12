#!/bin/bash

# Script to run Jest tests for files with special characters in their paths
# Specifically designed for Next.js dynamic routes with square brackets

# Escape the square brackets in the file path
TEST_PATH=$(echo "$1" | sed 's/\[/\\[/g' | sed 's/\]/\\]/g')

# Run Jest with the escaped path
npx jest "$TEST_PATH"
