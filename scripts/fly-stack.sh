#!/usr/bin/env bash
#
# Start / stop / inspect the Bundle Forge stack on Fly.io.
#
# The stack is four separate Fly apps (see deploy/*/fly.toml and the per-app
# fly.toml under backend/ and frontend/):
#
#   bundle-forge-mysql   data layer (private)
#   bundle-forge-redis   data layer (private)
#   bundle-forge-api     Spring Boot backend (public)
#   bundle-forge-web     Nginx/React frontend (public)
#
# Stopping the machines halts compute billing while preserving the apps and
# their volumes (DB / Redis / uploads data is kept). Starting brings them back.
#
# Order matters: the backend needs MySQL and Redis up first, so we start in
# dependency order and stop in reverse.
#
# Usage:
#   scripts/fly-stack.sh start     # start all machines (data layer first)
#   scripts/fly-stack.sh stop      # stop all machines (frontend first)
#   scripts/fly-stack.sh restart   # stop then start
#   scripts/fly-stack.sh status    # show each app's machine state
#
# flyctl is provided via devbox (see devbox.json). If `devbox` is on PATH we
# run flyctl through it; otherwise we fall back to a flyctl already on PATH.

set -euo pipefail

# Dependency order for starting. Stopping uses the reverse.
START_ORDER=(bundle-forge-mysql bundle-forge-redis bundle-forge-api bundle-forge-web)

# Resolve how to invoke flyctl.
if command -v devbox >/dev/null 2>&1; then
  FLY=(devbox run -- flyctl)
elif command -v flyctl >/dev/null 2>&1; then
  FLY=(flyctl)
else
  echo "error: neither devbox nor flyctl found on PATH" >&2
  exit 1
fi

fly() {
  # Strip devbox's noisy "Info:" lines so output stays readable.
  "${FLY[@]}" "$@" 2>&1 | grep -v '^Info:' || true
}

# Print the machine IDs for an app, space-separated.
machine_ids() {
  local app="$1"
  "${FLY[@]}" machine list -a "$app" --json 2>/dev/null \
    | grep -v '^Info:' \
    | python3 -c "import sys, json; print(' '.join(m['id'] for m in json.load(sys.stdin)))" 2>/dev/null \
    || true
}

do_action() {
  local action="$1" app="$2"
  local ids
  ids="$(machine_ids "$app")"
  if [[ -z "$ids" ]]; then
    echo "  $app: no machines found (skipped)"
    return
  fi
  for id in $ids; do
    echo "  $app: $action machine $id"
    fly machine "$action" "$id" -a "$app" >/dev/null
  done
}

cmd_start() {
  echo "Starting Bundle Forge stack (data layer first)..."
  for app in "${START_ORDER[@]}"; do
    do_action start "$app"
  done
  echo "Done. Backend: https://bundle-forge-api.fly.dev  Frontend: https://bundle-forge-web.fly.dev"
}

cmd_stop() {
  echo "Stopping Bundle Forge stack (frontend first)..."
  # Reverse of START_ORDER.
  for (( i=${#START_ORDER[@]}-1; i>=0; i-- )); do
    do_action stop "${START_ORDER[$i]}"
  done
  echo "Done. Machines stopped; apps and volumes (data) preserved."
}

cmd_status() {
  for app in "${START_ORDER[@]}"; do
    local line
    line="$("${FLY[@]}" status -a "$app" 2>/dev/null | grep -v '^Info:' | grep -E '^ app ' | head -1)"
    printf '  %-22s %s\n' "$app" "$(echo "$line" | awk -F'│' '{gsub(/ /,"",$5); print "state=" $5}')"
  done
}

case "${1:-}" in
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; cmd_start ;;
  status)  cmd_status ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}" >&2
    exit 2
    ;;
esac
