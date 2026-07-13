// server.js — backend de Pedagogía (reemplaza el Google Apps Script / Sheets)
const express = require("express");
const cors = require("cors");
const path = require("path");
const { db, initDb } = require("./db");

const app = express();
app.use(cors());
app.use((req, res, next) => {
  // Chrome bloquea peticiones desde una página normal hacia un servidor
  // local a menos que este confirme explícitamente este header.
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});
app.use(express.json());

// Sirve el frontend (index.html) directo desde este mismo servidor.
// Así el form y la API viven en la MISMA dirección — sin CORS, sin
// tener que desplegar dos cosas por separado.
app.use(express.static(path.join(__dirname, "public")));

// -------------------------------------------------------------------
// POST /api/estudiantes  -> registra (o reutiliza) un estudiante
// -------------------------------------------------------------------
app.post("/api/estudiantes", async (req, res) => {
  const { nombre, correo, grupo } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta el nombre del estudiante" });

  const result = await db.execute({
    sql: "INSERT INTO estudiantes (nombre, correo, grupo) VALUES (?, ?, ?)",
    args: [nombre, correo || null, grupo || null],
  });
  res.json({ id: Number(result.lastInsertRowid), nombre, correo, grupo });
});

// -------------------------------------------------------------------
// POST /api/tests  -> crea un test (ej. "Test vocacional 2026-1")
// -------------------------------------------------------------------
app.post("/api/tests", async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta el nombre del test" });

  const result = await db.execute({
    sql: "INSERT INTO tests (nombre) VALUES (?)",
    args: [nombre],
  });
  res.json({ id: Number(result.lastInsertRowid), nombre });
});

// -------------------------------------------------------------------
// POST /api/submit -> coincide EXACTO con lo que manda el form de
// Pedagogía: { alumno_id, respuestas: { pregunta_id: valor, ... } }
// -------------------------------------------------------------------
app.post("/api/submit", async (req, res) => {
  const { alumno_id, respuestas } = req.body;

  if (!alumno_id || typeof respuestas !== "object" || respuestas === null) {
    return res.status(400).json({ success: false, message: "Faltan alumno_id o respuestas" });
  }

  const entries = Object.entries(respuestas);

  try {
    await db.batch(
      entries.map(([pregunta_id, respuesta]) => ({
        sql: "INSERT INTO respuestas_alumno (alumno_id, pregunta_id, respuesta) VALUES (?, ?, ?)",
        args: [alumno_id, pregunta_id, String(respuesta)],
      })),
      "write"
    );
    res.json({ success: true, guardadas: entries.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al guardar en la base de datos" });
  }
});

// -------------------------------------------------------------------
// GET /api/submit/:alumno_id -> ver las respuestas guardadas de un alumno
// -------------------------------------------------------------------
app.get("/api/submit/:alumno_id", async (req, res) => {
  const result = await db.execute({
    sql: "SELECT * FROM respuestas_alumno WHERE alumno_id = ?",
    args: [req.params.alumno_id],
  });
  res.json(result.rows);
});

// -------------------------------------------------------------------
// GET /api/stats -> resumen rápido: cuántos alumnos han contestado
// -------------------------------------------------------------------
app.get("/api/stats", async (req, res) => {
  const result = await db.execute(
    "SELECT COUNT(DISTINCT alumno_id) AS total_alumnos, COUNT(*) AS total_respuestas FROM respuestas_alumno"
  );
  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor de Pedagogía corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo inicializar la base de datos:", err);
    process.exit(1);
  });
