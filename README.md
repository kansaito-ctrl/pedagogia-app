# Backend de Pedagogía (Node + Express + SQLite)

Reemplaza el backend de Google Sheets/Apps Script por una base de datos
propia. SQLite no requiere instalar ningún motor: se crea solo, como un
archivo `pedagogia.db` en esta misma carpeta.

## Cómo correrlo

```bash
npm install
npm start
```

Esto levanta el servidor en `http://localhost:3000`.

## Endpoints

| Método | Ruta                          | Para qué sirve                                   |
|--------|-------------------------------|---------------------------------------------------|
| POST   | `/api/estudiantes`            | Registrar un estudiante (nombre, correo, grupo)   |
| POST   | `/api/tests`                  | Crear un test vocacional                          |
| POST   | `/api/respuestas`             | Guardar las respuestas de un estudiante            |
| GET    | `/api/respuestas/:estudiante_id` | Ver las respuestas guardadas de un estudiante  |

## Cómo conectar tu formulario (en vez de Apps Script)

Donde antes hacías `fetch` al URL del Apps Script de Google, ahora apuntas
a tu servidor local:

```js
// Antes (Google Apps Script / Sheets):
// fetch("https://script.google.com/macros/s/XXXX/exec", { method: "POST", body: ... })

// Ahora (tu propio backend):
async function guardarRespuestas(estudianteId, testId, respuestas) {
  const res = await fetch("http://localhost:3000/api/respuestas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      estudiante_id: estudianteId,
      test_id: testId,
      respuestas: respuestas, // [{ seccion, pregunta, respuesta }, ...]
    }),
  });
  return res.json();
}
```

## Esquema de la base de datos

- **estudiantes**: id, nombre, correo, grupo
- **tests**: id, nombre (cada aplicación del test vocacional)
- **respuestas**: id, estudiante_id, test_id, seccion, pregunta, respuesta

Todo vive en `db.js` — si necesitas agregar más campos o tablas
(por ejemplo, resultados calculados o categorías vocacionales),
es cuestión de agregar el `CREATE TABLE` ahí.

## Para mostrarlo en clase

1. `npm install && npm start`
2. Abre otra terminal y prueba con curl o Postman:
   ```bash
   curl -X POST localhost:3000/api/estudiantes \
     -H "Content-Type: application/json" \
     -d '{"nombre":"Ana Pérez","correo":"ana@mail.com","grupo":"3A"}'
   ```
3. El archivo `pedagogia.db` que aparece en la carpeta ES tu base de datos —
   puedes abrirlo con "DB Browser for SQLite" para enseñarle las tablas al profe.
