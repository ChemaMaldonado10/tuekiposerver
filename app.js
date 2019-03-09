// Imports of main libraries.
const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')

const app = express()

// app.use(express.static('./public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Enable CORS.
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Router for users endpoints.
const users = require('./routes/user')
app.use(users)

// Router for login endpoints
const login = require('./routes/login')
app.use(login)

// Router for rol endpoints
const rol = require('./routes/rol')
app.use(rol)

// Router for rol endpoints
const registro = require('./routes/registro')
app.use(registro)

// Router for rol endpoints
const gestor = require('./routes/gestor')
app.use(gestor)

// Router for rol endpoints
const analista = require('./routes/analista')
app.use(analista)


// Messages for main http empty route and console.
app.get("/", (req, res) => {
    console.log("Responding to root route")
    res.send("Hello from ROOT")
})

app.listen(3003, () => {
    console.log("Server is listening in port 3003. Nice!")
})