const express = require('express')
const mysql = require('mysql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED
var CLIENT_ID = require('../config/config').CLIENT_ID

const router = express.Router()

router.get("/equipo/:nombre_entidad", (req, res) => {

    const nombre_entidad = req.params.nombre_entidad;

    const conn = getConnection();
    const sql = "SELECT nombre_entidad, nombre_equipo, nombre_categoria FROM ENTIDAD JOIN EQUIPO INNER JOIN CATEGORIA ON EQUIPO.CATEGORIA_id_categoria=CATEGORIA.id_categoria ON EQUIPO.ENTIDAD_id_entidad=ENTIDAD.id_entidad WHERE nombre_entidad=?";

    conn.query(sql, [nombre_entidad], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            return res.status(200).json({
                state: true,
                message: "Fetching all teams",
                body: rows
            });
        }
    });
});

router.get("/jugador/:nombre_equipo", (req, res) => {

    const nombre_equipo = req.params.nombre_equipo;
    var EQUIPO_id_equipo = 0;

    const conn = getConnection();
    const sql_id_equipo = "SELECT id_equipo FROM EQUIPO WHERE nombre_equipo=?";
    const sql = "SELECT nombre_jugador, posicion_jugador, dorsal_jugador FROM JUGADOR JOIN EQUIPO ON EQUIPO.id_equipo=JUGADOR.EQUIPO_id_equipo WHERE EQUIPO.id_equipo=?";

    conn.query(sql_id_equipo, [nombre_equipo], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            EQUIPO_id_equipo = rows[0].id_equipo;
            conn.query(sql, [EQUIPO_id_equipo], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    return res.status(200).json({
                        state: true,
                        message: "Fetching all players",
                        body: rows
                    });
                }
            })
        }
    });
});


