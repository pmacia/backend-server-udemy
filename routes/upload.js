// Declaración de liberías
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');

// Inicializar variables
const app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.post('/upload', function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

// Rutas
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if( tiposValidos.indexOf( tipo ) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Colección no soportada',
            errors: { message: 'Las colecciones válidas son: ' + tiposValidos.join(', ') }
        });
    }

    if( !req.files) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No seleccionó nada',
                errors: { message: 'Debe de seleccionar una imagen' }
            });
    }

    // Obtenmeos el nombre del archivo
    var archivo = req.files.imagen;
    var nombreDesglosado = archivo.name.split('.');
    var extArchivo = nombreDesglosado[nombreDesglosado.length-1];
    var extValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extValidas.indexOf(extArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no soportada',
            errors: { message: 'Las extensiones válidas son: ' + extValidas.join(', ') }
        });
    }

    // Crear un nombre personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extArchivo}`;
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });        
        }
    });

    subirPorTipo(tipo,  id, nombreArchivo, res );
});

function subirPorTipo(tipo,  id, nombreArchivo, res ) {
    if (tipo === 'usuarios') {
        Usuario.findById( id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario',
                    errors: err
                });                            
            }
            var pathAnterior = './uploads/usuarios/' + (usuario.img ? usuario.img : 'xxx.img');
            console.log(pathAnterior);
            if (fs.existsSync(pathAnterior)) {
                console.log('Eliminando archivo');
                fs.unlinkSync( pathAnterior );
            }
            usuario.img = nombreArchivo;
            console.log('guardando nuevo nombre de archivo');
            usuario.save( (err, usuarioActualizado) => {
                usuarioActualizado.password = "****";
                return res.status(200).json({
                    ok: true,
                    mensaje: 'El archivo se ha actualizado:',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById( id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el médico',
                    errors: err
                });                            
            }
            var pathAnterior = './uploads/medicos/' + (medico.img ? medico.img : 'xxx.img');
            console.log(pathAnterior);
            if (fs.existsSync(pathAnterior)) {
                console.log('Eliminando archivo');
                fs.unlinkSync( pathAnterior );
            }
            medico.img = nombreArchivo;
            console.log('guardando nuevo nombre de archivo');
            medico.save( (err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'El archivo se ha actualizado:',
                    medico: medicoActualizado
                });
            });
        });

    }

    if (tipo === 'hospitales') {
        Hospital.findById( id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital',
                    errors: err
                });                            
            }
            var pathAnterior = './uploads/hospitales/' + (hospital.img ? hospital.img : 'xxx.img');
            console.log(pathAnterior);
            if (fs.existsSync(pathAnterior)) {
                console.log('Eliminando archivo');
                fs.unlinkSync( pathAnterior );
            }
            hospital.img = nombreArchivo;
            console.log('guardando nuevo nombre de archivo');
            hospital.save( (err, hospitalActualizado) => {
                return res.status(200).json({   
                    ok: true,
                    mensaje: 'El archivo se ha actualizado:',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;
