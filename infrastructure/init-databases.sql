-- SQL Initialization script for XBS Labs Microservices Databases
-- Automatically executed on PostgreSQL container startup

-- 1. Auth & Identity Microservice Database
CREATE DATABASE naqashly_auth_db;
CREATE USER auth_user WITH ENCRYPTED PASSWORD 'auth_password_123';
GRANT ALL PRIVILEGES ON DATABASE naqashly_auth_db TO auth_user;

-- 2. Finance & Ledger Microservice Database
CREATE DATABASE naqashly_finance_db;
CREATE USER finance_user WITH ENCRYPTED PASSWORD 'finance_password_123';
GRANT ALL PRIVILEGES ON DATABASE naqashly_finance_db TO finance_user;

-- 3. Productivity & Habits Microservice Database
CREATE DATABASE naqashly_productivity_db;
CREATE USER productivity_user WITH ENCRYPTED PASSWORD 'productivity_password_123';
GRANT ALL PRIVILEGES ON DATABASE naqashly_productivity_db TO productivity_user;

-- 4. Journal Microservice Database
CREATE DATABASE naqashly_journal_db;

-- 5. Routine Microservice Database
CREATE DATABASE naqashly_routine_db;

