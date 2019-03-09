const mysql = require('mysql')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED
var CLIENT_ID = require('../config/config').CLIENT_ID

const router = express.Router()

//Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// Login route: 
// check if both the email and the password are in the db
router.post('/login', (req, res, next) => {

    const nombre_usuario = req.body.nombre_usuario;
    const email_usuario = req.body.email_usuario;
    const password_usuario = req.body.password_usuario;

    const sql = "SELECT * FROM usuario WHERE email_usuario = '" + email_usuario + "'";

    // Check email and password
    getConnection().query(sql, (err, rows, fields) => {
        if (err) throw err;
        if (rows.length !== 0) {
            if (bcrypt.compareSync(password_usuario, rows[0].password_usuario)) {

                // if everything went great we generate the token!
                rows[0].password_usuario = ':)';
                var user_database = rows;

                var token = jwt.sign({ user_database }, SEED, { expiresIn: 14400 })


                // Aqui actualizaríamos la tabla usuario con su token. 
                // cada vez que lo generemos

                console.log(rows);
                return res.status(200).json({
                    state: true,
                    token: token,
                    body: rows,
                    menu: obtenerMenu('COMMON_ROLE')
                });
            } else {
                return res.status(500).json({
                    state: false,
                    message: "Could not match user with query --password"
                });
            }
        } else {
            return res.status(500).json({
                state: false,
                message: "Could not match user with query --email"
            });
        }
    })
});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


// Google sign in.  
// TODO: There is a problem with the automatically generated id.
router.post('/login/google/', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                state: false,
                message: "Token no valido"
            });
        })

    var conn = getConnection();
    console.log(googleUser.email)

    var sql = "SELECT * FROM usuario WHERE email_usuario = ? ";
    var sql_add = "INSERT INTO usuario(nombre_usuario, email_usuario,password_usuario,img_usuario,google_usuario,token_usuario) VALUES (?,?,?,?,?,?)";

    conn.query(sql, googleUser.email, (err, rows, fields) => {
        if (err) {
            return res.status(500).json({
                state: false,
                message: "No se ha podido realizar la conexion para buscar al usuario"
            });
        }
        if (rows.length === 0) {
            conn.query(sql_add, [googleUser.nombre, googleUser.email, ':)', googleUser.img, true, ''], (err, rows, fields) => {
                if (err) {
                    console.log("No se ha podido crear el usuario desde Google");
                    console.log(err);
                }
            })
        }
        var user_database = rows;
        var token = jwt.sign({ user_database }, SEED, { expiresIn: 14400 })

        return res.status(200).json({
            state: true,
            message: "only token",
            body: rows,
            token: token,
            menu: obtenerMenu('ADMIN_ROLE')
        });

    });
});

function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Menu General',
            icono: 'mdi mdi-align',
            submenu: [
                { titulo: 'Rol', url: '/rol' },
                { titulo: 'Crear', url: '/crear' },
            ],
            number: '2'
        },
        {
            titulo: 'Menu Gestor',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'Rol', url: '/rol' },
                { titulo: 'Crear', url: '/crear' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RXJS', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Menu Analista/Narrador',
            icono: 'mdi mdi-clock',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' }
            ]
        },
    ];

    if (ROLE === 'COMMON_ROLE') {
        return menu[0];
    } else if (ROLE === 'ADMIN_ROLE') {
        return menu[0];
    } else if (ROLE === 'USER_ROLE') {
        return menu[2];
    }

}


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