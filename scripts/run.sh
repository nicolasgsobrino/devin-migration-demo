#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

BIN_DIR="$PROJECT_DIR/bin"
CLASS="LegacyBackend"
INPUT_FILE="${1:-$PROJECT_DIR/data/input.dat}"

if [ ! -f "$BIN_DIR/$CLASS.class" ]; then
    echo "Class file not found. Run ./scripts/build.sh first."
    exit 1
fi

echo "Running legacy-backend (Java) with input: $INPUT_FILE"
echo "---"
java -cp "$BIN_DIR" "$CLASS" "$INPUT_FILE"
