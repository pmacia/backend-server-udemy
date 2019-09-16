// Declaración de liberías
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

// Inicializar variables
const app = express();
const Usuario = require('../models/usuario');

// ============================================================
// Rutas
// ============================================================

// ============================================================
// Autenticación normal
// ============================================================
app.post('/', (req, res) => {
    const body = req.body;

    Usuario.findOne({email: body.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error localizando usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas (email)',
                errors: err
            });
        }

        if (!bcrypt.compareSync( body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas (password)',
                errors: err
            });   
        }

        // Creamos un token
        var expira = 14400; // 4 horas
        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: expira });

        usuario.password = '****';
        res.status(200).json({
            ok: true,
            usuario: usuario,
            id: usuario.id,
            token: token,
            menu: obtenerMenu(usuario.role)
        });
    });
});

// ============================================================
// Autenticación con Google
// ============================================================
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload
    };
}


app.post('/google', async (req, res) => {

    const token = req.body.token;

    const googleUser = await verify( token ).catch(( e => {
        res.status(403).json({
            ok: false,
            mensaje: 'Token no válido',
            error: e
        });   
    }));

    Usuario.findOne( {email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error localizando usuario',
                errors: err
            });
        }

        if (usuarioDB) {
            // El usuario sí existe...
            if (usuarioDB.google === false) {
                // Pero no es un usuario de Google
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No es un usuario de Google. Debe emplear su autenticación normal',
                    errors: err
                });                  
            } else {
                // Si es un usuario de Google, creamos un token
                const expira = 14400; // 4 horas
                const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: expira });

                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB.id,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role)
                });
            }
        } else {
            // El usuario no existe... hay que crearlo
            const usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = '****';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error guardando usuario de Google en DB',
                        errors: err
                    });
                }

                // Creamos un token
                const expira = 14400; // 4 horas
                const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: expira });

                usuario.password = '****';
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    id: usuarioDB.id,
                    token: token,
                    menu: obtenerMenu(usuarioDB.role)
                });
            });
        }
    });
});

function obtenerMenu( role ) {
    const menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard'},
            { titulo: 'ProressBar', url: '/progress'},
            { titulo: 'Gráficas', url: '/graficas1'},
            { titulo: 'Promesas', url: '/promesas'},
            { titulo: 'Observables', url: '/observables'}
          ]
        },
        {
          titulo: 'Mantenimiento',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url: '/usuarios'},
            { titulo: 'Hospitales', url: '/hospitales'},
            { titulo: 'Médicos', url: '/medicos'}
          ]
        }
      ];
    
    if ( role === 'ADMIN_ROLE' ) {
        menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios' } );
    }

    return menu;
}

module.exports = app;
