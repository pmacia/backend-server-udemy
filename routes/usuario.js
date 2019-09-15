// Declaración de liberías
const express = require('express');
const bcrypt = require('bcryptjs');

const auth = require('../middlewares/autenticacion').verificaToken;

// Inicializar variables
const app = express();
const Usuario = require('../models/usuario');

// -----------------------------------------------------
// Rutas
// -----------------------------------------------------

// -----------------------------------------------------
// Obtener todos los usuarios
// -----------------------------------------------------
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec( (err, usuarios ) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                });
            }

            Usuario.count({}, (err, totalReg) => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: totalReg
                });
            });

        });
});


// -----------------------------------------------------
// Crear un usuario
// -----------------------------------------------------
app.post('/', /*auth,*/ (req, res, next) => {
    const body = req.body;
    const usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            img: body.img,
            role: body.role
        });
    // const usuario = new Usuario(req.body);

    console.log("Solicitada petición POST /usuarios");
    console.log(body);
    console.log(usuario);

    usuario.save( (err, usuarioGuardado ) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        console.log(usuarioGuardado.token);
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioAutenticado: req.usuario
        });
    });
});


// -----------------------------------------------------
// Actualizar un usuario
// -----------------------------------------------------
app.put('/:id', auth, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error localizando al usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe`,
                errors: { message: "No existe un usuario con ese ID" }
            });
        }

        console.log (usuario);
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        console.log (usuario);

        usuario.save( (err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error actualizando el usuario',
                    errors: err
                });
            }

            console.log (usuarioGuardado);
            usuarioGuardado.password = '****';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});


// -----------------------------------------------------
// Eliminar un usuario
// -----------------------------------------------------
app.delete('/:id', auth, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error eliminando usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe`,
                errors: { message: "No existe un usuario con ese ID" }
            });
        }

        usuarioBorrado.password = '****';
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


module.exports = app;
