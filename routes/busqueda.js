
var express = require('express');

var app = express();

var Hospital = require('../models/hospital'); 
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =============================================
// Busqueda por coleccion
// =============================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regExp = new RegExp(busqueda, 'i');

    var promesa;

    switch(tabla) {
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regExp);
        break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regExp);
        break;

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regExp);
        break;

        default:
            return res.status(400).json({
                            ok: false,
                            mensaje: 'Los tipos de busqueda permitidos son: hospitales, medicos y usuarios',
                            errors: { message: 'Tipo de coleccion no válido' }
                        });
    }

    promesa.then(data => {
        res.status(200).json({
                ok: true,
                [tabla]: data // Propieda de objecto computada Ej: tabla. El resultado de lo que tenga la variable
            });
    }); 
});

// =============================================
// Busqueda General
// =============================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regExp),
        buscarMedicos(busqueda, regExp),
        buscarUsuarios(busqueda, regExp)
    ])
    .then( respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    })
});

function buscarHospitales(busqueda, regExp) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regExp })
                .populate('usuario', 'nombre email')
                .exec(
                    (err, hospitales) => {
                        if(err) {
                            reject('Error al cargar hospitales', err);
                        } else {
                            resolve(hospitales);
                        }
                    });
        });
}

function buscarMedicos(busqueda, regExp) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regExp })
                .populate('usuario', 'nombre email')
                .populate('hospital')
                .exec(
                    (err, medicos) => {
                        if(err) {
                            reject('Error al cargar medicos', err);
                        } else {
                            resolve(medicos);
                        }
                    });

                
    });
}

function buscarUsuarios(busqueda, regExp) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img') // Buscar por dos condiciones
                .or([
                    {'nombre': regExp},
                    {'email': regExp}
                ])
                .exec((err, usuarios) => {
                    if(err) {
                        reject('Error al cargar usuarios', err);
                    } else {
                        resolve(usuarios);
                    }
                });
    });
}

module.exports = app;