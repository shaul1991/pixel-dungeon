#!/bin/bash
# Post-git hook
# Notifies about git changes

COMMAND="${CLAUDE_BASH_COMMAND:-}"

# Only process git commands
if [[ "$COMMAND" == git* ]]; then
    # Check for uncommitted changes after git operations
    if [[ "$COMMAND" == "git add"* ]] || [[ "$COMMAND" == "git commit"* ]]; then
        # Show brief status
        git status --short 2>/dev/null | head -5
    fi
fi

exit 0
