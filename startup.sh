#!/bin/sh
set -eu
cd /workspace
mkdir -p /workspace/data

restore_crm() {
  if [ -f /workspace/src/components/ZynloApp.tsx ] && [ -f /workspace/src/router.tsx ]; then
    return 0
  fi
  git clone --depth 1 https://github.com/sukilala/zynlo.git /tmp/zynlo-restore >/tmp/app-startup.log 2>&1 || return 0
  mkdir -p /workspace/src/routes /workspace/src/lib/zynlo /workspace/src/components /workspace/public
  cp /tmp/zynlo-restore/src/router.tsx /workspace/src/router.tsx
  cp /tmp/zynlo-restore/src/routeTree.gen.ts /workspace/src/routeTree.gen.ts
  cp /tmp/zynlo-restore/src/styles.css /workspace/src/styles.css
  cp /tmp/zynlo-restore/src/routes/__root.tsx /workspace/src/routes/__root.tsx
  cp /tmp/zynlo-restore/src/routes/index.tsx /workspace/src/routes/index.tsx
  cp /tmp/zynlo-restore/src/components/ZynloApp.tsx /workspace/src/components/ZynloApp.tsx
  cp /tmp/zynlo-restore/src/components/ui-bits.tsx /workspace/src/components/ui-bits.tsx
  cp /tmp/zynlo-restore/src/lib/cn.ts /workspace/src/lib/cn.ts
  cp -a /tmp/zynlo-restore/src/lib/zynlo/. /workspace/src/lib/zynlo/
  cp /tmp/zynlo-restore/public/apple-touch-icon.png \
     /tmp/zynlo-restore/public/favicon-32.png \
     /tmp/zynlo-restore/public/logo-icon.png \
     /tmp/zynlo-restore/public/logo-wordmark.png \
     /tmp/zynlo-restore/public/zynlo.html \
     /workspace/public/ 2>/dev/null || true
}

restore_crm

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
node scripts/preview.mjs stop >/dev/null 2>&1 || true
setsid npm run dev >>/tmp/app-startup.log 2>&1 </dev/null &
sleep 1
exit 0
