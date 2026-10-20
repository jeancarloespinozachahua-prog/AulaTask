# Sistema de Usuarios (Node.js + Express + MySQL + React)

SENATI - Fullstack Developer Software - Trabajo grupal integrador.

## Requisitos
- Node.js LTS y npm  (`node -v` y `npm -v`)
- MySQL en ejecución (XAMPP o servidor local)

## 1. Base de datos
Ejecutar el script `backend/schema.sql` en MySQL (phpMyAdmin o consola):
    mysql -u root < backend/schema.sql

## 2. Backend (puerto 3000)
    cd backend
    npm install
    npm start
Ajustar usuario/contraseña de MySQL en `backend/.env` si es necesario.

## 3. Frontend (puerto 5173)
    cd frontend
    npm install
    npm run dev
Abrir http://localhost:5173

## Rutas de la API
| Operación | SQL    | Ruta                | Método |
|-----------|--------|---------------------|--------|
| CREATE    | INSERT | /usuarios           | POST   |
| READ      | SELECT | /usuarios, /usuarios/:id | GET |
| UPDATE    | UPDATE | /usuarios/:id       | PUT    |
| DELETE    | DELETE | /usuarios/:id       | DELETE |