router.post("/jugador/registro", (req, res) => {
    const nombre_jugador = req.body.nombre_jugador;
    const posicion_jugador = req.body.posicion_jugador;
    const nombre_equipo = req.body.nombre_equipo;
    const dorsal_jugador = req.body.dorsal_jugador;

    var EQUIPO_id_equipo = 0;

    const sql_id_equipo = "SELECT id_equipo FROM EQUIPO WHERE nombre_equipo=?";
    const sql_nombre_jugador = "SELECT nombre_jugador FROM JUGADOR WHERE nombre_jugador=? AND EQUIPO_id_equipo=?";
    const sql_dorsal = "SELECT dorsal_jugador FROM JUGADOR WHERE dorsal_jugador=? AND EQUIPO_id_equipo=?";
    const sql = "INSERT INTO JUGADOR(EQUIPO_id_equipo, nombre_jugador, posicion_jugador, dorsal_jugador) VALUES(?,?,?,?)";

    const conn = getConnection();

    conn.query(sql_id_equipo, [nombre_equipo], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            EQUIPO_id_equipo = rows[0].id_equipo;
            conn.query(sql_nombre_jugador, [nombre_jugador, EQUIPO_id_equipo], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    if (rows.length > 0) {
                        return res.status(200).json({
                            state: true,
                            message: "",
                            body: 'ALREADY EXISTS jugador'
                        });
                    } else {
                        conn.query(sql_dorsal, [dorsal_jugador, EQUIPO_id_equipo], (err, rows, fields) => {
                            if (err) {
                                res.status(500).json({
                                    state: false,
                                    message: err
                                });
                            } else {
                                if (rows.length > 0) {
                                    return res.status(200).json({
                                        state: true,
                                        message: "",
                                        body: 'ALREADY EXISTS dorsal'
                                    });
                                } else {
                                    conn.query(sql, [EQUIPO_id_equipo, nombre_jugador, posicion_jugador, dorsal_jugador], (err, rows, fields) => {
                                        if (err) {
                                            res.status(500).json({
                                                state: false,
                                                message: err
                                            });
                                        } else {
                                            return res.status(200).json({
                                                state: true,
                                                message: "Nuevo jugador creado",
                                                body: rows
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            });
        }
    });
})

router.post("/partido/registro", (req, res) => {

    const nombre_local = req.body.nombre_local;
    const nombre_visitante = req.body.nombre_visitante;
    const fecha = req.body.fecha;
    const hora = req.body.hora;

    var id_equipo_visitante = 0;
    var id_equipo_local = 0;

    console.log(nombre_visitante);
    const conn = getConnection();

    const sql_id = "SELECT id_equipo FROM EQUIPO WHERE nombre_equipo = ?";
    const sql = "INSERT INTO PARTIDO (EQUIPO_id_equipo, EQUIPO_id_equipo_2, fecha_partido, hora_partido) VALUES(?,?,?,?)";


    conn.query(sql_id, [nombre_local], (err, rows, fields) => {
        if (err) {
            return res.status(500).json({
                state: false,
                message: err
            });
        } else {
            if (rows.length === 0) {
                return res.status(200).json({
                    state: false,
                    message: "",
                    body: 'NOT EXISTS'
                });
            } else {
                id_equipo_local = rows[0].id_equipo;
                conn.query(sql_id, [nombre_visitante], (err, rows, fields) => {
                    if (err) {
                        return res.status(500).json({
                            state: false,
                            message: err
                        });
                    } else {
                        if (rows.length === 0) {
                            return res.status(200).json({
                                state: false,
                                message: "",
                                body: 'NOT EXISTS'
                            });
                        } else {
                            id_equipo_visitante = rows[0].id_equipo;
                            conn.query(sql, [id_equipo_local, id_equipo_visitante, fecha, hora], (err, rows, fields) =>  {
                                if (err) {
                                    return res.status(500).json({
                                        state: false,
                                        message: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        state: false,
                                        message: "Match created",
                                        body: rows
                                    });
                                }
                            })
                        }
                    }
                })
            }
        }
    })

});

router.post("/equipo/registro", (req, res) => {

    const nombre_provincia = req.body.nombre_provincia;
    const nombre_ciudad = req.body.nombre_ciudad;
    const nombre_estadio = req.body.nombre_estadio;
    const nombre_categoria = req.body.nombre_categoria;
    const nombre_entidad = req.body.nombre_entidad;
    const nombre_equipo = req.body.nombre_equipo;

    var PROVINCIA_id_provincia = 0;
    var CIUDAD_id_ciudad = 0;
    var ESTADIO_id_estadio = 0;
    var CATEGORIA_id_categoria = 0;
    var ENTIDAD_id_entidad = 0;

    const conn = getConnection();

    const sql_id_equpo = "SELECT id_equipo FROM EQUIPO WHERE nombre_equipo=?";
    const sql_id_provincia = "SELECT id_provincia FROM PROVINCIA WHERE nombre_provincia=?";
    const sql_id_ciudad = "SELECT id_ciudad FROM CIUDAD WHERE nombre_ciudad=?";
    const sql_id_estadio = "SELECT id_estadio FROM ESTADIO WHERE nombre_estadio=?";
    const sql_id_categoria = "SELECT id_categoria FROM CATEGORIA WHERE nombre_categoria=?";
    const sql_id_entidad = "SELECT id_entidad FROM ENTIDAD WHERE nombre_entidad=?";

    const sql = "INSERT INTO EQUIPO (PROVINCIA_id_provincia, CIUDAD_id_ciudad, ESTADIO_id_estadio, CATEGORIA_id_categoria, ENTIDAD_id_entidad, nombre_equipo) VALUES(?,?,?,?,?,?)"


    conn.query(sql_id_provincia, [nombre_provincia], (err, rows, fields) => {
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
                    body: 'NOT EXISTS provincia'
                });
            }
            PROVINCIA_id_provincia = rows[0].id_provincia;

            conn.query(sql_id_ciudad, [nombre_ciudad], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else  {
                    if (rows.length === 0) {
                        return res.status(200).json({
                            state: true,
                            message: "New user rol",
                            body: 'NOT EXISTS ciudad'
                        });
                    }
                    CIUDAD_id_ciudad = rows[0].id_ciudad;

                    conn.query(sql_id_estadio, [nombre_estadio], (err, rows, fields) => {
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
                                    body: 'NOT EXISTS estadio'
                                });
                            }
                            ESTADIO_id_estadio = rows[0].id_estadio;

                            conn.query(sql_id_categoria, [nombre_categoria], (err, rows, fields) => {
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
                                            body: 'NOT EXISTS categoria'
                                        });
                                    }
                                    CATEGORIA_id_categoria = rows[0].id_categoria;

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
                                                    body: 'NOT EXISTS entidad'
                                                });
                                            }
                                            ENTIDAD_id_entidad = rows[0].id_entidad;
                                            conn.query(sql_id_equpo, [nombre_equipo], (err, rows, fields) => {
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
                                                            body: 'EXISTS equipo'
                                                        });
                                                    }
                                                    conn.query(sql, [PROVINCIA_id_provincia, CIUDAD_id_ciudad, ESTADIO_id_estadio, CATEGORIA_id_categoria, ENTIDAD_id_entidad, nombre_equipo], (err, rows, fields) => {
                                                        if (err) {
                                                            res.status(500).json({
                                                                state: false,
                                                                message: err
                                                            });
                                                        } else {
                                                            return res.status(200).json({
                                                                state: true,
                                                                message: "Nuevo equipo creado",
                                                                body: rows
                                                            });
                                                        }
                                                    });

                                                }
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})


// Mejorar este endpoint haciendolo a partir del nombre del equipo tambien.

router.post("/jugador/eliminar", (req, res) => {

    const nombre_jugador = req.body.nombre_jugador;
    const posicion_jugador = req.body.posicion_jugador;

    const sql = "DELETE FROM JUGADOR WHERE nombre_jugador=? AND posicion_jugador=?"

    const conn = getConnection();

    conn.query(sql, [nombre_jugador, posicion_jugador], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            return res.status(200).json({
                state: true,
                message: "Jugador eliminado",
                body: rows
            });
        }
    })
});


