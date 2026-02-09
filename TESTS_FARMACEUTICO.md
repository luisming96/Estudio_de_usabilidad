PLAN DE PRUEBAS - ROL FARMACEUTICO
==================================

Objetivo
--------
Verificar HU-F1 a HU-F10 desde la vista de farmaceutico. Registrar fallos reales
para documentar en los estudios de usabilidad, responsive y accesibilidad.

Formato de registro
-------------------
Para cada prueba, anotar:
- Resultado: OK / ERROR
- Evidencia: captura (nombre de archivo) y pasos
- Observacion: impacto y relacion con skin (base/mejorada/accesible)

Checklist (HU-F1 a HU-F10)
--------------------------
HU-F1 - Login y proteccion
[ ] F1.1 Login con datos validos (farmaceutico)
    Esperado: redirige a dashboard farmaceutico
[ ] F1.2 Acceso directo a dashboard farmaceutico sin login
    Esperado: redirige a login

HU-F2 - Gestion de stock
[ ] F2.1 Agregar medicamento y cantidad
    Esperado: aparece en la tabla de stock
[ ] F2.2 Agregar un medicamento existente
    Esperado: se actualiza la cantidad o se agrega fila coherente

HU-F3 - Dispensaciones
[ ] F3.1 Registrar dispensacion
    Esperado: aparece en historial de dispensaciones

HU-F4 - Avisos
[ ] F4.1 Crear aviso desde farmacia
    Esperado: aparece en alertas del paciente

HU-F5 - Interacciones
[ ] F5.1 Botones de mensajes pendientes
    Esperado: feedback visible sin errores

HU-F6 - Persistencia
[ ] F6.1 Recargar pagina
    Esperado: stock y dispensaciones se mantienen

HU-F7 - Accesibilidad basica
[ ] F7.1 Navegacion por teclado en formularios
    Esperado: foco visible y orden logico

HU-F8 - Responsive
[ ] F8.1 Vista movil (<= 480px)
    Esperado: tablas y cards se ajustan

HU-F9 - Skin comparativa
[ ] F9.1 Cambiar skin base/mejorada/accesible
    Esperado: cambios visuales claros y legibles

HU-F10 - Enlaces y alertas
[ ] F10.1 Centro de alertas muestra avisos
    Esperado: aparece el aviso de farmacia

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
