const mysql = require('mysql')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED
var CLIENT_ID = require('../config/config').CLIENT_ID

const router = express.Router()

router.get("/partidos", (req, res) => {
    const sql1 = "SELECT EQUIPO.nombre_equipo FROM EQUIPO JOIN PARTIDO ON EQUIPO.id_equipo=PARTIDO.EQUIPO_id_equipo ORDER BY PARTIDO.id_partido"
    const sql2 = "SELECT EQUIPO.nombre_equipo, PARTIDO.fecha_partido, PARTIDO.hora_partido, PARTIDO.asociado_partido FROM EQUIPO JOIN PARTIDO ON EQUIPO.id_equipo=PARTIDO.EQUIPO_id_equipo_2 ORDER BY PARTIDO.id_partido"
    const conn = getConnection();
    conn.query(sql1, (err, rows1, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            conn.query(sql2, (err, rows2, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    return res.status(200).json({
                        state: true,
                        message: "Fetching all matches",
                        body: rows1,
                        body2: rows2
                    });
                }
            })
        }
    })
})

router.post("/partidos/asociados", (req, res) => {

    const nombre_usuario = req.body.nombre_usuario;
    console.log(nombre_usuario)

    const sql1 = "SELECT EQUIPO.nombre_equipo FROM EQUIPO JOIN PARTIDO ON EQUIPO.id_equipo=PARTIDO.EQUIPO_id_equipo WHERE PARTIDO.asociado_partido=? ORDER BY PARTIDO.id_partido"
    const sql2 = "SELECT EQUIPO.nombre_equipo, PARTIDO.fecha_partido, PARTIDO.hora_partido, PARTIDO.asociado_partido FROM EQUIPO JOIN PARTIDO ON EQUIPO.id_equipo=PARTIDO.EQUIPO_id_equipo_2 WHERE PARTIDO.asociado_partido=? ORDER BY PARTIDO.id_partido"

    const conn = getConnection();
    conn.query(sql1, [nombre_usuario], (err, rows1, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            conn.query(sql2, [nombre_usuario], (err, rows2, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    return res.status(200).json({
                        state: true,
                        message: "Fetching all matches",
                        body: rows1,
                        body2: rows2
                    });
                }
            })
        }
    })
});



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