// Mejorar este endpoint.
router.post("/equipo/eliminar", (req, res) => {

    const nombre_equipo = req.body.nombre_equipo;
    const nombre_categoria = req.body.nombre_categoria;

    var CATEGORIA_id_categoria = 0;

    const sql_id_categoria = "SELECT id_categoria FROM CATEGORIA WHERE nombre_categoria=?"
    const sql = "DELETE FROM EQUIPO WHERE nombre_equipo=? AND CATEGORIA_id_categoria=?"

    const conn = getConnection();

    conn.query(sql_id_categoria, [nombre_categoria], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            CATEGORIA_id_categoria = rows[0].id_categoria;
            console.log(CATEGORIA_id_categoria);
            conn.query(sql, [nombre_equipo, CATEGORIA_id_categoria], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    return res.status(200).json({
                        state: true,
                        message: "Equipo eliminado",
                        body: rows
                    });
                }
            })
        }
    })
});
router.post("/partido/modificar/fecha", (req, res) => {

    const nombre_equipo = req.body.nombre_equipo;
    const nombre_equipo_2 = req.body.nombre_equipo_2;
    const fecha_partido = req.body.fecha_partido;
    const hora_partido = req.body.hora_partido;

    var id_partido = 0;

    const sql_id = "SELECT id_equipo FROM EQUIPO WHERE nombre_equipo=?";
    const sql_id_partido = "SELECT id_partido FROM PARTIDO WHERE EQUIPO_id_EQUIPO=? AND EQUIPO_id_equipo_2=? AND hora_partido=?"
    const sql_update = "UPDATE PARTIDO SET fecha_partido=? WHERE id_partido=?";
    const conn = getConnection();

    conn.query(sql_id, [nombre_equipo], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            id_equipo_1 = rows[0].id_equipo;
            console.log(id_equipo_1);
            conn.query(sql_id, [nombre_equipo_2], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    id_equipo_2 = rows[0].id_equipo;
                    console.log(id_equipo_2);
                    conn.query(sql_id_partido, [id_equipo_1, id_equipo_2, hora_partido, fecha_partido], (err, rows, fields) => {
                        if (err) {
                            res.status(500).json({
                                state: false,
                                message: err
                            });
                        } else {
                            id_partido = rows[0].id_partido;
                            console.log(id_partido);
                            conn.query(sql_update, [fecha_partido, id_partido], (err, rows, fields) => {
                                if (err) {
                                    res.status(500).json({
                                        state: false,
                                        message: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        state: true,
                                        message: "Partido actualizado",
                                        body: rows
                                    });
                                }
                            })

                        }

                    });
                }
            });
        }
    });
});

