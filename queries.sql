-- ============================================================
-- CONSULTAS ÚTILES — Pedagogía (respuestas_alumno)
-- Cópialas una por una en la pestaña "Execute SQL" de DB Browser
-- y dale al botón de "Play" (▶) para correrlas.
-- ============================================================

-- 1) ¿Cuántos alumnos distintos han contestado el test?
SELECT COUNT(DISTINCT alumno_id) AS total_alumnos
FROM respuestas_alumno;


-- 2) Lista de todos los alumnos que han contestado, con fecha
--    de su última respuesta (para ver quién ya terminó)
SELECT alumno_id, MAX(creado_en) AS ultima_respuesta, COUNT(*) AS respuestas_guardadas
FROM respuestas_alumno
GROUP BY alumno_id
ORDER BY ultima_respuesta DESC;


-- 3) Todas las respuestas de UN alumno específico
--    (cambia el ID por el que quieras consultar)
SELECT pregunta_id, respuesta, creado_en
FROM respuestas_alumno
WHERE alumno_id = '000012345'
ORDER BY pregunta_id;


-- 4) Cuántas respuestas hay guardadas por sección del test
--    (fm=Físico-Matemático, cb=Ciencias Bio/Química/Salud, cs=Ciencias Sociales,
--     hu=Humanidades, pd=Pensamiento, ad=Adaptación, es=Estrés, an=Ansiedad, hs=Hab. Sociales)
SELECT
  CASE
    WHEN pregunta_id LIKE 'fm%' THEN 'Físico Matemático'
    WHEN pregunta_id LIKE 'cb%' THEN 'Ciencias Bio/Química/Salud'
    WHEN pregunta_id LIKE 'cs%' THEN 'Ciencias Sociales'
    WHEN pregunta_id LIKE 'hu%' THEN 'Humanidades'
    WHEN pregunta_id LIKE 'pd%' THEN 'Pensamiento y Decisiones'
    WHEN pregunta_id LIKE 'ad%' THEN 'Adaptación al Entorno'
    WHEN pregunta_id LIKE 'es%' THEN 'Estrés'
    WHEN pregunta_id LIKE 'an%' THEN 'Ansiedad'
    WHEN pregunta_id LIKE 'hs%' THEN 'Habilidades Sociales'
  END AS seccion,
  COUNT(*) AS total_respuestas
FROM respuestas_alumno
GROUP BY seccion
ORDER BY total_respuestas DESC;


-- 5) Promedio de puntaje por alumno en las secciones que usan
--    números (fm, cb, cs, hu) — útil para ver afinidad vocacional
SELECT
  alumno_id,
  ROUND(AVG(CAST(respuesta AS REAL)), 2) AS promedio_fisico_matematico
FROM respuestas_alumno
WHERE pregunta_id LIKE 'fm%'
GROUP BY alumno_id
ORDER BY promedio_fisico_matematico DESC;

-- (cambia 'fm%' por 'cb%', 'cs%' o 'hu%' para ver el promedio de esas otras secciones)


-- 6) Ver la distribución de respuestas de estrés/ansiedad
--    (útil para detectar patrones, ya que son texto: "Siempre", "A veces", "Nunca")
SELECT respuesta, COUNT(*) AS veces
FROM respuestas_alumno
WHERE pregunta_id LIKE 'es%'
GROUP BY respuesta
ORDER BY veces DESC;
