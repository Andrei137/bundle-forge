#!/usr/bin/env bash
#
# Run the Stripe CLI (in Docker, on the host network) to forward live Stripe
# events to the backend at http://localhost:8080/payment/webhook/stripe, parse
# the signing secret it prints on startup into the root .env, then recreate the
# backend container so it picks up the new secret. The CLI keeps streaming in
# the foreground until you Ctrl-C.
#
# Usage:
#   ./scripts/sync-stripe-webhook.sh
#
# Requires:
#   - docker compose available on PATH
#   - root .env present with a real STRIPE_API_KEY (sk_test_… or sk_live_…)
#   - backend reachable on localhost:8080 (the compose `backend` service)
#

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "${SCRIPT_DIR}/.."

if [[ ! -f .env ]]; then
  echo "error: .env not found. Copy .env.example to .env and fill it in first." >&2
  exit 1
fi

STRIPE_API_KEY=$(grep -E '^STRIPE_API_KEY=' .env | head -1 | cut -d= -f2- || true)

if [[ -z "${STRIPE_API_KEY}" || "${STRIPE_API_KEY}" == *YOUR_* ]]; then
  echo "error: STRIPE_API_KEY in .env is missing or still set to a placeholder." >&2
  echo "       Set it to a real test-mode key (sk_test_…) before running this script." >&2
  exit 1
fi

CONTAINER=bundleforge-stripe-cli-listen
LOG=$(mktemp)

cleanup() {
  docker stop "${CONTAINER}" >/dev/null 2>&1 || true
  rm -f "${LOG}"
}
trap cleanup EXIT

# Clear any leftover container from a previous interrupted run.
docker rm -f "${CONTAINER}" >/dev/null 2>&1 || true

echo "→ Starting Stripe CLI listener (host network → http://localhost:8080)…"
docker run --rm --network host --name "${CONTAINER}" \
  -e STRIPE_API_KEY="${STRIPE_API_KEY}" \
  stripe/stripe-cli:latest \
  listen --forward-to http://localhost:8080/payment/webhook/stripe \
  2>&1 | tee "${LOG}" &

# Wait up to 30s for the "Your webhook signing secret is whsec_…" line.
SECRET=""
for _ in $(seq 1 60); do
  if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
    echo "error: stripe-cli container exited before printing a secret." >&2
    exit 1
  fi
  if [[ -s "${LOG}" ]]; then
    SECRET=$(grep -oE 'whsec_[A-Za-z0-9]+' "${LOG}" | head -1 || true)
    [[ -n "${SECRET}" ]] && break
  fi
  sleep 0.5
done

if [[ -z "${SECRET}" ]]; then
  echo "error: timed out waiting for a whsec_… secret in the Stripe CLI output." >&2
  exit 1
fi

echo "→ Got signing secret: ${SECRET}"

if grep -qE '^STRIPE_WEBHOOK_SECRET=' .env; then
  # Use a delimiter that can't appear in a Stripe secret to keep sed simple.
  sed -i.bak "s|^STRIPE_WEBHOOK_SECRET=.*$|STRIPE_WEBHOOK_SECRET=${SECRET}|" .env
  rm -f .env.bak
else
  printf '\nSTRIPE_WEBHOOK_SECRET=%s\n' "${SECRET}" >> .env
fi
echo "→ Updated STRIPE_WEBHOOK_SECRET in .env"

echo "→ Recreating the backend container so it reads the new secret…"
docker compose up -d --force-recreate --no-deps backend >/dev/null

echo "→ Stripe CLI is forwarding webhooks. Ctrl-C to stop."
wait
