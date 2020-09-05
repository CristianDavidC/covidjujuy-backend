const express = require('express');
const router = express.Router();
const {database} = require('../config/config');

/* GET ALL USERS */
router.get('/', function (req, res) {       // Sending Page Query Parameter is mandatory http://localhost:3636/api/usuarios?page=1
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;   // set limit of items per page
    let startValue;
    let endValue;
    if (page > 0) {
        startValue = (page * limit) - limit;     // 0, 10, 20, 30
        endValue = page * limit;                  // 10, 20, 30, 40
    } else {
        startValue = 0;
        endValue = 10;
    }
    database.table('usuario as u')
        .join([
            {
                table: "rol as r",
                on: `u.IdRol = r.IdRol`
            }
        ])
        .withFields([
            'u.idUsuario',
            'r.nombre as rol',
            'u.nick',
            'u.email',
            'u.fechaAlta',
            'CAST(u.activo AS INT) as activo'

        ])
        .slice(startValue, endValue)
        .sort({IdUsuario: .1})
        .getAll()
        .then(users => {
            if (users.length > 0) {
                res.status(200).json({
                    count: users.length,
                    users: users
                });
            } else {
                res.json({message: "No users found"});
            }
        })
        .catch(err => console.log(err));
});

router.post('/', async (req, res) => {
    var data = req.body;

    database.table('usuario')
        .insert({
            idRol: data.idRol,
            nick: data.nick,
            email: data.email,
            contraseña: data.contraseña,
            activo: data.activo,
            fechaAlta: data.fechaAlta
        }).then((newRolId) => {
            res.json({
                message: `User successfully placed with id ${newRolId}`,
                success: true
            })
        }).catch(err => res.json(err));
});

router.put('/:id', async (req, res) => {

    var id = req.params.id; // Recuperar parametro de URL
    var data = req.body;

    database.table('usuario')
    .filter({ 'idUsuario': id })
    .get()
    .then(user => {
        if (user) {
            database.table('usuario')
            .filter({ 'idUsuario': id })
            .update({
                idRol: data.idRol,
                nick: data.nick,
                email: data.email,
                contraseña: data.contraseña,
                activo: data.activo,
                fechaAlta: data.fechaAlta
            }).then((succes) => {
                res.json({
                    message: `User successfully updated with id ${id}`,
                    success: true
                })
            }).catch(err => res.json(err));
    
        } else {
            res.json({
                message: `No user found with id ${id}`,
            });
        }
    });
});

router.delete('/:id', async (req, res) => {

    var id = req.params.id;

    database.table('usuario')
        .filter({ 'idRol': id })
        .remove()
        .then((success) => {
            res.json({
                success: true
            })
        }).catch(err => res.json(err));
});

module.exports = router;