router.post("/partido/modificar/hora", (req, res) => {

    const nombre_equipo = req.body.nombre_equipo;
    const nombre_equipo_2 = req.body.nombre_equipo_2;
    const fecha_partido = req.body.fecha_partido;
    const hora_partido = req.body.hora_partido;

    var id_partido = 0;

    const sql_id = "SELECT id_equipo FROM EQUIPO WHERE nombre_equipo=?";
    const sql_id_partido = "SELECT id_partido FROM PARTIDO WHERE EQUIPO_id_EQUIPO=? AND EQUIPO_id_equipo_2=? AND fecha_partido=?"
    const sql_update = "UPDATE PARTIDO SET hora_partido=? WHERE id_partido=?";
    const conn = getConnection();

    conn.query(sql_id, [nombre_equipo], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            id_equipo_1 = rows[0].id_equipo;
            console.log(id_equipo_1);
            conn.query(sql_id, [nombre_equipo_2], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    id_equipo_2 = rows[0].id_equipo;
                    console.log(id_equipo_2);
                    conn.query(sql_id_partido, [id_equipo_1, id_equipo_2, fecha_partido], (err, rows, fields) => {
                        if (err) {
                            res.status(500).json({
                                state: false,
                                message: err
                            });
                        } else {
                            id_partido = rows[0].id_partido;
                            console.log(id_partido);
                            conn.query(sql_update, [hora_partido, id_partido], (err, rows, fields) => {
                                if (err) {
                                    res.status(500).json({
                                        state: false,
                                        message: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        state: true,
                                        message: "Partido actualizado",
                                        body: rows
                                    });
                                }
                            })

                        }

                    });
                }
            });
        }
    });
});

router.post("/partido/eliminar", (req, res) => {

    const nombre_equipo = req.body.nombre_equipo;
    const nombre_equipo_2 = req.body.nombre_equipo_2;
    const fecha_partido = req.body.fecha_partido;
    const hora_partido = req.body.hora_partido;

    var id_equipo_1 = 0;
    var id_equipo_2 = 0;
    var id_partido = 0;

    const sql_id = "SELECT id_equipo FROM EQUIPO WHERE nombre_equipo=?";
    const sql_id_partido = "SELECT id_partido FROM PARTIDO WHERE EQUIPO_id_EQUIPO=? AND EQUIPO_id_equipo_2=? AND hora_partido=? AND fecha_partido=?"
    const sql = "DELETE FROM PARTIDO WHERE id_partido=?";

    const conn = getConnection();

    console.log(nombre_equipo);
    console.log(nombre_equipo_2);
    conn.query(sql_id, [nombre_equipo], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            id_equipo_1 = rows[0].id_equipo;
            console.log(id_equipo_1);
            conn.query(sql_id, [nombre_equipo_2], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    id_equipo_2 = rows[0].id_equipo;
                    console.log(id_equipo_2);
                    conn.query(sql_id_partido, [id_equipo_1, id_equipo_2, hora_partido, fecha_partido], (err, rows, fields) => {
                        if (err) {
                            res.status(500).json({
                                state: false,
                                message: err
                            });
                        } else {
                            id_partido = rows[0].id_partido;
                            conn.query(sql, id_partido, (err, rows, fields) => {
                                if (err) {
                                    res.status(500).json({
                                        state: false,
                                        message: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        state: true,
                                        message: "Partido eliminado",
                                        body: rows
                                    });
                                }
                            })

                        }

                    });
                }
            });
        }
    });
});


