FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY build/libs/auth-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
