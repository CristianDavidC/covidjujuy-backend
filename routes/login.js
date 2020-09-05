var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// SEED
var SEED = require('../config/config').SEED;
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


var app = express();

// Traer datos de BD
// Importar modelo (esquema)

var Usuario = require('../models/usuario'); 

var {OAuth2Client} = require('google-auth-library');
var client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ===========================================
//  Login de Google
// ===========================================

app.post('/google', (req, res) => {

    var token = req.body.token;

    const oAuth2Client = new OAuth2Client(
        GOOGLE_CLIENT_ID,
        GOOGLE_SECRET
    );
    const ticket = oAuth2Client.verifyIdToken({
        idToken: token
        //audience: GOOGLE_CLIENT_ID
    });
    ticket.then(data => {

        Usuario.findOne({ email: data.payload.email }, (err, usuario) => {
            if(err) {
                return res.status(500).json({
                    ok: false, 
                    mensaje: 'Error al buscar usuario - login-google',
                    errors: err
                });
            }

            if(usuario) {
                if(usuario.google === false) {
                    return res.status(400).json({
                        ok: false, 
                        mensaje: 'Debe de usar su autenticación normal'
                    });
                } else {
                    usuario.password = '';
                    var token = jwt.sign({ usuario }, SEED, { expiresIn: 14440 }); //4 horas

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Login (Google) se ha realizado correctamente',
                        usuario: usuario,
                        id: usuario._id,
                        token: token
                    });
                }
            } else {
                var usuario = new Usuario();

                usuario.nombre = data.payload.name;
                usuario.email = data.payload.email;
                usuario.password = '-';
                usuario.img = data.payload.picture;
                usuario.google = true;

                usuario.save((err, usuarioGuardado) => {
                    if(err) {
                        return res.status(500).json({
                            ok: false, 
                            mensaje: 'Error al crear usuario - google',
                            errors: err
                        });
                    }

                    var token = jwt.sign({ usuarioGuardado }, SEED, { expiresIn: 14440 }); //4 horas

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Usuario (Google) creado correctamente',
                        usuario: usuarioGuardado,
                        id: usuarioGuardado._id,
                        token: token
                    });
                })
            }
        });
    })
    .catch( err => {
        return res.status(500).json({
                ok: false, 
                mensaje: 'Token no válido',
                errors: err
            });
    });
});

// ===========================================
//  Login normal
// ===========================================
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err  
            })
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: { message: 'Credenciales incorrectas' }  
            })
        }

        if ( !bcrypt.compareSync( body.password, usuarioBD.password )) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: { message: 'Credenciales incorrectas' }  
            })
        }

        // Crear un TOKEN
        usuarioBD.password = '';
        var token = jwt.sign({ usuarioBD }, SEED, { expiresIn: 14440 }); //4 horas

        res.status(200).json({
            ok: true,
            mensaje: 'Login correcto',
            usuario: usuarioBD,
            id: usuarioBD.id,
            token: token
        });
    });
});

module.exports = app;