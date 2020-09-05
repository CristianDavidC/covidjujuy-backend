// Contendra las rutas de medico 

var express = require('express');

var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Importar modelo (esquema)
var Medico = require('../models/medico'); 

// Metodo para traer todos los medicoes de la BD
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // Parametro opcional para paginar
    desde = Number(desde);

    Medico.find({ }, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre usuario')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los medicoes',
                        errors: err  
                    })
                }
                Medico.count({}, (err, conteo) => {
                        res.status(200).json({
                            ok: true,
                            medicos: medicos,
                            total: conteo
                        });
                });
                
            });
});

// Metodo para actualizar medico
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id; // Recuperar parametro de URL
    var body = req.body;

    // Verifico si existe medico
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err  
            })
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }  
            })
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id,
        medico.hospital = body.hospital

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err  
                })
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                mensaje: 'Medico actualizado correctamente'
            });
        });
        
    });
});


// Metodo para crear un nuevo medico
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        //usuario: body.usuario
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save(( err, medicoGuardado ) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err  
            })
        }
        

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            mensaje: 'Medico creado correctamente'
        });
    });
});

// Metodo para eliminar un nuevo medico
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err  
            })
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }  
            })
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            mensaje: 'Medico borrado correctamente'
        });
    });
});

module.exports = app;