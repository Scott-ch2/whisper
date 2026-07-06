# Whisper Backend — Spring Boot Multi-stage Docker Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
RUN mkdir -p /app/data/uploads/audio /app/uploads /app/audio

EXPOSE 8088

ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/speech_translate?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=whisper123

ENTRYPOINT ["java", "-jar", "app.jar"]
