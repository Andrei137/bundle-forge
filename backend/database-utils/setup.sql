-- Create database
DROP DATABASE IF EXISTS `<DB_NAME>`;
CREATE DATABASE `<DB_NAME>`;
USE `<DB_NAME>`;

-- Create user
DROP USER IF EXISTS '<DB_USER>'@'localhost';
CREATE USER '<DB_USER>'@'localhost' IDENTIFIED BY '<DB_PASS>';
GRANT ALL ON `<DB_NAME>`.* TO '<DB_USER>'@'localhost';
