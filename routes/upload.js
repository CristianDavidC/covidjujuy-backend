// Contendra la ruta principal

var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Middleware
app.use(fileUpload());



app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    if (!req.files) {
         return res.status(400).json({
                ok: false,
                mensaje: 'No seleccionó nada',
                errors: { message: 'Debe seleccionar una imagen' }
            })
    }

    // Colección de tipo válidos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if( tiposValidos.indexOf(tipo) < 0 ) {
        return res.status(400).json({
                ok: false,
                mensaje: 'No es una colección válida',
                errors: { message: 'Las colecciones válidas son ' + tiposValidos.join(', ') }
            });
    }

    // Obtener el archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Colección de extensiones válidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if( extensionesValidas.indexOf(extensionArchivo) < 0 ) {
        return res.status(400).json({
                ok: false,
                mensaje: 'Extensión no válida',
                errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
            });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido'
        // })
    });

})

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario no existe',
                    errors: { message: 'Usuario no existe'}
                })
            }

            var pathViejo = `./uploads/${ tipo }/${ usuario.img }`;

            // Si existe, elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                })
            });

        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'El medico no existe',
                    errors: { message: 'Medico no existe'}
                })
            }

            var pathViejo = `./uploads/${ tipo }/${ medico.img }`;

            // Si existe, elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medico: medicoActualizado
                })
            });

        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital no existe',
                    errors: { message: 'Hospital no existe'}
                })
            }

            var pathViejo = `./uploads/${ tipo }/${ hospital.img }`;

            // Si existe, elimina la img anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospital: hospitalActualizado
                })
            });

        });
    }
}

module.exports = app;