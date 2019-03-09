const mysql = require('mysql')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED
var CLIENT_ID = require('../config/config').CLIENT_ID

const router = express.Router()

// List all users
router.post("/registro", (req, res) => {

    const id_usuario = req.body.id_usuario;
    const nombre_entidad = req.body.nombre_entidad;
    const tipo_usuario = req.body.tipo_usuario;

    var id_rol = 0;
    var id_entidad = 0;

    if (tipo_usuario === 'Gestor') {
        id_rol = 1;
    } else if (tipo_usuario === 'Interno' ||  tipo_usuario === 'Externo') {
        id_rol = 2;
    }

    console.log(nombre_entidad);
    console.log('id_user', id_usuario);
    console.log('id_rol', id_rol);
    console.log(tipo_usuario);

    const sql_id_entidad = "SELECT id_entidad FROM ENTIDAD WHERE nombre_entidad=?";
    const sql_externo = "SELECT id_rol_usuario_entidad FROM ROL_USUARIO_ENTIDAD WHERE USUARIO_id_usuario=? AND tipo_usuario='Externo'";
    const sql_interno = "SELECT id_rol_usuario_entidad FROM ROL_USUARIO_ENTIDAD WHERE USUARIO_id_usuario=? AND tipo_usuario='Interno' AND ENTIDAD_id_entidad=?";
    const sql_gestor = "SELECT id_rol_usuario_entidad FROM ROL_USUARIO_ENTIDAD WHERE ENTIDAD_id_entidad=? AND tipo_usuario='Gestor' AND USUARIO_id_usuario=?";
    const sql_entidad = "INSERT INTO ENTIDAD(nombre_entidad) VALUES(?)";

    const sql = "INSERT INTO ROL_USUARIO_ENTIDAD(ENTIDAD_id_entidad, USUARIO_id_usuario, ROL_id_rol, tipo_usuario) VALUES(?,?,?,?)";

    const conn = getConnection();

    if (tipo_usuario === 'Externo') {
        conn.query(sql_id_entidad, [nombre_entidad], (err, rows, fields) => {
            if (err) {
                res.status(500).json({
                    state: false,
                    message: err
                });
            } else {
                id_entidad = rows[0].id_entidad;
            }
            conn.query(sql_externo, [id_usuario], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    if (rows.length > 0) {
                        return res.status(200).json({
                            state: true,
                            message: "New user rol",
                            body: 'NOT OK externo'
                        });
                    } else {
                        conn.query(sql, [id_entidad, id_usuario, id_rol, tipo_usuario], (err, rows, fields) => {
                            if (err) {
                                res.status(500).json({
                                    state: false,
                                    message: err
                                });
                            } else {
                                return res.status(200).json({
                                    state: true,
                                    message: "New user rol",
                                    body: rows
                                });
                            }
                        });
                    }
                }
            });
        });
    } else if (tipo_usuario === 'Interno') {
        conn.query(sql_id_entidad, [nombre_entidad], (err, rows, fields) => {
            if (err) {
                res.status(500).json({
                    state: false,
                    message: err
                });
            } else {
                if (rows.length === 0) {
                    return res.status(200).json({
                        state: true,
                        message: "New user rol",
                        body: 'NOT EXISTS'
                    });
                }
                id_entidad = rows[0].id_entidad;
            }
            conn.query(sql_interno, [id_usuario, id_entidad], (err, rows, fields) =>  {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    if (rows.length > 0) {
                        return res.status(200).json({
                            state: true,
                            message: "New user rol",
                            body: 'NOT OK interno'
                        });
                    } else {
                        conn.query(sql, [id_entidad, id_usuario, id_rol, tipo_usuario], (err, rows, fields) => {
                            if (err) {
                                res.status(500).json({
                                    state: false,
                                    message: err
                                });
                            } else {
                                return res.status(200).json({
                                    state: true,
                                    message: "New user rol",
                                    body: rows
                                });
                            }
                        });
                    }
                }
            });
        });
    } else if (tipo_usuario === 'Gestor') {
        conn.query(sql_id_entidad, [nombre_entidad], (err, rows, fields) => {
            if (err) {
                res.status(500).json({
                    state: false,
                    message: err
                });
            } else {
                if (rows.length === 0) {
                    return res.status(200).json({
                        state: true,
                        message: "New user rol",
                        body: 'NOT EXISTS'
                    });
                }
                id_entidad = rows[0].id_entidad;
            }
            conn.query(sql_gestor, [id_entidad, id_usuario], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    console.log('fff', rows.length);
                    if (rows.length > 0) {
                        return res.status(200).json({
                            state: true,
                            message: "New user rol",
                            body: 'NOT OK gestor'
                        });
                    } else {
                        conn.query(sql, [id_entidad, id_usuario, id_rol, tipo_usuario], (err, rows, fields) => {
                            if (err) {
                                res.status(500).json({
                                    state: false,
                                    message: err
                                });
                            } else {
                                return res.status(200).json({
                                    state: true,
                                    message: "New user rol",
                                    body: rows
                                });
                            }
                        });
                    }
                }
            });
        });
    }
});




// List all users
router.post("/delete/registro", (req, res) => {

    const id_usuario = req.body.id_usuario;
    const nombre_entidad = req.body.nombre_entidad;
    const tipo_usuario = req.body.tipo_usuario;

    var id_rol = 0;
    var id_entidad = 0;
    var id_rol_usuario_entidad = 0;

    if (tipo_usuario === 'Gestor') {
        id_rol = 1;
    } else if (tipo_usuario === 'Interno' ||  tipo_usuario === 'Externo' || tipo_usuario === 'Narrador') {
        id_rol = 2;
    }

    console.log('id_user', id_usuario);
    console.log('id_rol', id_rol);
    console.log(tipo_usuario);

    const conn = getConnection();
    const sql_select = "SELECT id_entidad FROM ENTIDAD WHERE nombre_entidad= ?";
    const sql = "SELECT id_rol_usuario_entidad FROM ROL_USUARIO_ENTIDAD WHERE ROL_id_rol=? AND ENTIDAD_id_entidad=? AND USUARIO_id_usuario=?"
    const sql_delete = "DELETE FROM ROL_USUARIO_ENTIDAD WHERE id_rol_usuario_entidad=?"

    conn.query(sql_select, [nombre_entidad], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            id_entidad = rows[0].id_entidad;
            console.log(id_entidad);

            conn.query(sql, [id_rol, id_entidad, id_usuario], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    id_rol_usuario_entidad = rows[0].id_rol_usuario_entidad;
                    console.log(id_rol_usuario_entidad);

                    conn.query(sql_delete, [id_rol_usuario_entidad], (err, rows, fields) => {
                        if (err) {
                            res.status(500).json({
                                state: false,
                                message: err
                            });
                        } else {
                            return res.status(200).json({
                                state: true,
                                message: "Relacion borrada",
                                body: rows
                            });
                        }
                    })
                }
            });
        }
    });
})




// We create a pool in order to have a function with all the database
// parameters 

const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: 'root',
    password: "mysql191312",
    database: 'beta_bbdd_tuekipo'
})

function getConnection() {
    return pool
}

module.exports = router