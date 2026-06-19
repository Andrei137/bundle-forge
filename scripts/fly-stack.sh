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
#   scripts/fly-stack.sh build     # rebuild & deploy all apps from source (data layer first)
#   scripts/fly-stack.sh start     # start all machines (data layer first)
#   scripts/fly-stack.sh stop      # stop all machines (frontend first)
#   scripts/fly-stack.sh restart   # stop then start
#   scripts/fly-stack.sh status    # show each app's machine state
#
# flyctl is provided via devbox (see devbox.json). If `devbox` is on PATH we
# run flyctl through it; otherwise we fall back to a flyctl already on PATH.

set -euo pipefail

# Resolve the repo root from this script's location so paths work from any cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Dependency order for starting. Stopping uses the reverse.
START_ORDER=(bundle-forge-mysql bundle-forge-redis bundle-forge-api bundle-forge-web)

# Directory holding each app's fly.toml — also the Docker build context for the
# apps that build from source (api, web). mysql/redis deploy a prebuilt image.
app_dir() {
  case "$1" in
    bundle-forge-mysql) echo "$REPO_ROOT/deploy/mysql" ;;
    bundle-forge-redis) echo "$REPO_ROOT/deploy/redis" ;;
    bundle-forge-api)   echo "$REPO_ROOT/backend/bundle-forge" ;;
    bundle-forge-web)   echo "$REPO_ROOT/frontend" ;;
    *) echo "error: unknown app '$1'" >&2; return 1 ;;
  esac
}

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

# Resolve the frontend's Stripe publishable key (baked into the bundle at build
# time). Prefer an exported env var; otherwise read it from the repo-root .env.
stripe_publishable_key() {
  if [[ -n "${VITE_STRIPE_PUBLISHABLE_KEY:-}" ]]; then
    printf '%s' "$VITE_STRIPE_PUBLISHABLE_KEY"
    return
  fi
  if [[ -f "$REPO_ROOT/.env" ]]; then
    grep -E '^[[:space:]]*VITE_STRIPE_PUBLISHABLE_KEY[[:space:]]*=' "$REPO_ROOT/.env" \
      | tail -1 | cut -d= -f2- \
      | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^["'\'']//' -e 's/["'\'']$//'
  fi
}

cmd_build() {
  echo "Rebuilding and deploying Bundle Forge stack (data layer first)..."
  local pk
  pk="$(stripe_publishable_key)"
  if [[ -z "$pk" ]]; then
    echo "  warning: VITE_STRIPE_PUBLISHABLE_KEY not found (env or .env); frontend Stripe will be unconfigured" >&2
  fi

  for app in "${START_ORDER[@]}"; do
    local dir
    dir="$(app_dir "$app")"
    echo
    echo ">> $app: rebuilding and deploying from $dir"

    local args=(deploy "$dir" --config "$dir/fly.toml" --app "$app")
    # The frontend bakes the Stripe key in at build time via --build-arg.
    if [[ "$app" == "bundle-forge-web" && -n "$pk" ]]; then
      args+=(--build-arg "VITE_STRIPE_PUBLISHABLE_KEY=$pk")
    fi

    # Run flyctl directly (not the fly() filter) so build output streams and a
    # failed deploy aborts the run before dependent apps are touched.
    "${FLY[@]}" "${args[@]}"
  done
  echo
  echo "Done. Backend: https://bundle-forge-api.fly.dev  Frontend: https://bundle-forge-web.fly.dev"
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
  build)   cmd_build ;;
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; cmd_start ;;
  status)  cmd_status ;;
  *)
    echo "Usage: $0 {build|start|stop|restart|status}" >&2
    exit 2
    ;;
esac
