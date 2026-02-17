#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== COBOL Banking System - Full Stack ==="
echo ""

echo "Step 1: Building COBOL backend..."
bash "$SCRIPT_DIR/build.sh"
echo ""

echo "Step 2: Starting Flask API (background)..."
bash "$SCRIPT_DIR/run-api.sh" &
API_PID=$!
sleep 3
echo "API running (PID: $API_PID)"
echo ""

echo "Step 3: Starting React frontend..."
bash "$SCRIPT_DIR/run-frontend.sh"

kill $API_PID 2>/dev/null || true
