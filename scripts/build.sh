#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

SRC="$PROJECT_DIR/src/legacy-backend.cbl"
BIN_DIR="$PROJECT_DIR/bin"
OUT="$BIN_DIR/legacy-backend"

mkdir -p "$BIN_DIR"

echo "Compiling $SRC ..."
cobc -x -o "$OUT" "$SRC"
echo "Build successful: $OUT"
