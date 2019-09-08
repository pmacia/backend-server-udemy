// Declaración de liberías
const express = require('express');

// Inicializar variables
const app = express();

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Hola Mundo!'
    });
});

module.exports = app;
