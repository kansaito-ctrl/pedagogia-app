// server.js — backend de Pedagogía (reemplaza el Google Apps Script / Sheets)
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use((req, res, next) => {
  // Chrome bloquea peticiones desde una página normal hacia localhost
  // a menos que el servidor confirme explícitamente este header
  // (Private Network Access). Sin esto, el fetch falla en silencio.
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});
app.use(express.json());

// -------------------------------------------------------------------
// POST /api/estudiantes  -> registra (o reutiliza) un estudiante
// body: { nombre, correo, grupo }
// -------------------------------------------------------------------
app.post("/api/estudiantes", (req, res) => {
  const { nombre, correo, grupo } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta el nombre del estudiante" });

  const insert = db.prepare(
    "INSERT INTO estudiantes (nombre, correo, grupo) VALUES (?, ?, ?)"
  );
  const info = insert.run(nombre, correo || null, grupo || null);
  res.json({ id: info.lastInsertRowid, nombre, correo, grupo });
});

// -------------------------------------------------------------------
// POST /api/tests  -> crea un test (ej. "Test vocacional 2026-1")
// body: { nombre }
// -------------------------------------------------------------------
app.post("/api/tests", (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "Falta el nombre del test" });

  const insert = db.prepare("INSERT INTO tests (nombre) VALUES (?)");
  const info = insert.run(nombre);
  res.json({ id: info.lastInsertRowid, nombre });
});

// -------------------------------------------------------------------
// POST /api/respuestas -> guarda las respuestas de un estudiante
// body: {
//   estudiante_id, test_id,
//   respuestas: [{ seccion, pregunta, respuesta }, ...]
// }
// Esta es la ruta que tu formulario llamará en lugar del Apps Script.
// -------------------------------------------------------------------
app.post("/api/respuestas", (req, res) => {
  const { estudiante_id, test_id, respuestas } = req.body;

  if (!estudiante_id || !test_id || !Array.isArray(respuestas)) {
    return res.status(400).json({
      error: "Se requieren estudiante_id, test_id y un arreglo de respuestas",
    });
  }

  const insert = db.prepare(`
    INSERT INTO respuestas (estudiante_id, test_id, seccion, pregunta, respuesta)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((filas) => {
    for (const r of filas) {
      insert.run(estudiante_id, test_id, r.seccion, r.pregunta, r.respuesta);
    }
  });

  insertMany(respuestas);
  res.json({ ok: true, guardadas: respuestas.length });
});

// -------------------------------------------------------------------
// GET /api/respuestas/:estudiante_id -> consulta rápida (útil para demo)
// -------------------------------------------------------------------
app.get("/api/respuestas/:estudiante_id", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM respuestas WHERE estudiante_id = ?")
    .all(req.params.estudiante_id);
  res.json(rows);
});

// -------------------------------------------------------------------
// POST /api/submit -> coincide EXACTO con lo que ya manda el form de
// Pedagogía: { alumno_id, respuestas: { pregunta_id: valor, ... } }
// Reemplaza la llamada al Google Apps Script / Sheets.
// -------------------------------------------------------------------
app.post("/api/submit", (req, res) => {
  const { alumno_id, respuestas } = req.body;

  if (!alumno_id || typeof respuestas !== "object" || respuestas === null) {
    return res.status(400).json({ success: false, message: "Faltan alumno_id o respuestas" });
  }

  const insert = db.prepare(`
    INSERT INTO respuestas_alumno (alumno_id, pregunta_id, respuesta)
    VALUES (?, ?, ?)
  `);

  const insertMany = db.transaction((entries) => {
    for (const [pregunta_id, respuesta] of entries) {
      insert.run(alumno_id, pregunta_id, String(respuesta));
    }
  });

  insertMany(Object.entries(respuestas));
  res.json({ success: true, guardadas: Object.keys(respuestas).length });
});

// -------------------------------------------------------------------
// GET /api/submit/:alumno_id -> ver las respuestas guardadas de un alumno
// -------------------------------------------------------------------
app.get("/api/submit/:alumno_id", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM respuestas_alumno WHERE alumno_id = ?")
    .all(req.params.alumno_id);
  res.json(rows);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor de Pedagogía corriendo en http://localhost:${PORT}`);
});
