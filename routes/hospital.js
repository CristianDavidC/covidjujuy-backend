// Contendra las rutas de Hospital 

var express = require('express');

var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Importar modelo (esquema)
var Hospital = require('../models/hospital'); 

// Metodo para traer todos los hospitales de la BD
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // Parametro opcional para paginar
    desde = Number(desde);

    Hospital.find({ }, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los hospitales',
                        errors: err  
                    })
                }
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });
});

// Metodo para actualizar hospital
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id; // Recuperar parametro de URL
    var body = req.body;

    // Verifico si existe hospital
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err  
            })
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'no existe',
                errors: { message: 'No existe un hospital con ese ID' }  
            })
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err  
                })
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                mensaje: 'Hospital actualizado correctamente'
            });
        });
        
    });
});


// Metodo para crear un nuevo hospital
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        //usuario: body.usuario
        usuario: req.usuario._id
    });

    hospital.save(( err, hospitalGuardado ) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err  
            })
        }
        

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            mensaje: 'Hospital creado correctamente'
        });
    });
});

// Metodo para eliminar un nuevo hospital
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err  
            })
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }  
            })
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            mensaje: 'Hospital borrado correctamente'
        });
    });
});

module.exports = app;