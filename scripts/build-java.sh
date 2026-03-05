#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

JAVA_SRC="$PROJECT_DIR/java-backend/src/main/java/com/banking"
OUT_DIR="$PROJECT_DIR/java-backend/out"

mkdir -p "$OUT_DIR"

echo "Compiling Java backend ..."
javac -d "$OUT_DIR" "$JAVA_SRC"/*.java
echo "Build successful: $OUT_DIR"
