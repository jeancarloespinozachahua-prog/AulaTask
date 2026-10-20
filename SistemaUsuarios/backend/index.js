// Servidor Node.js + Express: API CRUD de usuarios
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(express.json()); // permite leer el cuerpo JSON de las peticiones
app.use(cors());         // permite que React (otro puerto) consuma la API

// CREATE -> INSERT -> POST
app.post('/usuarios', async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    if (!nombre || !correo) {
      return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
    }
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, correo) VALUES (?, ?)',
      [nombre, correo]
    );
    res.status(201).json({ message: 'Usuario registrado con éxito', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ -> SELECT -> GET (todos)
app.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ -> SELECT -> GET (uno por id)
app.get('/usuarios/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE -> UPDATE -> PUT
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    const [result] = await pool.execute(
      'UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?',
      [nombre, correo, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE -> DELETE -> DELETE
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
