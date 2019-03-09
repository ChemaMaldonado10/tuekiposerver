const mysql = require('mysql')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED
var CLIENT_ID = require('../config/config').CLIENT_ID

const router = express.Router()

// List all users
router.get("/rol/:email_usuario", (req, res) => {
    const email_usuario = req.params.email_usuario;
    const conn = getConnection();
    const sql = "SELECT USUARIO.nombre_usuario, ENTIDAD.nombre_entidad, ROL_USUARIO_ENTIDAD.tipo_usuario, ROL_USUARIO_ENTIDAD.ROL_id_rol  FROM ENTIDAD LEFT JOIN ROL_USUARIO_ENTIDAD INNER JOIN USUARIO ON USUARIO.id_usuario=ROL_USUARIO_ENTIDAD.USUARIO_id_usuario ON ROL_USUARIO_ENTIDAD.ENTIDAD_id_entidad=ENTIDAD.id_entidad WHERE USUARIO.email_usuario=? ";

    console.log(email_usuario);
    conn.query(sql, [email_usuario], (err, rows, fields) => {
        if (err) {
            return res.status(500).json({
                state: false,
                message: "Internal Server Error"
            });
        } else {
            for (row in rows) {
                console.log(rows[row].ROL_id_rol);
            }
            return res.status(200).json({
                state: true,
                message: "Fetching roles",
                body: rows
            });
        }
    })
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