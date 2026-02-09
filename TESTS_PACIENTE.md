PLAN DE PRUEBAS - ROL PACIENTE
==============================

Objetivo
--------
Verificar HU1-HU10 y HU21-HU25 desde la vista de paciente. Registrar fallos reales
para documentar en los estudios de usabilidad, responsive y accesibilidad.

Formato de registro
-------------------
Para cada prueba, anotar:
- Resultado: OK / ERROR
- Evidencia: captura (nombre de archivo) y pasos
- Observacion: impacto y relacion con skin (base/mejorada/accesible)

Checklist (HU1-HU10)
--------------------
HU1 - Login y proteccion de datos
[ ] 1.1 Login con datos validos (paciente)
    Esperado: redirige a dashboard paciente
[ ] 1.2 Login con campos vacios
    Esperado: bloqueo y mensaje claro
[ ] 1.3 Acceso directo a dashboard sin login
    Esperado: redirige a login

HU2 - Perfil medico
[ ] 2.1 Guardar alergias, cronicas, sangre, medico, notas
    Esperado: persiste y se muestra al recargar

HU3 - Emergencia
[ ] 3.1 Boton SOS con telefono vacio
    Esperado: boton familiar deshabilitado
[ ] 3.2 Guardar telefono y comprobar enlace tel:
    Esperado: habilitado y numero correcto

HU4 - Persistencia
[ ] 4.1 Cerrar y reabrir navegador
    Esperado: datos de perfil y medicacion se mantienen

HU5 - Lista por turno
[ ] 5.1 Registrar medicacion 1 toma
    Esperado: aparece en maniana
[ ] 5.2 Registrar medicacion 2 tomas
    Esperado: aparece en maniana y noche
[ ] 5.3 Registrar medicacion 3 tomas
    Esperado: aparece en maniana, tarde y noche

HU6 - Marcar toma
[ ] 6.1 Marcar como hecho y deshacer
    Esperado: cambia el estado visual y persiste

HU7 - Alertas
[ ] 7.1 Medicacion con duracion <= 3 dias
    Esperado: alerta visible en panel

HU8 - Progreso y adherencia
[ ] 8.1 Grafico y porcentaje se actualizan
    Esperado: porcentaje y barra coherentes

HU9 - Racha
[ ] 9.1 Completar todas las tomas del dia
    Esperado: racha incrementa

HU10 - Buscador
[ ] 10.1 Buscar por texto parcial
    Esperado: filtra la lista

Checklist (HU21-HU25)
---------------------
HU21 - Historial medico
[ ] 21.1 Agregar registro
    Esperado: aparece en tabla y persiste

HU22 - Info oficial
[ ] 22.1 Links externos accesibles
    Esperado: abren en nueva pestaña

HU23 - Farmacias cercanas
[ ] 23.1 Buscar ubicacion valida
    Esperado: resultados cercanos
[ ] 23.2 Buscar ubicacion invalida
    Esperado: mensaje sin resultados

HU24 - Estadisticas generales
[ ] 24.1 Stats totales y tomas
    Esperado: numeros coherentes

HU25 - Consejos
[ ] 25.1 Boton nuevo consejo
    Esperado: cambia el texto

Notas para estudios
-------------------
- Skin base: documentar fricciones (contraste, tamanos, jerarquia).
- Skin mejorada: mostrar mejoras concretas vs base.
- Skin accesible: verificar foco visible, contraste alto, tamanos.
- Responsive: capturas en movil, tablet, desktop y 10 aspectos responsive.

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
