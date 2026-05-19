#!/bin/sh
# Backend container entrypoint.
#
# When running under the `stripe` compose profile, the stripe-cli sidecar
# writes the live webhook signing secret to /secrets/webhook-secret (shared
# docker volume). Prefer that over $STRIPE_WEBHOOK_SECRET so the latest secret
# from the listener wins even if .env still has a stale value.

set -e

if [ -s /secrets/webhook-secret ]; then
  STRIPE_WEBHOOK_SECRET="$(cat /secrets/webhook-secret)"
  export STRIPE_WEBHOOK_SECRET
fi

exec java $JAVA_OPTS -jar /app/app.jar
