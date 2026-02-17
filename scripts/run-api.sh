#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
API_DIR="$PROJECT_DIR/api"

echo "Installing Python dependencies..."
pip install -r "$API_DIR/requirements.txt" --quiet

echo "Starting Flask API on port 5000..."
cd "$API_DIR"
python app.py
