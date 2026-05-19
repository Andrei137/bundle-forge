#!/bin/sh
#
# Entrypoint for the `stripe-cli` sidecar in docker-compose.yml.
#
# Runs when the `stripe` compose profile is active. Three things happen here
# before the long-running listener takes over:
#
#   1. Pull the webhook signing secret from the Stripe CLI. The CLI persists
#      its config under /root/.config/stripe (a docker volume on this service),
#      so this returns the same `whsec_…` on subsequent runs.
#   2. Publish that secret into /secrets/webhook-secret on a shared docker
#      volume. The backend mounts the same volume read-only and reads the
#      file at JVM start (see backend/bundle-forge/entrypoint.sh).
#   3. Sync the secret back into the host's .env so that future `docker
#      compose up` invocations resolve $STRIPE_WEBHOOK_SECRET correctly,
#      including when running without the `stripe` profile.
#
# Then exec the long-running `stripe listen --forward-to …` listener, which
# forwards live Stripe events to the backend over the compose network.

set -eu

SECRET=$(stripe listen --print-secret 2>/dev/null | tr -d '\r\n' || true)

case "$SECRET" in
  whsec_*) ;;
  *)
    echo "stripe-cli-entrypoint: expected a whsec_… secret, got: ${SECRET:-<empty>}" >&2
    exit 1
    ;;
esac

# Shared docker volume → consumed by the backend container's entrypoint.
printf '%s' "$SECRET" > /secrets/webhook-secret
echo "stripe-cli-entrypoint: wrote /secrets/webhook-secret"

# Host .env sync. Write through a temp file and `cat` back so the bind-mounted
# .env keeps its original inode and host ownership.
if [ -f /host/.env ]; then
  if grep -qE '^STRIPE_WEBHOOK_SECRET=' /host/.env; then
    awk -v secret="$SECRET" '
      /^STRIPE_WEBHOOK_SECRET=/ { print "STRIPE_WEBHOOK_SECRET=" secret; next }
      { print }
    ' /host/.env > /tmp/.env.new
    cat /tmp/.env.new > /host/.env
    rm -f /tmp/.env.new
  else
    printf '\nSTRIPE_WEBHOOK_SECRET=%s\n' "$SECRET" >> /host/.env
  fi
  echo "stripe-cli-entrypoint: synced STRIPE_WEBHOOK_SECRET to /host/.env"
else
  echo "stripe-cli-entrypoint: /host/.env not mounted, skipping .env sync"
fi

exec stripe listen --forward-to http://backend:8080/payment/webhook/stripe
