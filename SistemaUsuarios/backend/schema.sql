-- Script de base de datos para el Sistema de Usuarios
CREATE DATABASE IF NOT EXISTS sistema_db CHARACTER SET utf8mb4;
USE sistema_db;

CREATE TABLE IF NOT EXISTS usuarios (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE
);
