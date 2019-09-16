// Declaración de liberías
const express = require('express');

// Inicializar variables
const app = express();

const Usuario = require('../models/usuario');
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');

// -----------------------------------------------------
// Buscar en una colección concreta
// -----------------------------------------------------
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');
    var coleccion = req.params.tabla;

    var promesa;
  
    switch ( coleccion ) {
        case 'medicos': 
            promesa = buscarMedicos( busqueda, regex);
            break;
        case 'hospitales': 
            promesa = buscarHospitales( busqueda, regex);
            break;
        case 'usuarios': 
            promesa = buscarUsuarios( busqueda, regex);
            break;
        default:
            return res.status(403).json({
                ok: false,
                mensage: "La colección no existe."
            });
    }

    promesa.then( respuestas => {
        res.status(200).json({
            ok: true,
            [coleccion]: respuestas
        });
    });
});


// -----------------------------------------------------
// Buscar en todas las colecciones
// -----------------------------------------------------
app.get('/todo/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i');
  
    Promise.all([
        buscarHospitales( busqueda, regex ), 
        buscarMedicos( busqueda, regex ), 
        buscarUsuarios( busqueda, regex )
    ]).then( respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});


function buscarHospitales( busqueda, regex ) {
    return new Promise( (resolve, reject) => {
        Hospital.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .exec( (err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });    
    });
}

function buscarMedicos( busqueda, regex ) {
    return new Promise( (resolve, reject) => {
        Medico.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec( (err, medicos) => {
                if (err) {
                    reject('Error al cargar médicos', err);
                } else {
                    resolve(medicos);
                }
            });    
    });
}

function buscarUsuarios( busqueda, regex ) {
    return new Promise( (resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([ { 'nombre': regex }, { 'email': regex } ])
            .exec( (err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });    
    });
}


module.exports = app;
