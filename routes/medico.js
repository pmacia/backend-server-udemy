// Declaración de liberías
const express = require('express');
const bcrypt = require('bcryptjs');

const auth = require('../middlewares/autenticacion').verificaToken;

// Inicializar variables
const app = express();
const Medico = require('../models/medico');

// -----------------------------------------------------
// Rutas
// -----------------------------------------------------

// -----------------------------------------------------
// Obtener todos los medicos
// -----------------------------------------------------
app.get('/', (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);
   
    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec( (err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, totalReg) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: totalReg
                });
            });
        });
});


// -----------------------------------------------------
// Crear un medico
// -----------------------------------------------------
app.post('/', auth, (req, res) => {
    const medico = new Medico(req.body);

    medico.usuario = req.usuario;

    medico.save( (err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        console.log(medicoGuardado.token);
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuario_autenticado: req.usuario
        });
    });
});


// -----------------------------------------------------
// Actualizar un medico
// -----------------------------------------------------
app.put('/:id', auth, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error localizando el medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe`,
                errors: { message: "No existe un medico con ese ID" }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario;

        medico.save( (err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando el medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});


// -----------------------------------------------------
// Eleminar un medico
// -----------------------------------------------------
app.delete('/:id', auth, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminando medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe`,
                errors: { message: "No existe un medico con ese ID" }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;
