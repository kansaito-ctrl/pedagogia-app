// db.js — conexión y esquema de la base de datos SQLite
// No necesitas instalar ningún motor de base de datos: SQLite vive en un
// solo archivo (pedagogia.db) que se crea solo la primera vez que corres el servidor.

const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "pedagogia.db"));
db.pragma("journal_mode = WAL");

// --- Esquema ---
// estudiantes: quién contestó el test
// tests: cada aplicación de un test vocacional (por si hay varias versiones)
// secciones: las secciones dentro de un test (ej. "Intereses", "Aptitudes")
// respuestas: cada respuesta individual, ligada a estudiante + sección + pregunta

db.exec(`
  CREATE TABLE IF NOT EXISTS estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT,
    grupo TEXT,
    creado_en TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    creado_en TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS respuestas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    seccion TEXT NOT NULL,
    pregunta TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    creado_en TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (test_id) REFERENCES tests(id)
  );

  -- Tabla simple que coincide con el formato que ya manda el formulario
  -- de Pedagogía: { alumno_id, respuestas: { pregunta_id: valor, ... } }
  CREATE TABLE IF NOT EXISTS respuestas_alumno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alumno_id TEXT NOT NULL,
    pregunta_id TEXT NOT NULL,
    respuesta TEXT NOT NULL,
    creado_en TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
