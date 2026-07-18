FROM openjdk:17-slim

WORKDIR /app

# Copy Maven wrapper
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Build application
RUN chmod +x mvnw && ./mvnw clean install -DskipTests

# Copy source
COPY src src

# Build final JAR
RUN ./mvnw clean package -DskipTests

FROM openjdk:17-slim
WORKDIR /app

# Copy built JAR from builder
COPY --from=0 /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
