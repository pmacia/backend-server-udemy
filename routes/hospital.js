// Declaración de liberías
const express = require('express');
const bcrypt = require('bcryptjs');

const auth = require('../middlewares/autenticacion').verificaToken;

// Inicializar variables
const app = express();
const Usuario = require('../models/usuario');
const Hospital = require('../models/hospital');

// -----------------------------------------------------
// Rutas
// -----------------------------------------------------

// -----------------------------------------------------
// Obtener todos los hospitales
// -----------------------------------------------------
app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec( (err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, totalReg) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: totalReg
                });
            });
        });
});


// -----------------------------------------------------
// Crear un hospital
// -----------------------------------------------------
app.post('/', auth, (req, res) => {
    const hospital = new Hospital(req.body);

    hospital.usuario = req.usuario;

    hospital.save( (err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        console.log(hospitalGuardado.token);
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuario_autenticado: req.usuario
        });
    });
});


// -----------------------------------------------------
// Actualizar un hospital
// -----------------------------------------------------
app.put('/:id', auth, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error localizando el hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: { message: "No existe un hospital con ese ID" }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario;

        hospital.save( (err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});


// -----------------------------------------------------
// Eleminar un hospital
// -----------------------------------------------------
app.delete('/:id', auth, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminando hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: { message: "No existe un hospital con ese ID" }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;
