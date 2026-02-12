#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

BIN_DIR="$PROJECT_DIR/bin"
CLASS="LegacyBackend"
INPUT="$PROJECT_DIR/data/input.dat"
EXPECTED="$PROJECT_DIR/data/expected-output.txt"

if [ ! -f "$BIN_DIR/$CLASS.class" ]; then
    echo "Class file not found. Run ./scripts/build.sh first."
    exit 1
fi

ACTUAL=$(java -cp "$BIN_DIR" "$CLASS" "$INPUT")
EXPECTED_CONTENT=$(cat "$EXPECTED")

if [ "$ACTUAL" = "$EXPECTED_CONTENT" ]; then
    echo "PASS: Output matches expected results."
    exit 0
else
    echo "FAIL: Output does not match expected results."
    echo ""
    echo "=== EXPECTED ==="
    echo "$EXPECTED_CONTENT"
    echo ""
    echo "=== ACTUAL ==="
    echo "$ACTUAL"
    echo ""
    diff <(echo "$EXPECTED_CONTENT") <(echo "$ACTUAL") || true
    exit 1
fi
