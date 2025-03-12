#!/bin/bash

# Compile TypeScript files
echo "Compiling TypeScript files..."
npx tsc -p ../tsconfig.json

# Run the test script
echo "Running survey response test..."
node dist/tests/survey-response-test.js

# Check the exit code
if [ $? -eq 0 ]; then
  echo "Test completed successfully!"
else
  echo "Test failed. Check the logs for details."
fi
