const mysql = require('mysql')
const express = require('express')
const bcrypt = require('bcryptjs')

const router = express.Router()

// List all users
router.get("/users", (req, res) => {
    const conn = getConnection();
    const sql = "SELECT * FROM usuario ";

    conn.query(sql, (err, rows, fields) => {
        if (err) {
            return res.status(500).json({
                state: false,
                message: "Internal Server Error"
            });
        } else {
            return res.status(200).json({
                state: true,
                message: "Fetching all users",
                body: rows,
            });
        }
    })
})

// Create an user from a post 
router.post("/user/create", (req, res) => {

    let nombre_usuario = req.body.nombre_usuario;
    let email_usuario = req.body.email_usuario
    let password_usuario = bcrypt.hashSync(req.body.password_usuario, 10)
    let img_usuario = req.body.img_usuario;
    let google_usuario = req.body.google_usuario;
    let token_usuario = req.body.token_usuario;

    const conn = getConnection();
    const sql_nombre = "SELECT nombre_usuario FROM USUARIO WHERE nombre_usuario=?"
    const sql_email = "SELECT email_usuario FROM USUARIO WHERE email_usuario=?"
    const sql = "INSERT INTO usuario(nombre_usuario, email_usuario,password_usuario,img_usuario,google_usuario,token_usuario) VALUES (?,?,?,?,?,?)";

    conn.query(sql_email, [email_usuario], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            console.log(rows.length);
            if (rows.length > 0) {
                return res.status(200).json({
                    state: true,
                    message: "Email already in use",
                    body: email_usuario
                });
            } else if (rows.length === 0) {
                conn.query(sql_nombre, [nombre_usuario], (err, rows, fields) => {
                    if (err) {
                        res.status(500).json({
                            state: false,
                            message: err
                        });
                    } else {
                        if (rows.length > 0) {
                            return res.status(200).json({
                                state: true,
                                message: "User already in use",
                                body: nombre_usuario
                            });
                        } else if (rows.length === 0) {
                            conn.query(sql, [nombre_usuario, email_usuario, password_usuario, img_usuario, google_usuario, token_usuario], (err, rows, fields) => {
                                if (err) {
                                    res.status(500).json({
                                        state: false,
                                        message: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        state: true,
                                        message: "User was created",
                                        body: rows
                                    });
                                }
                            });
                        }
                    }
                })
            }
        }

    })
});


router.post("/crear/entidad", (req, res) => {

    console.log(req.body.nombre_entidad);
    const nombre_entidad = req.body.nombre_entidad;
    const sql = "INSERT INTO ENTIDAD(nombre_entidad) VALUES(?)"

    const conn = getConnection();

    conn.query(sql, [nombre_entidad], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            return res.status(200).json({
                state: true,
                message: "Entidad creada",
                body: rows
            });
        }
    })
});


// ------------------------------------------------------------------

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