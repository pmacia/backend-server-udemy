const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;


// -----------------------------------------------------
// Veridficar token
// -----------------------------------------------------
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};

// -----------------------------------------------------
// Veridficar Admin
// -----------------------------------------------------
exports.verificaAdminRole = function(req, res, next) {
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    }

    return res.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto - No es administrador',
        errors: { message: 'No es administrador, no puede hacer eso' }
    });
};

// -----------------------------------------------------
// Veridficar Admin o el propio usuario
// -----------------------------------------------------
exports.verificaAdminRole_o_MismoUsuario = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {
        next();
        return;
    }

    return res.status(401).json({
        ok: false,
        mensaje: 'Token incorrecto - No es administrador o el propietario del registro',
        errors: { message: 'No es administrador ni propietario, no puede hacer eso' }
    });
};
