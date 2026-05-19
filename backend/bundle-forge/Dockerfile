# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Dependency layer — cached unless pom.xml changes
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

# Source + package (tests run separately in CI; skip here for image build speed)
COPY src src
RUN mvn -B -q -DskipTests package \
 && cp target/bundle-forge-*.jar /app/app.jar

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Non-root runtime user
RUN useradd --system --uid 1001 --create-home --home-dir /home/app app \
 && mkdir -p /app/uploads \
 && chown -R app:app /app

COPY --from=build --chown=app:app /app/app.jar /app/app.jar
COPY --chown=app:app entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

USER app
EXPOSE 8080

# JVM tuning via JAVA_OPTS (e.g. -Xmx512m). Spring profile selected via SPRING_PROFILES_ACTIVE.
# Entrypoint picks up /secrets/webhook-secret if the stripe-cli sidecar wrote it.
ENTRYPOINT ["/app/entrypoint.sh"]
