#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

BIN="$PROJECT_DIR/bin/legacy-backend"
INPUT_FILE="${1:-$PROJECT_DIR/data/input.dat}"

if [ ! -f "$BIN" ]; then
    echo "Binary not found. Run ./scripts/build.sh first."
    exit 1
fi

echo "Running legacy-backend with input: $INPUT_FILE"
echo "---"
"$BIN" "$INPUT_FILE"
