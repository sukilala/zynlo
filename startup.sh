#!/bin/sh
set -eu
cd /workspace
mkdir -p /workspace/data
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
node scripts/preview.mjs stop >/dev/null 2>&1 || true
setsid npm run dev >>/tmp/app-startup.log 2>&1 </dev/null &
sleep 1
exit 0
