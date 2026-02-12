#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

SRC="$PROJECT_DIR/src/LegacyBackend.java"
BIN_DIR="$PROJECT_DIR/bin"

mkdir -p "$BIN_DIR"

echo "Compiling $SRC ..."
javac -d "$BIN_DIR" "$SRC"
echo "Build successful: $BIN_DIR/LegacyBackend.class"
