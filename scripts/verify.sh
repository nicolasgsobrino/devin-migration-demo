#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

BIN="$PROJECT_DIR/bin/legacy-backend"
INPUT="$PROJECT_DIR/data/input.dat"
EXPECTED="$PROJECT_DIR/data/expected-output.txt"

if [ ! -f "$BIN" ]; then
    echo "Binary not found. Run ./scripts/build.sh first."
    exit 1
fi

ACTUAL=$("$BIN" "$INPUT")
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
