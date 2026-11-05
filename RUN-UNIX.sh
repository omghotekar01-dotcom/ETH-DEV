#!/bin/sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22+ required: https://nodejs.org/" >&2
  exit 1
fi
printf '%s\n' 'RIFT - LOCAL TRAINING SANDBOX' 'Open http://localhost:3000' 'Press Ctrl+C to stop.'
exec node server/index.mjs
