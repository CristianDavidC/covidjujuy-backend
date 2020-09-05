// Contendra las rutas de Usuario 

var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

// Traer datos de BD
// Importar modelo (esquema)

var Usuario = require('../models/usuario'); 

// Metodo para traer todos los usuarios de la BD
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; // Parametro opcional para paginar
    desde = Number(desde);

    Usuario.find({ }, 'nombre email img role google') // find: 3 args = metodo, campos que quiero mostrar y callback
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al cargar los usuarios',
                        errors: err  
                    })
                }

                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });
            })
    });

// Metodo para actualizar usuario
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => { // Especificar otro segmento. Es obligatorio
    var id = req.params.id; // Recuperar parametro de URL
    var body = req.body;

    // Verifico si existe usuario
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err  
            })
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'no existe',
                errors: { message: 'No existe un usuario con ese ID' }  
            })
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err  
                })
            }
            
            usuario.password = '';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
        
    });
});


// Metodo para crear un nuevo usuario
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save(( err, usuarioGuardado ) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err  
            })
        }
        

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

    
});

// Metodo para eliminar un nuevo usuario
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err  
            })
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }  
            })
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});


// BODY PARSER NODE: libreria que toma la info del POST y nos crea un objeto de JS que podamos utilizar 

// Para que se pueda usar "app" fuera de este archivo
module.exports = app;