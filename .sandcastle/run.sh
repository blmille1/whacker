#!/usr/bin/env bash
# Run sandcastle and tee all output to a timestamped log file under .sandcastle/logs/.
# Usage: bash .sandcastle/run.sh

set -euo pipefail

LOG_DIR=".sandcastle/logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="$LOG_DIR/run-$TIMESTAMP.log"

echo "Logging to $LOG_FILE"

npx tsx .sandcastle/main.ts 2>&1 | tee "$LOG_FILE"
