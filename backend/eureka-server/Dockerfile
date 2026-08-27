FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY build/libs/eureka-server-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-jar", "app.jar"]
