#!/bin/bash
# Post-edit hook for TypeScript files
# Runs type check on edited TypeScript files

FILE_PATH="${CLAUDE_FILE_PATH:-}"

# Only process TypeScript files
if [[ "$FILE_PATH" == *.ts ]]; then
    # Check if tsc is available
    if command -v npx &> /dev/null; then
        # Run type check (non-blocking)
        npx tsc --noEmit 2>/dev/null &
    fi
fi

exit 0
