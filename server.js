const express = require("express");
const sqlite3 = require("sqlite3").verbose(); // Importar sqlite3
const fs = require("fs"); // Importar fs para leer archivos
const cors = require("cors");

const app = express();
app.use(cors()); // Habilitar CORS
app.use(express.static("public"));
app.use(express.json()); // Middleware para parsear JSON

// Crear y conectar a la base de datos SQLite
const db = new sqlite3.Database("./usuarios.db", (err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err.message);
    } else {
        console.log("Conectado a la base de datos SQLite.");   
    }
});

// Ejecutar el script de inicialización al conectar
fs.readFile("init.sql", "utf8", (err, sql) => {
    if (err) {
        console.error("Error al leer el archivo init.sql:", err.message);
    } else {
        // Ejecutar el contenido del archivo SQL
        db.exec(sql, (err) => {
            if (err) {
                console.error("Error al ejecutar el script de inicialización:", err.message);
            } else {
                console.log("Base de datos inicializada correctamente.");
            }
        });
    }
});

// Ruta principal
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Ruta para obtener todos los puntajes
app.get("/scores", (req, res) => {
    db.all("SELECT * FROM scores", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ scores: rows });
    });
});

app.get("/scores/:id", (req, res) => {
    const { id } = req.params;
    db.all("SELECT * FROM scores WHERE id = ?", [id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ scores: rows });
    });
});

// Ruta para agregar un nuevo puntaje
app.post("/scores", (req, res) => {
    const { name, score } = req.body;
    const stmt = db.prepare("INSERT INTO scores (name, score) VALUES (?, ?)");

    stmt.run(name, score, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({
            id: this.lastID,
            name: name,
            score: score
        });
    });

    stmt.finalize();
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log("El servidor está corriendo en el puerto 3000");
});
