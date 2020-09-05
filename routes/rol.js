const express = require('express');
const router = express.Router();
const { database } = require('../config/config');

router.get('/', async (req, res) => {

    database.table('rol as r')
        .withFields([
            'r.idRol',
            'r.nombre as rol',
            'CAST(r.activo AS int) as activo',
            'CAST(r.esAdmin AS int) as esAdmin',
            'r.fechaAlta'
        ])
        .getAll()
        .then(roles => {
            if (roles.length > 0) {
                res.status(200).json({
                    roles: roles
                });
            } else {
                res.json({message: "No users found"});
            }
        }).catch(err => res.json(err));
});

router.post('/', async (req, res) => {
    var data = req.body;

    database.table('rol')
        .insert({
            nombre: data.nombre,
            activo: data.activo,
            esAdmin: data.esAdmin,
            fechaAlta: data.fechaAlta
        }).then((newRolId) => {
            res.json({
                message: `Rol successfully placed with id ${newRolId}`,
                success: true
            })
        }).catch(err => res.json(err));
});

router.put('/:id', async (req, res) => {

    var id = req.params.id; // Recuperar parametro de URL
    var data = req.body;

    database.table('rol')
    .filter({ 'idRol': id })
    .get()
    .then(rol => {
        if (rol) {
            database.table('rol')
            .filter({ 'idRol': id })
            .update({
                nombre: data.nombre,
                activo: data.activo,
                esAdmin: data.esAdmin,
                fechaAlta: data.fechaAlta
            }).then((succes) => {
                res.json({
                    message: `Rol successfully updated with id ${id}`,
                    success: true
                })
            }).catch(err => res.json(err));
    
        } else {
            res.json({
                message: `No rol found with id ${id}`,
            });
        }
    });
});

router.delete('/:id', async (req, res) => {

    var id = req.params.id;

    database.table('rol')
        .filter({ 'idRol': id })
        .remove()
        .then((success) => {
            res.json({
                success: true
            })
        }).catch(err => res.json(err));
});


module.exports = router;