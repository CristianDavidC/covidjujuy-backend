var jwt = require('jsonwebtoken');

// SEED
var SEED = require('../config/config').SEED;

exports.verificarToken = function(req, res, next) {
    var token = req.query.token; // Recuperar token de URL

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err  
            })
        }

        req.usuario = decoded.usuarioBD; // Poner los datos del usuario para tenerlo disponible en donde se use el md

        next();
        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
}