router.get("/asociados/:nombre_entidad", (req, res) => {

    const nombre_entidad = req.params.nombre_entidad;
    const sql = "SELECT id_usuario, nombre_usuario FROM USUARIO JOIN ROL_USUARIO_ENTIDAD ON USUARIO.id_usuario=ROL_USUARIO_ENTIDAD.USUARIO_id_usuario JOIN ENTIDAD ON ENTIDAD.id_entidad=ROL_USUARIO_ENTIDAD.ENTIDAD_id_entidad WHERE tipo_usuario='Interno' AND nombre_entidad=?"

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
                message: "Fetching all asociates",
                body: rows
            });
        }
    });
});

router.post("/asociados/asignar", (req, res) => {

    const nombre_equipo = req.body[0].nombre_equipo;
    const nombre_equipo_2 = req.body[0].nombre_equipo_2;
    const fecha_partido = req.body[0].fecha_partido;
    const hora_partido = req.body[0].hora_partido;
    const nombre_usuario = req.body[1].nombre_usuario;

    var id_equipo_1 = 0;
    var id_equipo_2 = 0;
    var id_partido = 0;

    const sql_id = "SELECT id_equipo FROM EQUIPO WHERE nombre_equipo=?";
    const sql_id_partido = "SELECT id_partido FROM PARTIDO WHERE EQUIPO_id_EQUIPO=? AND EQUIPO_id_equipo_2=? AND hora_partido=? AND fecha_partido=?"
    const sql = "UPDATE PARTIDO SET asociado_partido=? WHERE EQUIPO_id_EQUIPO=? AND EQUIPO_id_equipo_2=? AND hora_partido=? AND fecha_partido=?";

    const conn = getConnection();

    console.log(nombre_equipo);
    console.log(nombre_equipo_2);
    conn.query(sql_id, [nombre_equipo], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            id_equipo_1 = rows[0].id_equipo;
            console.log(id_equipo_1);
            conn.query(sql_id, [nombre_equipo_2], (err, rows, fields) => {
                if (err) {
                    res.status(500).json({
                        state: false,
                        message: err
                    });
                } else {
                    id_equipo_2 = rows[0].id_equipo;
                    console.log(id_equipo_2);
                    conn.query(sql_id_partido, [id_equipo_1, id_equipo_2, hora_partido, fecha_partido], (err, rows, fields) => {
                        if (err) {
                            res.status(500).json({
                                state: false,
                                message: err
                            });
                        } else {
                            id_partido = rows[0].id_partido;
                            conn.query(sql, [nombre_usuario, id_equipo_1, id_equipo_2, hora_partido, fecha_partido], (err, rows, fields) => {
                                if (err) {
                                    res.status(500).json({
                                        state: false,
                                        message: err
                                    });
                                } else {
                                    return res.status(200).json({
                                        state: true,
                                        message: "Partido actualizado",
                                        body: rows
                                    });
                                }
                            })

                        }

                    });
                }
            });
        }
    });
});


router.get("/user/details/:email_usuario", (req, res) => {

    const email_usuario = req.params.email_usuario;
    const sql = "SELECT nombre_usuario, email_usuario FROM USUARIO WHERE email_usuario=?";

    const conn = getConnection();
    conn.query(sql, [email_usuario], (err, rows, fields) => {
        if (err) {
            res.status(500).json({
                state: false,
                message: err
            });
        } else {
            return res.status(200).json({
                state: true,
                message: "Fetching all details",
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