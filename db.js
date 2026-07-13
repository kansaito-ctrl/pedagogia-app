// db.js — conexión y esquema de la base de datos
//
// Usa @libsql/client, que funciona en DOS modos con el mismo código:
//  1) LOCAL (para probar en tu compu): si no defines variables de entorno,
//     usa un archivo local "pedagogia.db", igual que antes.
//  2) EN LA NUBE (para que otros lo usen): si defines TURSO_DATABASE_URL
//     y TURSO_AUTH_TOKEN (de tu cuenta gratis en turso.tech), los datos
//     se guardan en un servidor real y persisten aunque tu app se reinicie.

const { createClient } = require("@libsql/client");

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:pedagogia.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

async function initDb() {
  await db.executeMultiple(`
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
      creado_en TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS respuestas_alumno (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alumno_id TEXT NOT NULL,
      pregunta_id TEXT NOT NULL,
      respuesta TEXT NOT NULL,
      creado_en TEXT DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { db, initDb };
