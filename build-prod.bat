@echo off
echo =========================================================================
echo Building Naqashly Production Artifacts (Pre-Built JARs ^& Frontend Dist)
echo =========================================================================


echo [1/7] Building Auth Service JAR...
cd /d "%~dp0backend\auth-service"
call gradlew.bat bootJar --no-daemon -x test

echo [2/7] Building API Gateway JAR...
cd /d "%~dp0backend\api-gateway"
call gradlew.bat bootJar --no-daemon -x test

echo [3/7] Building Journal Service JAR...
cd /d "%~dp0backend\journal-service"
call gradlew.bat bootJar --no-daemon -x test

echo [4/7] Building Finance Service JAR...
cd /d "%~dp0backend\finance-service"
call gradlew.bat bootJar --no-daemon -x test

echo [5/7] Building Productivity Service JAR...
cd /d "%~dp0backend\productivity-service"
call gradlew.bat bootJar --no-daemon -x test

echo [6/7] Building Routine Service JAR...
cd /d "%~dp0backend\routine-service"
call gradlew.bat bootJar --no-daemon -x test

echo [7/7] Building Frontend Static Dist...
cd /d "%~dp0frontend"
call npm run build

echo =========================================================================
echo ALL PRODUCTION ARTIFACTS BUILT SUCCESSFULLY!
echo =========================================================================
