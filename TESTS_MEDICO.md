PLAN DE PRUEBAS - ROL MEDICO
=============================

Objetivo
--------
Verificar HU-M1 a HU-M10 desde la vista de medico. Registrar fallos reales
para documentar en los estudios de usabilidad, responsive y accesibilidad.

Formato de registro
-------------------
Para cada prueba, anotar:
- Resultado: OK / ERROR
- Evidencia: captura (nombre de archivo) y pasos
- Observacion: impacto y relacion con skin (base/mejorada/accesible)

Checklist (HU-M1 a HU-M10)
--------------------------
HU-M1 - Login y proteccion
[ ] M1.1 Login con datos validos (medico)
    Esperado: redirige a dashboard medico
[ ] M1.2 Acceso directo a dashboard medico sin login
    Esperado: redirige a login

HU-M2 - Prescripcion a paciente
[ ] M2.1 Crear receta con paciente existente
    Esperado: aparece en Recetas asignadas del paciente
[ ] M2.2 Editar prescripcion existente
    Esperado: cambios visibles al recargar

HU-M3 - Mensajes a paciente
[ ] M3.1 Enviar mensaje desde medico
    Esperado: aparece en Mensajes del paciente

HU-M4 - Historial medico (consulta)
[ ] M4.1 Buscar paciente por nombre o correo
    Esperado: muestra historial del paciente
[ ] M4.2 Buscar paciente inexistente
    Esperado: mensaje claro de sin resultados

HU-M5 - Seguimiento rapido
[ ] M5.1 Boton "Nuevo seguimiento"
    Esperado: muestra confirmacion

HU-M6 - Acciones en tabla
[ ] M6.1 Botones Revisar/Historial/Contactar
    Esperado: muestran feedback y no fallan

HU-M7 - Persistencia
[ ] M7.1 Recargar pagina
    Esperado: prescripciones y mensajes se mantienen

HU-M8 - Accesibilidad basica
[ ] M8.1 Navegacion por teclado en tabla y botones
    Esperado: foco visible y orden logico

HU-M9 - Responsive
[ ] M9.1 Vista movil (<= 480px)
    Esperado: tabla responde con scroll horizontal

HU-M10 - Skin comparativa
[ ] M10.1 Cambiar skin base/mejorada/accesible
    Esperado: cambios visuales claros y legibles

Registro de fallos
------------------
1)
   - Paso:
   - Resultado esperado:
   - Resultado real:
   - Skin:
   - Captura:

2)
   - Paso:
   - Resultado esperado:
   - Resultado real:
   - Skin:
   - Captura:
