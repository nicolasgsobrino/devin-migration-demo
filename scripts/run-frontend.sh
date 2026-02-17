#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm install --quiet

echo "Starting React frontend on port 3000..."
npm start
