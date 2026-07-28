@echo off
echo =========================================================================
echo Naqashly Life OS — Development Microservices Bootstrapper
echo =========================================================================

echo [1/7] Starting Eureka Discovery Server (Port 8761)...
start "Naqashly - Eureka Server" /D "%~dp0backend\eureka-server" cmd /k gradlew.bat bootRun
echo Waiting 8 seconds for Eureka to bootstrap...
timeout /t 8

echo [2/7] Starting API Gateway (Port 8080)...
start "Naqashly - API Gateway" /D "%~dp0backend\api-gateway" cmd /k gradlew.bat bootRun
timeout /t 2

echo [3/7] Starting Auth Service (Port 8081)...
start "Naqashly - Auth Service" /D "%~dp0backend\auth-service" cmd /k gradlew.bat bootRun
timeout /t 2

echo [4/7] Starting Journal Service (Port 8086)...
start "Naqashly - Journal Service" /D "%~dp0backend\journal-service" cmd /k gradlew.bat bootRun

echo [5/7] Starting Finance Service (Port 8082)...
start "Naqashly - Finance Service" /D "%~dp0backend\finance-service" cmd /k gradlew.bat bootRun

echo [6/7] Starting Productivity Service (Port 8083)...
start "Naqashly - Productivity Service" /D "%~dp0backend\productivity-service" cmd /k gradlew.bat bootRun

echo [7/7] Starting Routine Service (Port 8085)...
start "Naqashly - Routine Service" /D "%~dp0backend\routine-service" cmd /k gradlew.bat bootRun

echo =========================================================================
echo Microservices start commands dispatched to separate windows.
echo =========================================================================
