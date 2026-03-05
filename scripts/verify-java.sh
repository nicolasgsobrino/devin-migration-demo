#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

JAVA_OUT="$PROJECT_DIR/java-backend/out"
MAIN_CLASS="com.banking.LegacyBackend"
INPUT="$PROJECT_DIR/data/input.dat"
EXPECTED="$PROJECT_DIR/data/expected-output.txt"

if [ ! -d "$JAVA_OUT/com/banking" ]; then
    echo "Java classes not found. Run ./scripts/build-java.sh first."
    exit 1
fi

ACTUAL=$(java -cp "$JAVA_OUT" "$MAIN_CLASS" "$INPUT" | sed 's/"created": "[^"]*"/"created": "TIMESTAMP"/g')
EXPECTED_CONTENT=$(cat "$EXPECTED" | sed 's/"created": "[^"]*"/"created": "TIMESTAMP"/g')

if [ "$ACTUAL" = "$EXPECTED_CONTENT" ]; then
    echo "PASS: Java output matches expected results."
    exit 0
else
    echo "FAIL: Java output does not match expected results."
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
