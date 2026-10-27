# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Production Runtime
FROM eclipse-temurin:21-jre-alpine AS runner
WORKDIR /app

# Security: Run as unprivileged user
RUN addgroup -S chessgroup && adduser -S chessuser -G chessgroup

# Install curl/wget for container healthcheck
RUN apk add --no-cache wget

# Copy packaged jar from builder stage
COPY --from=builder --chown=chessuser:chessgroup /workspace/target/*.jar app.jar

USER chessuser:chessgroup

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/health || exit 1

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
