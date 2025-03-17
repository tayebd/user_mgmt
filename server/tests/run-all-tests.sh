#!/bin/bash

# Compile TypeScript files
echo "Compiling TypeScript files..."
npx tsc -p ../tsconfig.json

# Run all Jest tests
echo "Running all tests..."
npx jest

# Check the exit code
if [ $? -eq 0 ]; then
  echo "All tests completed successfully!"
else
  echo "Some tests failed. Check the logs for details."
fi
